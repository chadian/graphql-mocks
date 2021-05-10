import { Document, DocumentPartial, Operation } from '../types';
import { createDocument } from '../utils/create-document';

export const addOperation: Operation = function addOperation(
  context,
  typename: string,
  documentPartial: DocumentPartial,
): Document {
  const { data } = context;
  data[typename] = data[typename] || [];
  const document = createDocument(documentPartial);
  data[typename].push(document);

  return document;
};
