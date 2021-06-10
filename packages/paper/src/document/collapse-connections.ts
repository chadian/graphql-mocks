import { GraphQLObjectType, GraphQLSchema } from 'graphql';
import { Document, DocumentStore } from '../types';
import { getConnections } from './get-connections';
import { getDocumentKey } from './get-document-key';
import { extractListType } from '../graphql/extract-list-type';
import { extractObjectTypes } from '../graphql/extract-object-types';
import { isDocument } from './is-document';
import { nullDocument } from './null-document';

export function collapseDocument(schema: GraphQLSchema, document: Document): void {
  const connections = getConnections(document);
  const type = schema.getType(document.__typename) as GraphQLObjectType;

  if (!type) {
    throw new Error(`Could not find type ${document.__typename} in the GraphQL Schema`);
  }

  const fields = type.getFields();

  for (const fieldName in fields) {
    const documentFieldValue = document[fieldName];
    const field = fields[fieldName];
    const hasObjectReferences = extractObjectTypes(schema, field.type).length > 0;
    const isListConnection = extractListType(field.type) && hasObjectReferences;
    const isSingularConnection = !extractListType(field.type) && hasObjectReferences;
    const isConnectionField = isListConnection || isSingularConnection;

    // skip non-connection fields
    if (!isConnectionField) {
      continue;
    }

    // skip undefined and null
    if (documentFieldValue === undefined || documentFieldValue === null) {
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

export function collapseConnections(graphqlSchema: GraphQLSchema, store: DocumentStore): void {
  for (const typeName in store) {
    const typeStore = store[typeName];

    for (const document of typeStore) {
      collapseDocument(graphqlSchema, document);
    }
  }
}
