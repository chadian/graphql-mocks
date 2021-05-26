import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { DOCUMENT_INTERNAL_TYPE } from '../constants';
import { DocumentStore } from '../types';
import { getConnections } from './get-connections';
import { getDocumentKey } from './get-document-key';
import { extractListType } from './graphql/extract-list-type';
import { extractObjectTypes } from './graphql/extract-object-types';
import { isDocument } from './is-document';
import { nullDocument } from './null-document';

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
        const isConnectionField = isListConnection || isSingularConnection;

        // skip non-connection fields
        if (!isConnectionField) {
          continue;
        }

        // skip undefined cannot be used as a connection value, only null
        if (documentFieldValue === undefined) {
          continue;
        }

        const connectedDocuments = Array.isArray(documentFieldValue) ? documentFieldValue : [documentFieldValue];

        const connectionKeys = connectedDocuments.map((maybeDocument) => {
          maybeDocument = maybeDocument === null ? nullDocument : maybeDocument;

          if (!isDocument(maybeDocument)) {
            throw new Error(
              `Expected document in array on field ${fieldName}, got:\n${JSON.stringify(maybeDocument, null, 2)}`,
            );
          }

          return getDocumentKey(maybeDocument);
        });

        connections[fieldName] = connectionKeys;

        // remove the existing value, the key is considered represented as a connection
        delete document[fieldName];
      }
    }
  }
}
