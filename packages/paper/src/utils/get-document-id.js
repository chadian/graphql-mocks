const { DOCUMENT_ID_SYMBOL } = require('../constants');

function getDocumentId(document) {
  return document[DOCUMENT_ID_SYMBOL];
}

module.exports = { getDocumentId }
