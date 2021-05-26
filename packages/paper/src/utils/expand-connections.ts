import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { DocumentStore } from '../types';
import { findDocument } from './find-document';
import { getConnections } from './get-connections';
import { extractListType } from './graphql/extract-list-type';
import { extractObjectTypes } from './graphql/extract-object-types';

export function expandConnections(schema: GraphQLSchema, store: DocumentStore): void {
  for (const typeName in store) {
    const typeStore = store[typeName];
    const type = schema.getType(typeName) as GraphQLObjectType;

    for (const document of typeStore) {
      const connections = getConnections(document);

      for (const connectionFieldName in connections) {
        const connectionKeys = connections[connectionFieldName];
        const fields = type.getFields();
        const field = fields[connectionFieldName];
        const hasObjectReferences = extractObjectTypes(schema, field.type).length > 0;
        const isSingularConnection = !extractListType(field.type) && hasObjectReferences;

        const connectedDocuments = connectionKeys.map((key) => {
          const document = findDocument(store, key);
          if (!document) {
            throw new Error(
              `Could not find a document for key ${key} on connected field ${connectionFieldName} on type ${typeName} for document ${JSON.stringify(
                document,
                null,
                2,
              )}`,
            );
          }

          return document;
        });

        if (isSingularConnection) {
          // only one connection expected, otherwise null
          document[connectionFieldName] = connectedDocuments[0] ?? null;
        } else {
          document[connectionFieldName] = connectedDocuments;
        }
      }
    }
  }
}
