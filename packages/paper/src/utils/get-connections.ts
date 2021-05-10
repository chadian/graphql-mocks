import { CONNECTION_KEY_SYMBOL } from '../constants';

export function getConnections(document) {
  return document[CONNECTION_KEY_SYMBOL];
}
