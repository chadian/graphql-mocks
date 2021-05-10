import {
  DOCUMENT_CONNECTIONS_SYMBOL,
  DOCUMENT_GRAPHQL_TYPENAME,
  DOCUMENT_INTERNAL_TYPE,
  DOCUMENT_KEY_SYMBOL,
} from '../constants';
import { Document } from '../types';
import { generateDocumentKey } from './generate-document-key';

export const key = generateDocumentKey();

export const nullDocument: Document = Object.freeze({
  [DOCUMENT_KEY_SYMBOL]: key,
  [DOCUMENT_CONNECTIONS_SYMBOL]: {},
  [DOCUMENT_GRAPHQL_TYPENAME]: DOCUMENT_INTERNAL_TYPE,
});
