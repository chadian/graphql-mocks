import { findDocument } from '../utils/find-document';

export function findOperation(context, id) {
  const {data} = context;
  return findDocument(data, id);
}
