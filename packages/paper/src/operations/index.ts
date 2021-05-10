import { createOperation } from './create';
import { putOperation } from './put';
import { findOperation } from './find';
import { connectOperation } from './connect';
import { disconnectOperation } from './disconnect';
import { removeOperation } from './remove';
import { getDocumentsForTypeOperation } from './get-documents-for-type';

export const defaultOperations = {
  create: createOperation,
  put: putOperation,
  find: findOperation,
  connect: connectOperation,
  disconnect: disconnectOperation,
  remove: removeOperation,
  getDocumentsForType: getDocumentsForTypeOperation,
};
