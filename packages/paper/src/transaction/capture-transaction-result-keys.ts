import { getDocumentKey } from '../document/get-document-key';
import { isDocument } from '../document/is-document';

export function captureTransactionResultKeys(
  result: unknown,
): null | undefined | string | string[] | Record<string, string> {
  const unallowedError = new Error(
    'Return values from transactions must be null, undefined, a Document, array of Document or an object with Document values',
  );

  if (result === undefined || result === null) {
    return result;
  }

  if (isDocument(result)) {
    return getDocumentKey(result);
  }

  if (Array.isArray(result)) {
    return result.map((item) => {
      if (!isDocument(item)) {
        throw unallowedError;
      }

      return getDocumentKey(item);
    });
  }

  if (typeof result === 'object') {
    const processed = {};

    for (const key in result) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = (result as any)[key];
      if (!isDocument(item)) {
        throw unallowedError;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (processed as Record<string, string>)[key] = getDocumentKey(item);
    }

    return processed;
  }

  throw unallowedError;
}
