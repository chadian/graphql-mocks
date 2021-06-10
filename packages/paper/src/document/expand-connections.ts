import { GraphQLSchema } from 'graphql';
import { Document, DocumentStore } from '../types';
import { createConnectionProxy } from './create-connection-proxy';

export function expandConnections(schema: GraphQLSchema, store: DocumentStore): void {
  for (const typeName in store) {
    if (Array.isArray(store[typeName])) {
      store[typeName] = store[typeName].map((document: Document) =>
        createConnectionProxy(schema, store, document, { writable: true }),
      );
    }
  }
}
