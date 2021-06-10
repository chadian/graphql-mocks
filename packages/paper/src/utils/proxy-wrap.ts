import { GraphQLSchema } from 'graphql';
import { DocumentStore } from '../types';
import { createConnectionProxy } from './create-connection-proxy';

export function proxyWrap(schema: GraphQLSchema, originalStore: DocumentStore): DocumentStore {
  const store = {
    ...originalStore,
  };

  for (const type in store) {
    if (Array.isArray(store[type])) {
      store[type] = store[type].map((document) => createConnectionProxy(schema, store, document));
    }
  }

  return Object.freeze(store);
}