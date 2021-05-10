const { getConnections } = require('../utils/get-connections');
const { findDocument } = require('./find-document');

function proxyWrap(store, target) {
  return new Proxy(target, {
    get(target, prop) {
      if (Reflect.has(target, prop)) {
        let result = Reflect.get(target, prop);

        // this is important for maintaining the original `this` reference
        // for functions where it is critical (ie: Map and Set)
        if (typeof result === 'function') {
          result = result.bind(target);
        }

        const wrapped =
          typeof result === 'object'
            ? proxyWrap(store, result)
            : result;
        return wrapped;
      }

      const connectedDocumentKeys = getConnections(target)[prop];
      if (connectedDocumentKeys) {
        const connectedDocuments = Array.from(connectedDocumentKeys)
          .map((key) => findDocument(store._data, key))
          .map((document) => proxyWrap(store, document));

        return connectedDocuments.length === 1
          ? connectedDocuments[0]
          : connectedDocuments;
      }

      return Reflect.get(target, prop);
    },

    set() {
      throw new Error(
        'Setting on data pulled from the store is not allowed, use the `mutate` method.'
      );
    },
  });
}

module.exports = { proxyWrap }
