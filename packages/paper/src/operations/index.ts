import { createOperation } from './create';
import { putOperation } from './put';
import { findOperation } from './find';
import { removeOperation } from './remove';
import { getDocumentsForTypeOperation } from './get-documents-for-type';
import { cloneOperation } from './clone';

export const defaultOperations = {
  create: createOperation,
  put: putOperation,
  find: findOperation,
  remove: removeOperation,
  getDocumentsForType: getDocumentsForTypeOperation,
  clone: cloneOperation,
};
