import { DataStore, Document, KeyOrDocument } from '../types';
import { allDocuments } from '../utils/all-documents';
import { getDocumentKey } from './get-document-key';

export function findDocument(data: DataStore, key: KeyOrDocument): Document | undefined {
  if (typeof key !== 'string') {
    key = getDocumentKey(key);
  }

  const all = allDocuments(data);
  const found = all.find((document) => getDocumentKey(document) === key);
  return found;
}
