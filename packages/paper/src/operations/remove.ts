import { Document, KeyOrDocument, OperationContext } from '../types';
import { getDocumentKey } from '../utils/get-document-key';

export function removeOperation(context: OperationContext, keyOrDocument: KeyOrDocument): Document {
  const { store } = context;
  const key = getDocumentKey(keyOrDocument);

  let document;
  Object.entries(store).forEach(([type, documents]) => {
    const found = documents.find((document: Document) => getDocumentKey(document) === key);

    if (found) {
      store[type] = documents.filter((document: Document) => document !== found);
      document = found;
    }
  });

  if (!document) {
    throw new Error(`Could not find document ${key} to remove`);
  }

  return document;
}
