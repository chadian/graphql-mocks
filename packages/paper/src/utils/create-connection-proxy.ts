import { GraphQLObjectType, GraphQLSchema, isNonNullType } from 'graphql';
import { DocumentStore, Document } from '../types';
import { getConnections } from '../utils/get-connections';
import { findDocument } from './find-document';
import { extractListType } from './graphql/extract-list-type';
import { extractObjectTypes } from './graphql/extract-object-types';
import { isNullDocument } from './null-document';

export function createConnectionProxy(
  schema: GraphQLSchema,
  store: DocumentStore,
  document: Document,
  options?: { writable: boolean },
): Document {
  const writable = options?.writable ?? false;

  return new Proxy(document, {
    get(document, prop) {
      if (Reflect.has(document, prop) || typeof prop !== 'string') {
        return Reflect.get(document, prop);
      }

      const type = schema.getType(document.__typename ?? '') as GraphQLObjectType | undefined;
      const field = type?.getFields()?.[prop];
      const hasPossibleConnections = field && extractObjectTypes(schema, field.type).length > 0;

      if (type && field && hasPossibleConnections) {
        const isNonNull = isNonNullType(field.type);
        const isSingularConnection = !extractListType(field.type) && hasPossibleConnections;
        const connections = getConnections(document);

        if (!Array.isArray(connections[prop])) {
          if (!isNonNull) {
            return null;
          } else if (isSingularConnection) {
            return undefined;
          } else {
            if (!writable) {
              return Object.freeze([]);
            } else {
              const writableDocumentsArray: Document[] = [];
              document[field.name] = writableDocumentsArray;
              return writableDocumentsArray;
            }
          }
        }

        const connectedDocuments = connections[prop].map((key) => {
          return isNullDocument(key) ? null : findDocument(store, key);
        });

        if (isSingularConnection) {
          // only one connection expected, otherwise null
          return connectedDocuments[0] ?? null;
        } else {
          return connectedDocuments;
        }
      }

      return Reflect.get(document, prop) ?? null;
    },

    set(document, prop, value) {
      if (!writable) {
        throw new Error('Setting on data pulled from the store is not allowed, use the `mutate` method.');
      }

      return Reflect.set(document, prop, value);
    },
  });
}
