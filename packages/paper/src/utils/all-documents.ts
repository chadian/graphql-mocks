import { DocumentStore, Document } from '../types';

export function allDocuments(store: DocumentStore): Document[] {
  const all = Object.values(store).reduce((all, documents) => {
    return [...all, ...documents] as Document[];
  }, [] as Document[]);

  return all;
}
