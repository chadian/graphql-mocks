import { addOperation } from './add';
import { putOperation } from './put';
import { findOperation } from './find';
import { connectOperation } from './connect';
import { removeOperation } from './remove';
import { getDocumentsForTypeOperation } from './get-documents-for-type';
import { getNullDocumentOperation } from './get-null-document';

export const defaultOperations = {
  add: addOperation,
  put: putOperation,
  find: findOperation,
  connect: connectOperation,
  remove: removeOperation,
  getDocumentsForType: getDocumentsForTypeOperation,
  getNullDocument: getNullDocumentOperation,
};
