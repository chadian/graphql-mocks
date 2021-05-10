import { GraphQLField, GraphQLSchema, isListType, isNonNullType, isObjectType, isScalarType } from 'graphql';
import { Document } from '../types';
import { getConnections } from '../utils/get-connections';
import { typeExists } from '../utils/graphql/type-exists';
import { FieldDoesNotExistOnType } from './errors/field-does-not-exist-on-type';
import { FieldDuplicateWithConnection } from './errors/field-duplicate-with-connection';
import { FieldReturnTypeMismatch } from './errors/field-return-type-mismatch';
import { TypeDoesNotExist } from './errors/type-does-not-exist';
import { TypeIsNotDocumentCompatible } from './errors/type-is-not-document-compatible';

type Options = { graphqlSchema: GraphQLSchema; typename: string; document: Document };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function checkFieldType(field: GraphQLField<any, any>, subject: any) {
  const subjectJsType = typeof subject;
  const graphqlType = field.type;

  if (isObjectType(graphqlType) && subjectJsType !== 'object') {
    throw new FieldReturnTypeMismatch({
      field,
      expected: 'object',
      actual: subjectJsType,
    });
  }

  if (isScalarType(graphqlType) && !['boolean', 'string', 'number'].includes(subjectJsType)) {
    throw new FieldReturnTypeMismatch({
      field,
      expected: 'boolean, string, number',
      actual: subjectJsType,
    });
  }

  if (isListType(graphqlType)) {
    if (!Array.isArray(subject)) {
      throw new FieldReturnTypeMismatch({
        field,
        expected: 'Array',
        actual: subjectJsType,
      });
    }

    const nullishIndex = subject.findIndex((element) => element == null);
    if (nullishIndex !== -1) {
      throw new FieldReturnTypeMismatch({
        field,
        expected: 'non-null list',
        actual: `${subject[nullishIndex]} in the array`,
      });
    }
  }

  if (isNonNullType(graphqlType)) {
    if (subject == null) {
      throw new FieldReturnTypeMismatch({
        field,
        expected: 'non-null',
        actual: subject === undefined ? 'undefined' : 'null',
      });
    }
  }
}

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
    if (!(documentField in graphqlTypeFields)) {
      throw new FieldDoesNotExistOnType({ type, fieldName: documentField });
    }

    const graphqlField = graphqlTypeFields[documentField];
    const documentFieldValue = document[documentField];
    const connectionFieldValue = documentConnections[documentField];

    if (documentFieldValue && connectionFieldValue) {
      throw new FieldDuplicateWithConnection({ type, fieldName: documentField });
    }

    // field represented by a connection, skip
    if (connectionFieldValue) {
      continue;
    }

    checkFieldType(graphqlField, documentFieldValue);
  }
}
