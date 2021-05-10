import { Document, KeyOrDocument, OperationContext } from '../types';
import { getDocumentId } from '../utils/get-document-id';

export function removeOperation(context: OperationContext, keyOrDocument: KeyOrDocument): Document {
  const { data } = context;
  const key = getDocumentId(keyOrDocument);

  let document;
  Object.entries(data).forEach(([type, documents]) => {
    const found = documents.find((document: Document) => getDocumentId(document) === key);

    if (found) {
      data[type] = documents.filter((document: Document) => document !== found);
      document = found;
    }
  });

  if (!document) {
    throw new Error(`Could not find document ${key} to remove`);
  }

  return document;
}

// Only used for generating type after the resulting `bind`
const bound = removeOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
