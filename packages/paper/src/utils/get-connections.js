const { CONNECTION_KEY_SYMBOL } = require('../constants');

function getConnections(document) {
  return document[CONNECTION_KEY_SYMBOL];
}

module.exports = { getConnections };
