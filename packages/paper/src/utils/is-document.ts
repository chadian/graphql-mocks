import { CONNECTION_KEY_SYMBOL, DOCUMENT_ID_SYMBOL } from '../constants';
import { Document } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isDocument(document: Record<string, any>): document is Document {
  if (DOCUMENT_ID_SYMBOL in document && CONNECTION_KEY_SYMBOL in document) return true;
  return false;
}
