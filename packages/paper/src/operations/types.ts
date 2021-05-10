import { ContextualOperation as AddContextualOperation } from './add';
import { ContextualOperation as ConnectContextualOperation } from './connect';
import { ContextualOperation as FindContextualOperation } from './find';
import { ContextualOperation as GetDocumentsForTypeContextualOperation } from './get-documents-for-type';
import { ContextualOperation as PutContextualOperation } from './put';
import { ContextualOperation as RemoveContextualOperation } from './remove';
import { ContextualOperation as GetNullContextOperation } from './get-null-document';

export type DefaultContextualOperations = {
  add: AddContextualOperation;
  connect: ConnectContextualOperation;
  find: FindContextualOperation;
  getDocumentsForType: GetDocumentsForTypeContextualOperation;
  getNullDocument: GetNullContextOperation;
  put: PutContextualOperation;
  remove: RemoveContextualOperation;
};
