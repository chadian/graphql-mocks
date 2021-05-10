import { GraphQLObjectType } from 'graphql';
import { Document, DocumentPartial, OperationContext } from '../types';
import { createDocument } from '../utils/create-document';
import { extractObjectTypes } from '../utils/graphql/extract-object-types';
import { isDocument } from '../utils/is-document';
import { connectOperation } from './connect';

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

  for (const prop in document) {
    const docPropValue = document[prop];
    const field = gqlTypeFields[prop];
    const possibleObjectTypes = extractObjectTypes(schema, field.type);

    if (field && possibleObjectTypes.length > 0 && isDocument(docPropValue)) {
      // been moved to a document connection instead, no longer needed as a document value
      delete document[prop];
      connectOperation(context, [document, prop], [docPropValue]);
    }
  }

  return document;
}

// Only used for generating type after the resulting `bind`
const bound = createOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
