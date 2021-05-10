import { Document, Operation } from '../types';
import { getDocumentId } from '../utils/get-document-id';

export const removeOperation: Operation = function removeOperation(context, id) {
  const { data } = context;
  let found = false;

  Object.entries(data).forEach(([type, documents]) => {
    const documentToRemove = documents.find((document: Document) => getDocumentId(document) === id);

    found = Boolean(documentToRemove);

    if (found) {
      data[type] = documents.filter((document: Document) => document !== documentToRemove);
    }
  });

  return found;
};
