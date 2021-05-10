import {
  GraphQLField,
  GraphQLObjectType,
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
  /**
   * Skip when the field is represented by a connected value on the document
   */
  skipConnectedValue: boolean;

  /**
   * Skip when the field is represented by a null or undefined value on the document
   */
  skipNullValue: boolean;

  validate(parts: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: GraphQLObjectType<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    field: GraphQLField<any, any>;
    document: Document;
    fieldName: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fieldValue: any;
  }): void;
}

interface DocumentTypeValidator {
  validate(parts: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    type: GraphQLObjectType<any>;
    document: Document;
    graphqlSchema: GraphQLSchema;
  }): void;
}

const objectFieldValidator: FieldValidator = {
  skipConnectedValue: true,
  skipNullValue: true,
  validate({ field, fieldValue }) {
    if (isObjectType(field.type) && typeof fieldValue !== 'object') {
      throw new FieldReturnTypeMismatch({
        field: field,
        expected: 'object',
        actual: typeof fieldValue,
      });
    }
  },
};

const scalarFieldValidator: FieldValidator = {
  skipConnectedValue: false,
  skipNullValue: true,
  validate({ field, fieldValue }) {
    const jsScalars = ['boolean', 'number', 'string'];
    if (isScalarType(field.type) && !jsScalars.includes(typeof fieldValue)) {
      throw new FieldReturnTypeMismatch({
        field: field,
        expected: 'boolean, number, string',
        actual: typeof fieldValue,
      });
    }
  },
};

const listFieldValidator: FieldValidator = {
  skipConnectedValue: true,
  skipNullValue: true,
  validate({ field, fieldValue }) {
    if (isListType(field.type)) {
      if (!Array.isArray(fieldValue)) {
        throw new FieldReturnTypeMismatch({
          field: field,
          expected: 'Array',
          actual: typeof fieldValue,
        });
      }

      const nullishIndex = fieldValue.findIndex((element) => element == null);
      const listType = extractListType(field.type);
      const isNullable = isNullableType(listType?.ofType);

      if (!isNullable && nullishIndex !== -1) {
        throw new FieldReturnTypeMismatch({
          field: field,
          expected: 'non-null list',
          actual: `${fieldValue[nullishIndex]} in the array`,
        });
      }
    }
  },
};

const nonNullFieldValidator: FieldValidator = {
  skipConnectedValue: true,
  skipNullValue: false,
  validate({ field, fieldValue }) {
    if (isNonNullType(field.type)) {
      if (fieldValue == null) {
        throw new FieldReturnTypeMismatch({
          field: field,
          expected: 'non-null',
          actual: fieldValue === undefined ? 'undefined' : 'null',
        });
      }
    }
  },
};

const fieldValueAndConnectionValueValidator: FieldValidator = {
  skipConnectedValue: false,
  skipNullValue: false,
  validate({ type, fieldName, fieldValue, document }) {
    const documentConnections = getConnections(document);
    const connectionFieldValue = documentConnections[fieldName];
    const hasFieldValueAndConnectionValue = fieldValue && connectionFieldValue;
    if (hasFieldValueAndConnectionValue) {
      throw new FieldDuplicateWithConnection({ type, fieldName });
    }
  },
};

const documentOnlyHasFieldsOnTypeValidator: DocumentTypeValidator = {
  validate({ document, type }) {
    const documentFieldNames = Object.keys(document);
    const typeFieldNames = Object.keys(type.getFields());
    const nonExistingFieldName = documentFieldNames.find((fieldName) => !typeFieldNames.includes(fieldName));

    if (nonExistingFieldName) {
      throw new FieldDoesNotExistOnType({ type, fieldName: nonExistingFieldName });
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

  documentOnlyHasFieldsOnTypeValidator.validate({ document, type, graphqlSchema });

  const graphqlTypeFields = type.getFields();

  for (const fieldName in graphqlTypeFields) {
    const field = graphqlTypeFields[fieldName];
    const fieldValue = document[fieldName];
    const hasConnectedValue = getConnections(document)[fieldName];

    const fieldValidators = [
      fieldValueAndConnectionValueValidator,
      objectFieldValidator,
      scalarFieldValidator,
      listFieldValidator,
      nonNullFieldValidator,
    ];

    fieldValidators.forEach((validator) => {
      if (validator.skipConnectedValue && hasConnectedValue) {
        return;
      }

      if (validator.skipNullValue && fieldValue == null) {
        return;
      }

      validator.validate({ type, field, document, fieldName: field.name, fieldValue });
    });
  }
}
