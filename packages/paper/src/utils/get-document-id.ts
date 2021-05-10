import { DOCUMENT_ID_SYMBOL } from '../constants';

function getDocumentId(document) {
  return document[DOCUMENT_ID_SYMBOL];
}

module.exports = { getDocumentId }
