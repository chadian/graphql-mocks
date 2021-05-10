import { DOCUMENT_ID_SYMBOL } from '../constants';
import { Document } from '../types';

export function getDocumentId(keyOrDocument: Document | string): string {
  if (typeof keyOrDocument === 'string') {
    return keyOrDocument;
  }
  return keyOrDocument[DOCUMENT_ID_SYMBOL];
}
