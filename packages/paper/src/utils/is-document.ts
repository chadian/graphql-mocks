import { DOCUMENT_CONNECTIONS_SYMBOL, DOCUMENT_KEY_SYMBOL } from '../constants';
import { Document } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
export function isDocument(document: any): document is Document {
  if (typeof document === 'object' && DOCUMENT_KEY_SYMBOL in document && DOCUMENT_CONNECTIONS_SYMBOL in document) {
    return true;
  }

  return false;
}
