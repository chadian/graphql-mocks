import { Document } from '../types';
import { DOCUMENT_CONNECTIONS_SYMBOL, DOCUMENT_KEY_SYMBOL, DOCUMENT_GRAPHQL_TYPENAME } from '../constants';
import { generateDocumentKey } from './generate-document-key';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createDocument<T extends Document = Document>(
  typename: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partial: Record<string | symbol, any>,
  key?: string,
): T {
  return {
    ...partial,

    [DOCUMENT_GRAPHQL_TYPENAME]: typename,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [DOCUMENT_CONNECTIONS_SYMBOL]: partial[DOCUMENT_CONNECTIONS_SYMBOL as any] ?? {},

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [DOCUMENT_KEY_SYMBOL]: partial[DOCUMENT_KEY_SYMBOL as any] ?? key ?? generateDocumentKey(),
  } as T;
}
