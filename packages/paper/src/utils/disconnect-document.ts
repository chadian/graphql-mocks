import { Document, KeyOrDocument } from '../types';
import { getDocumentKey } from './get-document-key';
import { isDocument } from './is-document';

export function disconnectDocument(document: Document, field: string, keyOrDocument: KeyOrDocument): void {
  const keyToDisconnect = keyOrDocument === 'string' ? keyOrDocument : getDocumentKey(keyOrDocument as Document);
  const fieldValue = document[field];

  if (Array.isArray(fieldValue)) {
    const filtered = fieldValue.filter((item) => isDocument(item) && getDocumentKey(item) !== keyToDisconnect);
    document[field] = filtered;
  } else if (isDocument(fieldValue) && getDocumentKey(fieldValue) === keyToDisconnect) {
    document[field] = null;
  }
}
