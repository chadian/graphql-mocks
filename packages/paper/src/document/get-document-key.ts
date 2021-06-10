import { DOCUMENT_KEY_SYMBOL } from '../constants';
import { Document } from '../types';

export function getDocumentKey(keyOrDocument: Document | string): string {
  if (typeof keyOrDocument === 'string') {
    return keyOrDocument;
  }
  return keyOrDocument[DOCUMENT_KEY_SYMBOL];
}
