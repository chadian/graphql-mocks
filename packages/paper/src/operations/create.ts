import { GraphQLNamedType, GraphQLObjectType } from 'graphql';
import { Document, DocumentPartial, OperationContext } from '../types';
import { createDocument } from '../utils/create-document';
import { extractObjectTypes } from '../utils/graphql/extract-object-types';
import { unwrap } from '../utils/graphql/unwrap';

export function createOperation(
  context: OperationContext,
  typename: string,
  documentPartial: DocumentPartial,
): Document {
  const { store, schema } = context;
  const document = createDocument(typename, documentPartial);
  const gqlType = schema.getType(typename) as Partial<GraphQLObjectType>;
  const gqlTypeFields = (gqlType?.getFields && gqlType?.getFields()) ?? {};

  // setup array of types if it doesn't already exist
  store[typename] = store[typename] || [];
  store[typename].push(document);

  for (const fieldName in document) {
    const field = gqlTypeFields[fieldName];
    const documentFieldValue = document[fieldName];
    const possibleObjectTypes = extractObjectTypes(schema, field.type);

    // TODO: Handle List document values
    if (field && documentFieldValue && possibleObjectTypes.length === 1) {
      const fieldDocument = createOperation(context, (unwrap(field.type) as GraphQLNamedType).name, documentFieldValue);
      document[fieldName] = fieldDocument;
    }
  }

  return document;
}
