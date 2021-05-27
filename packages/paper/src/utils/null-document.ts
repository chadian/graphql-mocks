import { DOCUMENT_INTERNAL_TYPE } from '../constants';
import { Document } from '../types';
import { createDocument } from './create-document';
import { generateDocumentKey } from './generate-document-key';

export const key = generateDocumentKey();
export const nullDocument: Document = Object.freeze(createDocument(DOCUMENT_INTERNAL_TYPE, {}, key));
