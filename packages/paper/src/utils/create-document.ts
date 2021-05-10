import { Document } from '../types';
import { DOCUMENT_CONNECTIONS_SYMBOL, DOCUMENT_KEY_SYMBOL } from '../constants';
import { generateDocumentKey } from './generate-document-key';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDocument<T extends Document = Document>(partial: Record<string | symbol, any>, id?: string): T {
  return {
    ...partial,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [DOCUMENT_CONNECTIONS_SYMBOL]: partial[DOCUMENT_CONNECTIONS_SYMBOL as any] ?? {},

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [DOCUMENT_KEY_SYMBOL]: partial[DOCUMENT_KEY_SYMBOL as any] ?? id ?? generateDocumentKey(),
  } as T;
}
