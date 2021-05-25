import { DocumentStore } from '../types';
import { findDocument } from './find-document';
import { getConnections } from './get-connections';

export function expandConnections(store: DocumentStore): void {
  for (const typeName in store) {
    const typeStore = store[typeName];

    for (const document of typeStore) {
      const connections = getConnections(document);

      for (const connectionFieldName in connections) {
        const connectionKeys = connections[connectionFieldName];
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

        document[connectionFieldName] = connectedDocuments;
      }
    }
  }
}
