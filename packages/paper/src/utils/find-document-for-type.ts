import { DataStore, Document } from '../types';
import { getDocumentKey } from './get-document-key';

export function findDocumentForType(data: DataStore, typename: string, key: string | Document): Document | undefined {
  if (typeof key !== 'string') {
    key = getDocumentKey(key);
  }

  const documents = data[typename] ?? [];
  const found = documents.find((document) => getDocumentKey(document) === key);

  return found;
}
