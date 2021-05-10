import { Document, KeyOrDocument, OperationContext } from '../types';
import { findDocument } from '../utils/find-document';
import { getDocumentKey } from '../utils/get-document-key';

export function findOperation(context: OperationContext, keyOrDocument: KeyOrDocument): Document | undefined {
  const { data } = context;
  const key = getDocumentKey(keyOrDocument);
  return findDocument(data, key);
}

// Only used for generating type after the resulting `bind`
const bound = findOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
