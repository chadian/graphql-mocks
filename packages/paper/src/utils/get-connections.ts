import { CONNECTION_KEY_SYMBOL } from '../constants';
import { Document, ConnectionsMap } from '../types';

export function getConnections(document: Document): ConnectionsMap {
  return document[CONNECTION_KEY_SYMBOL];
}
