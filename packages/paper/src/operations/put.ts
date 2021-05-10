import merge from 'lodash.merge';
import { Document, DocumentPartial, KeyOrDocument, OperationContext } from '../types';
import { getDocumentId } from '../utils/get-document-id';
import { findOperation } from './find';

export const putOperation = function putOperation(
  context: OperationContext,
  keyOrDocument: KeyOrDocument,
  documentPartial: DocumentPartial,
): Document {
  const key = getDocumentId(keyOrDocument);
  const found = findOperation(context, key);

  if (!found) {
    throw new Error(`No document found for ${key}`);
  }

  merge(found, documentPartial);
  return found;
};

// Only used for generating type after the resulting `bind`
const bound = putOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
