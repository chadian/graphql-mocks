import { Operation } from '../types';
import { findDocument } from '../utils/find-document';
import { getDocumentId } from '../utils/get-document-id';

export const findOperation: Operation = function findOperation(context, keyOrDocument) {
  const { data } = context;
  const key = getDocumentId(keyOrDocument);
  return findDocument(data, key);
};
