import { KeyOrDocument, OperationContext } from '../types';
import { connectDocument } from '../utils/connect-document';
import { getDocumentKey } from '../utils/get-document-key';
import { nullDocument } from '../utils/null-document';
import { findOperation } from './find';

export function connectOperation(
  context: OperationContext,
  [keyOrDocument, field]: [KeyOrDocument, string],
  [connectedKeyOrDocument, connectedInverseField]: [KeyOrDocument | null, string?],
): void {
  const key = getDocumentKey(keyOrDocument);

  const document = findOperation(context, key);

  if (!document) {
    throw new Error(`Could not find a document for ${document}`);
  }

  if (connectedKeyOrDocument === null) {
    if (connectedInverseField) {
      throw new Error('Null documents cannot be inversely connected ');
    }

    connectedKeyOrDocument = nullDocument;
  }

  const connectedKey = getDocumentKey(connectedKeyOrDocument);

  if (!findOperation(context, connectedKey)) {
    throw new Error(`Could not find a document for ${connectedKeyOrDocument}`);
  }

  connectDocument(document, field, connectedKey);

  if (connectedInverseField) {
    connectOperation(context, [connectedKey, connectedInverseField], [key]);
  }
}
