import { getDocumentId } from '../utils/get-document-id';

export function removeOperation(context, id) {
  const { data } = context;
  let found = false;

  Object.entries(data).forEach(([type, documents]) => {
    const documentToRemove = documents.find((document) => getDocumentId(document) === id);

    found = Boolean(documentToRemove);

    if (found) {
      data[type] = documents.filter((document) => document !== documentToRemove);
    }
  });

  return found;
}
