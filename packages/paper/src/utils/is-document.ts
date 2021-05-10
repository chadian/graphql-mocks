import { DOCUMENT_CONNECTIONS_SYMBOL, DOCUMENT_KEY_SYMBOL } from '../constants';
import { Document } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDocument(document: Record<string, any>): document is Document {
  if (DOCUMENT_KEY_SYMBOL in document && DOCUMENT_CONNECTIONS_SYMBOL in document) return true;
  return false;
}
