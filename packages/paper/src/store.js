const { produce, setAutoFreeze } = require('immer');
const { proxyWrap } = require('./utils/proxy-wrap');
const { transaction } = require('./transaction');

// Auto Freezing needs to be disabled because it interfers with using
// of using js a `Proxy` on the resulting data, see:
// > 18.5.5.7 Example: non-writable non-configurable target properties
// > must be represented faithfully
// > https://exploringjs.com/deep-js/ch_proxies.html
setAutoFreeze(false);

class Store {
  history = [];
  _data = {};

  get data() {
    return proxyWrap(this, this._data);
  }

  mutate(fn) {
    const next = produce(transaction)(this._data, fn);
    //validate(next);
    this.history.push(next);
    this._data = next;

    return this;
  }
}

module.exports = { Store };
