import { generateDocumentKey } from '../utils/generate-document-key';
import { DOCUMENT_ID_SYMBOL } from '../constants';

export function addOperation(context, type, document) {
  const {data} = context;
  const id = generateDocumentKey();
  data[type] = data[type] || [];
  document[DOCUMENT_ID_SYMBOL] = id;
  data[type].push(document);

  return id;
}
