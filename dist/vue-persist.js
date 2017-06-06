(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VuePersist = factory());
}(this, (function () { 'use strict';

var index = function (Vue, ref) {
  if ( ref === void 0 ) ref = {};
  var defaultStoreName = ref.name; if ( defaultStoreName === void 0 ) defaultStoreName = 'persist:store';
  var defaultExpiration = ref.expiration;
  var read = ref.read; if ( read === void 0 ) read = function (k) { return localStorage.getItem(k); };
  var write = ref.write; if ( write === void 0 ) write = function (k, v) { return localStorage.setItem(k, v); };
  var clear = ref.clear; if ( clear === void 0 ) clear = function (k) { return localStorage.removeItem(k); };

  var cache = {};

  Vue.prototype.$persist = function (names, storeName, storeExpiration) {
    var this$1 = this;
    if ( storeName === void 0 ) storeName = defaultStoreName;
    if ( storeExpiration === void 0 ) storeExpiration = defaultExpiration;

    var store = cache[storeName] = JSON.parse(read(storeName) || '{}');
    store.data = store.data || {};

    if (isExpired(store.expiration)) {
      clear(storeName);
      store = {
        data: {},
        expiration: getExpiration(storeExpiration)
      };
    }

    if (!store.expiration) {
      store.expiration = getExpiration(storeExpiration);
    }

    this._persistWatchers = this._persistWatchers || [];

    var loop = function () {
      var name = list[i];

      if (typeof store.data[name] !== 'undefined') {
        set(this$1, name, store.data[name]);
      }

      if (this$1._persistWatchers.indexOf(name) === -1) {
        this$1._persistWatchers.push(name);

        this$1.$watch(name, function (val) {
          store.data[name] = val;
          write(storeName, JSON.stringify(store));
        }, { deep: true });
      }
    };

    for (var i = 0, list = names; i < list.length; i += 1) loop();
  };
};

var BRACKET_RE_S = /\['([^']+)'\]/g;
var BRACKET_RE_D = /\["([^"]+)"\]/g;

function getExpiration(exp) {
  return exp ? Date.now() + exp : 0
}

function isExpired(exp) {
  return exp && (Date.now() > exp)
}

function normalizeKeypath(key) {
  return key.indexOf('[') < 0 ?
    key :
    key.replace(BRACKET_RE_S, '.$1')
      .replace(BRACKET_RE_D, '.$1')
}

function set(obj, key, val) {
  key = normalizeKeypath(key);
  if (key.indexOf('.') < 0) {
    obj[key] = val;
    return
  }
  var d = -1;
  var path = key.split('.');
  var l = path.length - 1;
  while (++d < l) {
    if (obj[path[d]] === null) {
      obj[path[d]] = {};
    }
    obj = obj[path[d]];
  }
  obj[path[d]] = val;
}

return index;

})));
