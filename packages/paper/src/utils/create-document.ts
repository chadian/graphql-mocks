import { Document } from '../types';
import { CONNECTION_KEY_SYMBOL, DOCUMENT_ID_SYMBOL } from '../constants';
import { generateDocumentKey } from './generate-document-key';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDocument<T extends Document = Document>(partial: Record<string | symbol, any>, id?: string): T {
  return {
    ...partial,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [CONNECTION_KEY_SYMBOL]: partial[CONNECTION_KEY_SYMBOL as any] ?? {},

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [DOCUMENT_ID_SYMBOL]: partial[DOCUMENT_ID_SYMBOL as any] ?? id ?? generateDocumentKey(),
  } as T;
}
