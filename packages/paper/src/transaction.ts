import { addOperation } from './operations/add';
import { putOperation } from './operations/put';
import { findOperation } from './operations/find';
import { connectOperation } from './operations/connect';
import { removeOperation } from './operations/remove';
import { getDocumentsForTypeOperation } from './operations/get-documents-for-type';

export function transaction(draft, fn) {
  const context = { data: draft };

  // operations
  const add = addOperation.bind(null, context);
  const put = putOperation.bind(null, context);
  const find = findOperation.bind(null, context);
  const connect = connectOperation.bind(null, context);
  const remove = removeOperation.bind(null, context);
  const getDocumentsForType = getDocumentsForTypeOperation.bind(null, context);

  // provide functions to make changes with bound datas
  fn({ add, put, find, remove, getDocumentsForType, connect });

  // return the changes
  return draft;
}
