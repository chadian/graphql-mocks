import { DOCUMENT_CONNECTIONS_SYMBOL } from '../constants';
import { Document, ConnectionsMap } from '../types';

export function getConnections(document: Document): ConnectionsMap {
  return document[DOCUMENT_CONNECTIONS_SYMBOL];
}
