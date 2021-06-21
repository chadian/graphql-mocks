import { createDocument } from './create-document';
import { ConnectionsMap, Document, DocumentPartial } from '../types';
import { DOCUMENT_KEY_SYMBOL, DOCUMENT_GRAPHQL_TYPENAME, DOCUMENT_CONNECTIONS_SYMBOL } from '../constants';

function copyConnections(connections: ConnectionsMap): ConnectionsMap {
  const copy: ConnectionsMap = {};
  for (const key in connections) {
    copy[key] = [...connections[key]];
  }

  return copy;
}

export function cloneDocument(document: Document): Document {
  const typename = document.__typename;
  const copy: DocumentPartial = { ...document };
  delete copy[DOCUMENT_KEY_SYMBOL];
  delete copy[DOCUMENT_GRAPHQL_TYPENAME];
  delete copy[DOCUMENT_CONNECTIONS_SYMBOL];
  copy[DOCUMENT_CONNECTIONS_SYMBOL] = copyConnections(document[DOCUMENT_CONNECTIONS_SYMBOL]);
  return createDocument(typename, copy);
}
