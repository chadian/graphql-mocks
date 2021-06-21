import { cloneDocument } from '../document/clone-document';
import { Document, OperationContext } from '../types';

export function cloneOperation(context: OperationContext, document: Document): Document {
  const { store } = context;
  const cloned = cloneDocument(document);
  const typename = cloned.__typename;
  // setup array of types if it doesn't already exist
  store[typename] = store[typename] || [];
  store[typename].push(cloned);
  return cloned;
}
