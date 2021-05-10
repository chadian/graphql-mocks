const { getDocumentId } = require('../utils/get-document-id');

function removeOperation(context, id) {
  const {data} = context;
  let found = false;

  Object.entries(data).forEach(([type, documents]) => {
    const documentToRemove = documents.find(
      (document) => getDocumentId(document) === id
    );

    found = Boolean(documentToRemove);

    if (found) {
      data[type] = documents.filter(
        (document) => document !== documentToRemove
      );
    }
  });

  return found;
}

module.exports = { removeOperation }
