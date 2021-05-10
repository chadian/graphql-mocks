import { DOCUMENT_INTERNAL_TYPE } from '../constants';
import { DocumentStore } from '../types';
import { nullDocument } from './null-document';

export function createDocumentStore(): DocumentStore {
  return {
    [DOCUMENT_INTERNAL_TYPE]: [nullDocument],
  };
}
