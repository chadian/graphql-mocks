const { addOperation } = require('./operations/add');
const { putOperation } = require('./operations/put');
const { findOperation } = require('./operations/find');
const { connectOperation } = require('./operations/connect');
const { removeOperation } = require('./operations/remove');
const { getDocumentsForTypeOperation } = require('./operations/get-documents-for-type')

function transaction(draft, fn) {
  const context = {data: draft};

  // operations
  const add = addOperation.bind(null, context);
  const put = putOperation.bind(null, context);
  const find = findOperation.bind(null, context);
  const connect = connectOperation.bind(null, context);
  const remove = removeOperation.bind(null, context);
  const getDocumentsForType = getDocumentsForTypeOperation.bind(null, context);

  // provide functions to make changes with bound datas
  fn({add, put, find, remove, getDocumentsForType, connect});

  // return the changes
  return draft;
}

module.exports = { transaction };
