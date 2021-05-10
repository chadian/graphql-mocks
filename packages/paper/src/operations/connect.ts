import { CONNECTION_KEY_SYMBOL } from '../constants';
import { Document, OperationContext } from '../types';
import { getDocumentId } from '../utils/get-document-id';
import { findOperation } from './find';

export function connectOperation(
  context: OperationContext,
  [keyOrDocument, field]: [string | Document, string],
  [connectedKeyOrDocument, connectedInverseField]: [string | Document, string?],
): void {
  const key = keyOrDocument === 'string' ? keyOrDocument : getDocumentId(keyOrDocument as Document);
  const connectedKey =
    connectedKeyOrDocument === 'string' ? connectedKeyOrDocument : getDocumentId(connectedKeyOrDocument as Document);

  const document = findOperation(context, key);

  if (!document) {
    throw new Error(`Could not find a document for ${document}`);
  }

  document[CONNECTION_KEY_SYMBOL] = document[CONNECTION_KEY_SYMBOL] || {};
  document[CONNECTION_KEY_SYMBOL][field] = document[CONNECTION_KEY_SYMBOL][field] || new Set();

  const connections = document[CONNECTION_KEY_SYMBOL][field];
  connections.add(connectedKey);

  if (connectedInverseField) {
    connectOperation(context, [connectedKey, connectedInverseField], [key]);
  }
}

// Only used for generating type after the resulting `bind`
const bound = connectOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
