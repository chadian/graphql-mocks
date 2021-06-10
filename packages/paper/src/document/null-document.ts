import { Document } from '../types';
import { createDocument } from './create-document';
import { generateDocumentKey } from './generate-document-key';
import { getDocumentKey } from './get-document-key';

export const key = generateDocumentKey();
export const nullDocument: Document = Object.freeze(createDocument('__NULL_DOCUMENT__', {}, key));
export const isNullDocument = (documentOrKey: Document | string): boolean => {
  if (typeof documentOrKey === 'string') {
    return documentOrKey === key;
  } else {
    return getDocumentKey(documentOrKey) === key;
  }
};
