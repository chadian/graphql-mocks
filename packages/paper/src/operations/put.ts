import merge from 'lodash.merge';
import { Operation } from '../types';
import { findOperation } from './find';

export const putOperation: Operation = function putOperation(context, id, document) {
  const found = findOperation(context, id);
  merge(found, document);

  return id;
};
