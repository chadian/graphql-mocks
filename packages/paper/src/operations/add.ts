import { Document, DocumentPartial, OperationContext } from '../types';
import { createDocument } from '../utils/create-document';

export function addOperation(context: OperationContext, typename: string, documentPartial: DocumentPartial): Document {
  const { data } = context;
  data[typename] = data[typename] || [];
  const document = createDocument(documentPartial);
  data[typename].push(document);

  return document;
}

// Only used for generating type after the resulting `bind`
const bound = addOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
