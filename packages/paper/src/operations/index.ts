import { createOperation } from './create';
import { findOperation } from './find';
import { removeOperation } from './remove';
import { cloneOperation } from './clone';
import { getStoreOperation } from './get-store';
import { queueEventOperation } from './queue-event';

export const defaultOperations = {
  create: createOperation,
  find: findOperation,
  remove: removeOperation,
  clone: cloneOperation,
  getStore: getStoreOperation,
  queueEvent: queueEventOperation,
};
