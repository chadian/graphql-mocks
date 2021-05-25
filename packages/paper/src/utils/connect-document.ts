import { Document, DocumentStore, KeyOrDocument } from '../types';
import { findDocument } from './find-document';
import { getDocumentKey } from './get-document-key';
import { nullDocument } from './null-document';

export function connectDocument(
  store: DocumentStore,
  document: Document,
  field: string,
  keyOrDocument: KeyOrDocument,
): void {
  const key = keyOrDocument === 'string' ? keyOrDocument : getDocumentKey(keyOrDocument as Document);
  let connectionDocument: Document | undefined | null = findDocument(store, key);

  if (connectionDocument === nullDocument) {
    connectionDocument = null;
  }

  const documentValue = document[field];

  if (Array.isArray(documentValue)) {
    documentValue.push(connectionDocument);
  } else {
    document[field] = [connectionDocument];
  }
}
