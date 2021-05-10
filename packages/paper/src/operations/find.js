const { findDocument } = require('../utils/find-document');

function findOperation(context, id) {
  const {data} = context;
  return findDocument(data, id);
}

module.exports = {findOperation};
