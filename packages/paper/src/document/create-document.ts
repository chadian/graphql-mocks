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
  if (!typename) {
    throw new Error('The document type name is a required argument');
  }

  const document = { ...partial };

  Object.defineProperty(document, DOCUMENT_KEY_SYMBOL, {
    enumerable: false,
    configurable: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: partial[DOCUMENT_KEY_SYMBOL as any] ?? key ?? generateDocumentKey(),
  });

  Object.defineProperty(document, DOCUMENT_GRAPHQL_TYPENAME, {
    enumerable: false,
    configurable: false,
    value: typename,
  });

  Object.defineProperty(document, DOCUMENT_CONNECTIONS_SYMBOL, {
    enumerable: false,
    configurable: false,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: partial[DOCUMENT_CONNECTIONS_SYMBOL as any] ?? {},
  });

  Object.defineProperty(document, '__typename', {
    configurable: false,
    enumerable: false,

    get() {
      return typename;
    },

    set() {
      throw new Error('__typename on the document cannot be set');
    },
  });

  return document as T;
}
