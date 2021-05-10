import { Document, DocumentKey, OperationContext } from '../types';
import { getDocumentId } from '../utils/get-document-id';

// TODO: Change `id` arg to `idOrDocument`
export function removeOperation(context: OperationContext, id: DocumentKey): Document {
  const { data } = context;

  let document;
  Object.entries(data).forEach(([type, documents]) => {
    const found = documents.find((document: Document) => getDocumentId(document) === id);

    if (found) {
      data[type] = documents.filter((document: Document) => document !== found);
      document = found;
    }
  });

  if (!document) {
    throw new Error(`Could not find document ${id} to remove`);
  }

  return document;
}

// Only used for generating type after the resulting `bind`
const bound = removeOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
