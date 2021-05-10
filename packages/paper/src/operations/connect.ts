import { CONNECTION_KEY_SYMBOL } from '../constants';
import { Document, Operation } from '../types';
import { getDocumentId } from '../utils/get-document-id';
import { findOperation } from './find';

export const connectOperation: Operation = function connectOperation(
  context,
  [keyOrDocument, field]: [string | Document, string],
  [connectedKeyOrDocument, connectedInverseField]: [string | Document, string?],
) {
  const key = keyOrDocument === 'string' ? keyOrDocument : getDocumentId(keyOrDocument as Document);
  const connectedKey =
    connectedKeyOrDocument === 'string' ? connectedKeyOrDocument : getDocumentId(connectedKeyOrDocument as Document);

  const document = findOperation(context, key);
  document[CONNECTION_KEY_SYMBOL] = document[CONNECTION_KEY_SYMBOL] || {};
  document[CONNECTION_KEY_SYMBOL][field] = document[CONNECTION_KEY_SYMBOL][field] || new Set();

  const connections = document[CONNECTION_KEY_SYMBOL][field];
  connections.add(connectedKey);

  if (connectedInverseField) {
    connectOperation(context, [connectedKey, connectedInverseField], [key]);
  }

  return true;
};
