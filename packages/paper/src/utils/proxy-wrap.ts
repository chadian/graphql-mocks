import { DocumentStore, Document } from '../types';
import { getConnections } from '../utils/get-connections';
import { findDocument } from './find-document';
import { isDocument } from './is-document';

export function proxyWrap<T extends DocumentStore | Document>(store: DocumentStore, target: T): T {
  return new Proxy(target, {
    get(target, prop) {
      if (typeof prop !== 'string') {
        return Reflect.get(target, prop);
      }

      if (Reflect.has(target, prop)) {
        let result = Reflect.get(target, prop);

        if (typeof result === 'function') {
          const origFn = result;

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          result = function (...args: any) {
            const fnResult = origFn.call(target, ...args);
            return proxyWrap(store, fnResult);
          };
        }

        const wrapped = typeof result === 'object' ? proxyWrap(store, result) : result;
        return wrapped;
      }

      if (isDocument(target)) {
        const connectedDocumentKeys = getConnections(target)[prop];

        if (connectedDocumentKeys) {
          const connectedDocuments = Array.from(connectedDocumentKeys)
            .map((key) => findDocument(store, key))
            .filter(Boolean)
            .map((document) => proxyWrap(store, document as Document));

          // TODO: Do type check on whether to return singular or plural
          return connectedDocuments.length === 1 ? connectedDocuments[0] : connectedDocuments;
        }
      }

      return Reflect.get(target, prop);
    },

    set() {
      throw new Error('Setting on data pulled from the store is not allowed, use the `mutate` method.');
    },
  });
}
