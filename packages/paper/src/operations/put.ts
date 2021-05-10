import merge from 'lodash.merge';
import { findOperation } from './find';

export function putOperation(context, id, document) {
  const found = findOperation(context, id);
  merge(found, document);

  return id;
}
