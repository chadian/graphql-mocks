import { KeyOrDocument, OperationContext } from '../types';
import { connectDocument } from '../utils/connect-document';
import { getDocumentKey } from '../utils/get-document-key';
import { findOperation } from './find';

export function connectOperation(
  context: OperationContext,
  [keyOrDocument, field]: [KeyOrDocument, string],
  [connectedKeyOrDocument, connectedInverseField]: [KeyOrDocument, string?],
): void {
  const key = getDocumentKey(keyOrDocument);
  const connectedKey = getDocumentKey(connectedKeyOrDocument);

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
