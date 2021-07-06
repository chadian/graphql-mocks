import { GraphQLSchema } from 'graphql';
import { createConnectionProxy } from '../document/create-connection-proxy';
import { isDocument } from '../document/is-document';
import { nullDocument } from '../document/null-document';
import { findDocument } from '../store/find-document';
import { Document, DocumentStore, AllowedTransactionCallbackReturnTypes } from '../types';

function processReturnable(
  item: Document | undefined | null,
  { schema, store }: { schema: GraphQLSchema; store: DocumentStore },
): Document | undefined | null {
  if (item === nullDocument || item === null) {
    return null;
  }

  if (isDocument(item)) {
    return createConnectionProxy(schema, store, item);
  }

  return item;
}

export function convertResultKeysToDocument(
  schema: GraphQLSchema,
  store: DocumentStore,
  result: null | undefined | string | string[] | Record<string, string>,
): AllowedTransactionCallbackReturnTypes {
  if (result === undefined || result === null) {
    return result;
  }

  if (typeof result === 'string') {
    const key = result;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const document = findDocument(store, key)!;
    return processReturnable(document, { store, schema });
  }

  if (Array.isArray(result)) {
    const processed = result.map((key) => {
      const document = findDocument(store, key);
      return processReturnable(document, { store, schema });
    });

    return processed;
  }

  if (typeof result === 'object') {
    const processed: Record<string, Document> = {};

    for (const key in result) {
      const documentKey = (result as Record<string, string>)[key];
      const document = findDocument(store, documentKey);
      (processed as Record<string, Document | null | undefined>)[key] = processReturnable(document, { store, schema });
    }

    return processed;
  }
}
