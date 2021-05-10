import { DataStore, Document } from '../types';

export function allDocuments(data: DataStore): Document[] {
  const all = Object.values(data).reduce((all, documents) => {
    return [...all, ...documents] as Document[];
  }, [] as Document[]);

  return all;
}
