import { Operation, OperationContext } from '../types';
import { nullDocument } from '../utils/null-document';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getNullDocumentOperation: Operation = function getNullDocument(_context: OperationContext) {
  return nullDocument;
};

// Only used for generating type after the resulting `bind`
const bound = getNullDocumentOperation.bind(null, {} as OperationContext);
export type ContextualOperation = typeof bound;
