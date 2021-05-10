const { allDocuments } = require('../utils/all-documents');
const { getDocumentId } = require('../utils/get-document-id');

function findDocument(data, key) {
  const all = allDocuments(data);
  const found = all.find((document) => getDocumentId(document) === key);
  return found;
}

module.exports = { findDocument };
