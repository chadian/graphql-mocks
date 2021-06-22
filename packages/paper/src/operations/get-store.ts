import { DocumentStore, OperationContext } from '../types';

export function getStoreOperation(context: OperationContext): DocumentStore {
  const { store } = context;
  return store;
}
