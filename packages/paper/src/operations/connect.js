const { CONNECTION_KEY_SYMBOL } = require('../constants');
const { findOperation } = require('./find');

function connectOperation(context, [keyOne, fieldOne], [keyTwo, inverseField]) {
  const document = findOperation(context, keyOne);
  document[CONNECTION_KEY_SYMBOL] = document[CONNECTION_KEY_SYMBOL] || {};
  document[CONNECTION_KEY_SYMBOL][fieldOne] =
    document[CONNECTION_KEY_SYMBOL][fieldOne] || new Set();

  const connections = document[CONNECTION_KEY_SYMBOL][fieldOne];
  connections.add(keyTwo);

  if (inverseField) {
    connectOperation(context, [keyTwo, inverseField], [keyOne]);
  }

  return true;
}

module.exports = { connectOperation }
