import { DOCUMENT_CONNECTIONS_SYMBOL } from '../constants';
import { Document, OperationContext } from '../types';
import { getDocumentKey } from '../utils/get-document-key';
import { findOperation } from './find';

export function connectOperation(
  context: OperationContext,
  [keyOrDocument, field]: [string | Document, string],
  [connectedKeyOrDocument, connectedInverseField]: [string | Document, string?],
): void {
  const key = keyOrDocument === 'string' ? keyOrDocument : getDocumentKey(keyOrDocument as Document);
  const connectedKey =
    connectedKeyOrDocument === 'string' ? connectedKeyOrDocument : getDocumentKey(connectedKeyOrDocument as Document);

  const document = findOperation(context, key);

  if (!document) {
    throw new Error(`Could not find a document for ${document}`);
  }

  document[DOCUMENT_CONNECTIONS_SYMBOL] = document[DOCUMENT_CONNECTIONS_SYMBOL] || {};
  document[DOCUMENT_CONNECTIONS_SYMBOL][field] = document[DOCUMENT_CONNECTIONS_SYMBOL][field] || new Set();

  const connections = document[DOCUMENT_CONNECTIONS_SYMBOL][field];
  connections.add(connectedKey);

  if (connectedInverseField) {
    connectOperation(context, [connectedKey, connectedInverseField], [key]);
  }
}

// Only used for generating type after the resulting `bind`
const bound = connectOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
