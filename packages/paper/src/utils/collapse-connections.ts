import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { DOCUMENT_INTERNAL_TYPE } from '../constants';
import { DocumentStore } from '../types';
import { getConnections } from './get-connections';
import { getDocumentKey } from './get-document-key';
import { extractListType } from './graphql/extract-list-type';
import { extractObjectTypes } from './graphql/extract-object-types';
import { isDocument } from './is-document';

export function collapseConnections(graphqlSchema: GraphQLSchema, store: DocumentStore): void {
  for (const typeName in store) {
    if (typeName === DOCUMENT_INTERNAL_TYPE) {
      continue;
    }

    const typeStore = store[typeName];
    const type = graphqlSchema.getType(typeName) as GraphQLObjectType;
    const fields = type.getFields();

    for (const document of typeStore) {
      const connections = getConnections(document);

      for (const fieldName in fields) {
        const documentFieldValue = document[fieldName];
        const field = fields[fieldName];
        const hasObjectReferences = extractObjectTypes(graphqlSchema, field.type).length > 0;
        const isListConnection = extractListType(field.type) && hasObjectReferences;
        const isSingularConnection = !extractListType(field.type) && hasObjectReferences;

        if (isListConnection || isSingularConnection) {
          delete document[fieldName];
        } else {
          continue;
        }

        let connectedDocuments: unknown[];

        if (documentFieldValue == null) {
          connectedDocuments = [];
        } else if (Array.isArray(documentFieldValue)) {
          connectedDocuments = documentFieldValue;
        } else {
          connectedDocuments = [documentFieldValue];
        }

        const connectionKeys = connectedDocuments.map((maybeDocument) => {
          if (!isDocument(maybeDocument)) {
            throw new Error(
              `Expected document in array on field ${fieldName}, got:\n${JSON.stringify(maybeDocument, null, 2)}`,
            );
          }

          return getDocumentKey(maybeDocument);
        });

        connections[fieldName] = connectionKeys;
      }
    }
  }
}
