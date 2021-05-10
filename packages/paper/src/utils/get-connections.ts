import { CONNECTION_KEY_SYMBOL } from '../constants';

function getConnections(document) {
  return document[CONNECTION_KEY_SYMBOL];
}

module.exports = { getConnections };
