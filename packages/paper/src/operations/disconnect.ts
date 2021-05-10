import { KeyOrDocument, OperationContext } from '../types';
import { disconnectDocument } from '../utils/disconnect-document';
import { getDocumentKey } from '../utils/get-document-key';
import { findOperation } from './find';

export function disconnectOperation(
  context: OperationContext,
  [keyOrDocument, field]: [KeyOrDocument, string],
  [disconnectKeyOrDocument, disconnectInverseField]: [KeyOrDocument, string?],
): void {
  const key = getDocumentKey(keyOrDocument);
  const disconnectedKey = getDocumentKey(disconnectKeyOrDocument);

  const document = findOperation(context, key);

  if (!document) {
    throw new Error(`Could not find a document for ${document}`);
  }

  if (!findOperation(context, disconnectKeyOrDocument)) {
    throw new Error(`Could not find a document for ${disconnectKeyOrDocument}`);
  }

  disconnectDocument(document, field, disconnectedKey);

  if (disconnectInverseField) {
    disconnectOperation(context, [disconnectedKey, disconnectInverseField], [key]);
  }
}

// Only used for generating typescript type after the resulting `bind`
const bound = disconnectOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
