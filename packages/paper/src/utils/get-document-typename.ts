import { DOCUMENT_GRAPHQL_TYPENAME } from '../constants';
import { Document } from '../types';

export function getDocumentTypename(document: Document): string {
  return document[DOCUMENT_GRAPHQL_TYPENAME];
}
