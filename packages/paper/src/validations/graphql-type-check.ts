import {
  GraphQLField,
  GraphQLSchema,
  isListType,
  isNonNullType,
  isNullableType,
  isObjectType,
  isScalarType,
} from 'graphql';
import { Document } from '../types';
import { getConnections } from '../utils/get-connections';
import { extractListType } from '../utils/graphql/extract-list-type';
import { typeExists } from '../utils/graphql/type-exists';
import { FieldDoesNotExistOnType } from './errors/field-does-not-exist-on-type';
import { FieldDuplicateWithConnection } from './errors/field-duplicate-with-connection';
import { FieldReturnTypeMismatch } from './errors/field-return-type-mismatch';
import { TypeDoesNotExist } from './errors/type-does-not-exist';
import { TypeIsNotDocumentCompatible } from './errors/type-is-not-document-compatible';

type Options = { graphqlSchema: GraphQLSchema; typename: string; document: Document };

interface FieldValidator {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validate(parts: { graphqlField: GraphQLField<any, any>; fieldValue: any }): void;
}

const objectFieldValidator: FieldValidator = {
  validate({ graphqlField, fieldValue }) {
    if (isObjectType(graphqlField.type) && typeof fieldValue !== 'object') {
      throw new FieldReturnTypeMismatch({
        field: graphqlField,
        expected: 'object',
        actual: typeof fieldValue,
      });
    }
  },
};

const scalarFieldValidator: FieldValidator = {
  validate({ graphqlField, fieldValue }) {
    const jsScalars = ['boolean', 'number', 'string'];
    if (isScalarType(graphqlField.type) && !jsScalars.includes(typeof fieldValue)) {
      throw new FieldReturnTypeMismatch({
        field: graphqlField,
        expected: 'boolean, number, string',
        actual: typeof fieldValue,
      });
    }
  },
};

const listFieldValidator: FieldValidator = {
  validate({ graphqlField, fieldValue }) {
    if (isListType(graphqlField.type)) {
      if (!Array.isArray(fieldValue)) {
        throw new FieldReturnTypeMismatch({
          field: graphqlField,
          expected: 'Array',
          actual: typeof fieldValue,
        });
      }

      const nullishIndex = fieldValue.findIndex((element) => element == null);
      const listType = extractListType(graphqlField.type);
      const isNullable = isNullableType(listType?.ofType);

      if (!isNullable && nullishIndex !== -1) {
        throw new FieldReturnTypeMismatch({
          field: graphqlField,
          expected: 'non-null list',
          actual: `${fieldValue[nullishIndex]} in the array`,
        });
      }
    }
  },
};

const nonNullFieldValidator: FieldValidator = {
  validate({ graphqlField, fieldValue }) {
    if (isNonNullType(graphqlField.type)) {
      if (fieldValue == null) {
        throw new FieldReturnTypeMismatch({
          field: graphqlField,
          expected: 'non-null',
          actual: fieldValue === undefined ? 'undefined' : 'null',
        });
      }
    }
  },
};

export function graphqlTypeCheck({ graphqlSchema, typename, document }: Options): void {
  if (!typeExists(graphqlSchema, typename)) {
    throw new TypeDoesNotExist({ typename });
  }

  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const type = graphqlSchema.getType(typename)!;

  if (!isObjectType(type)) {
    throw new TypeIsNotDocumentCompatible({ type });
  }

  const graphqlTypeFields = type.getFields();
  const documentConnections = getConnections(document);

  for (const documentField in document) {
    const fieldValue = document[documentField];
    const connectionFieldValue = documentConnections[documentField];

    const fieldExistsOnType = documentField in graphqlTypeFields;
    if (!fieldExistsOnType) {
      throw new FieldDoesNotExistOnType({ type, fieldName: documentField });
    }

    const hasFieldValueAndConnectionValue = fieldValue && connectionFieldValue;
    if (hasFieldValueAndConnectionValue) {
      throw new FieldDuplicateWithConnection({ type, fieldName: documentField });
    }

    const graphqlField = graphqlTypeFields[documentField];
    const fieldValidators = [objectFieldValidator, scalarFieldValidator, listFieldValidator, nonNullFieldValidator];
    fieldValidators.forEach((validator) => validator.validate({ graphqlField, fieldValue }));
  }
}
