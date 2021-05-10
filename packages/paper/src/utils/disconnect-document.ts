import { DOCUMENT_CONNECTIONS_SYMBOL } from '../constants';
import { Document, KeyOrDocument } from '../types';
import { getDocumentKey } from './get-document-key';

export function disconnectDocument(document: Document, field: string, keyOrDocument: KeyOrDocument): void {
  const keyToDisconnect = keyOrDocument === 'string' ? keyOrDocument : getDocumentKey(keyOrDocument as Document);
  document[DOCUMENT_CONNECTIONS_SYMBOL] = document[DOCUMENT_CONNECTIONS_SYMBOL] || {};
  document[DOCUMENT_CONNECTIONS_SYMBOL][field] = document[DOCUMENT_CONNECTIONS_SYMBOL][field] || [];
  const connections = document[DOCUMENT_CONNECTIONS_SYMBOL][field];
  const filtered = connections.filter((key) => key !== keyToDisconnect);
  document[DOCUMENT_CONNECTIONS_SYMBOL][field] = filtered;
}
