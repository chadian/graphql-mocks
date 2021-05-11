import { Document, KeyOrDocument, OperationContext } from '../types';
import { findDocument } from '../utils/find-document';
import { getDocumentKey } from '../utils/get-document-key';

export function findOperation(context: OperationContext, keyOrDocument: KeyOrDocument): Document | undefined {
  const { store } = context;
  const key = getDocumentKey(keyOrDocument);
  return findDocument(store, key);
}
