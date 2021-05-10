import { DocumentStore, Document } from '../types';
import { getDocumentKey } from './get-document-key';

export function findDocumentForType(
  store: DocumentStore,
  typename: string,
  key: string | Document,
): Document | undefined {
  if (typeof key !== 'string') {
    key = getDocumentKey(key);
  }

  const documents = store[typename] ?? [];
  const found = documents.find((document) => getDocumentKey(document) === key);

  return found;
}
