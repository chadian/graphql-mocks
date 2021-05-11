import { Operation, OperationContext } from '../types';

export const getDocumentsForTypeOperation: Operation = function getDocumentsForTypeOperation(context, type) {
  const { store } = context;
  return store[type];
};
