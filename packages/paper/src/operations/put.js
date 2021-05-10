const merge = require('lodash.merge');

function putOperation(context, id, document) {
  const found = findOperation(context, id);
  merge(found, document);

  return id;
}

module.exports = {putOperation};
