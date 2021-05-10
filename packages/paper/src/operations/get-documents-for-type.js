function getDocumentsForTypeOperation(context, type) {
  const {data} = context;
  return data[type];
}

module.exports = { getDocumentsForTypeOperation }
