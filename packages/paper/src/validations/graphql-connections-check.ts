import { GraphQLObjectType, GraphQLSchema, isNonNullType, isObjectType } from 'graphql';
import { DataStore, Document } from '../types';
import { findDocumentForType } from '../utils/find-document-for-type';
import { getConnections } from '../utils/get-connections';
import { extractListType } from '../utils/graphql/extract-list-type';
import { typeExists } from '../utils/graphql/type-exists';
import { unwrap } from '../utils/graphql/unwrap';
import { FieldCannotConnectMultiple } from './errors/field-cannot-connect-multiple';
import { FieldDoesNotExistOnType } from './errors/field-does-not-exist-on-type';
import { FieldReturnTypeMismatch } from './errors/field-return-type-mismatch';
import { TypeDoesNotExist } from './errors/type-does-not-exist';
import { TypeIsNotDocumentCompatible } from './errors/type-is-not-document-compatible';

type Options = {
  graphqlSchema: GraphQLSchema;
  typename: string;
  document: Document;
  data: DataStore;
};

function checkNonNullField({ graphqlSchema, typename, document }: Options) {
  const type = graphqlSchema.getType(typename);
  const graphqlTypeFields = (type as GraphQLObjectType).getFields();
  const documentConnections = getConnections(document);

  for (const graphqlField in graphqlTypeFields) {
    const hasDocumentFieldValue = document[graphqlField] != undefined;
    const hasDocumentConnectionValue = documentConnections[graphqlField];
    const fieldType = graphqlTypeFields[graphqlField].type;
    const isNonNullFieldType = isNonNullType(fieldType);
    const unwrappedFieldType = unwrap(fieldType);
    const isFieldObjectType = isObjectType(unwrappedFieldType);

    if (!hasDocumentFieldValue && !hasDocumentConnectionValue && isNonNullFieldType && isFieldObjectType) {
      throw new FieldReturnTypeMismatch({
        field: graphqlTypeFields[graphqlField],
        actual: 'undefined or null',
        expected: `non-null ${unwrappedFieldType}`,
      });
    }
  }
}

export function graphqlConnectionsCheck(options: Options): void {
  const { graphqlSchema, typename, document, data } = options;

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

  checkNonNullField(options);

  for (const documentConnectionField in documentConnections) {
    if (!graphqlTypeFields[documentConnectionField]) {
      throw new FieldDoesNotExistOnType({ type, fieldName: documentConnectionField });
    }

    const fieldDocumentKeys = Array.from(documentConnections[documentConnectionField]);
    const graphqlField = graphqlTypeFields[documentConnectionField];

    const containsObjectType = isObjectType(unwrap(graphqlField.type));

    if (!containsObjectType) {
      throw new FieldReturnTypeMismatch({
        field: graphqlField,
        actual: graphqlField.toString(),
        expected: 'object type or list of object types',
      });
    }

    if (!extractListType(graphqlField.type) && fieldDocumentKeys.length > 1) {
      throw new FieldCannotConnectMultiple({ type, field: graphqlField });
    }

    for (const documentKey of fieldDocumentKeys) {
      const connectedDocument = findDocumentForType(data, typename, documentKey);

      if (!connectedDocument) {
        throw new Error(`Connected document with key ${documentKey} was not found on the expected type ${typename}`);
      }
    }
  }
}
