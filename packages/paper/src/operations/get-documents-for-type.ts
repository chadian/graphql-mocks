export function getDocumentsForTypeOperation(context, type) {
  const {data} = context;
  return data[type];
}
