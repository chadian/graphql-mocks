import { Document, KeyOrDocument, OperationContext } from '../types';
import { findDocument } from '../store/find-document';
import { getDocumentKey } from '../document/get-document-key';

export function findOperation(context: OperationContext, keyOrDocument: KeyOrDocument): Document | undefined {
  const { store } = context;
  const key = getDocumentKey(keyOrDocument);
  return findDocument(store, key);
}
