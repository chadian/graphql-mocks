import { Document, OperationContext } from '../types';
import { connectDocument } from '../utils/connect-document';
import { getDocumentKey } from '../utils/get-document-key';
import { findOperation } from './find';

export function connectOperation(
  context: OperationContext,
  [keyOrDocument, field]: [string | Document, string],
  [connectedKeyOrDocument, connectedInverseField]: [string | Document, string?],
): void {
  const key = keyOrDocument === 'string' ? keyOrDocument : getDocumentKey(keyOrDocument as Document);
  const connectedKey =
    connectedKeyOrDocument === 'string' ? connectedKeyOrDocument : getDocumentKey(connectedKeyOrDocument as Document);

  const document = findOperation(context, key);

  if (!document) {
    throw new Error(`Could not find a document for ${document}`);
  }

  if (!findOperation(context, connectedKeyOrDocument)) {
    throw new Error(`Could not find a document for ${connectedKeyOrDocument}`);
  }

  connectDocument(document, field, connectedKey);

  if (connectedInverseField) {
    connectOperation(context, [connectedKey, connectedInverseField], [key]);
  }
}

// Only used for generating typescript type after the resulting `bind`
const bound = connectOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
