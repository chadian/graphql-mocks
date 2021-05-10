const { generateDocumentKey } = require("../utils/generate-document-key");
const { DOCUMENT_ID_SYMBOL } = require('../constants');

function addOperation(context, type, document) {
  const {data} = context;
  const id = generateDocumentKey();
  data[type] = data[type] || [];
  document[DOCUMENT_ID_SYMBOL] = id;
  data[type].push(document);

  return id;
}

module.exports = { addOperation };
