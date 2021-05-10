import { allDocuments } from '../utils/all-documents';
import { getDocumentId } from '../utils/get-document-id';

function findDocument(data, key) {
  const all = allDocuments(data);
  const found = all.find((document) => getDocumentId(document) === key);
  return found;
}

module.exports = { findDocument };
