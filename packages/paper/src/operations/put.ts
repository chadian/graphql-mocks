import merge from 'lodash.merge';
import { Operation, OperationContext } from '../types';
import { findOperation } from './find';

export const putOperation: Operation = function putOperation(context, id, document) {
  const found = findOperation(context, id);
  merge(found, document);

  return id;
};

// Only used for generating type after the resulting `bind`
const bound = putOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
