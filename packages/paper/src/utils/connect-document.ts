import { DOCUMENT_CONNECTIONS_SYMBOL } from '../constants';
import { Document, KeyOrDocument } from '../types';
import { getDocumentKey } from './get-document-key';

export function connectDocument(document: Document, field: string, keyOrDocument: KeyOrDocument): void {
  const key = keyOrDocument === 'string' ? keyOrDocument : getDocumentKey(keyOrDocument as Document);
  document[DOCUMENT_CONNECTIONS_SYMBOL] = document[DOCUMENT_CONNECTIONS_SYMBOL] || {};
  document[DOCUMENT_CONNECTIONS_SYMBOL][field] = document[DOCUMENT_CONNECTIONS_SYMBOL][field] || [];
  const connections = document[DOCUMENT_CONNECTIONS_SYMBOL][field];
  connections.push(key);
}
