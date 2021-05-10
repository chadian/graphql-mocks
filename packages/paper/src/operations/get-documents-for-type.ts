import { Operation } from '../types';

export const getDocumentsForTypeOperation: Operation = function getDocumentsForTypeOperation(context, type) {
  const { data } = context;
  return data[type];
};
