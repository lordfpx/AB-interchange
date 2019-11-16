// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"cnAZ":[function(require,module,exports) {
// polyfill customEvent pour IE
;(function() {
  if (typeof window.CustomEvent === "function") return false;
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent('CustomEvent');
    evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
    return evt;
  }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

// throttle events with requestAnimationFrame
(function() {
  var throttle = function(type, name) {
    var running = false;
    var func = function() {
      if (running) return;

      running = true;
        window.requestAnimationFrame(function() {
          window.dispatchEvent(new CustomEvent(name));
          running = false;
      });
    };
    window.addEventListener(type, func);
  };

  /* init - you can init any event */
  throttle("resize", "ab-resize");
  throttle("scroll", "ab-scroll");
  throttle("mousemove", "ab-mousemove");
  throttle("touchmove", "ab-touchmove");
})();


window.AB = {
  // deep extend function
  extend: function() {
    var extended = {},
        deep     = false,
        i        = 0,
        length   = arguments.length;

    if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]'){
      deep = arguments[0];
      i++;
    }

    var merge = function(obj) {
      for (var prop in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, prop)) {
          if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
            extended[prop] = window.AB.extend(true, extended[prop], obj[prop]);
          } else {
            extended[prop] = obj[prop];
          }
        }
      }
    };

    for (; i < length; i++) {
      merge(arguments[i]);
    }

    return extended;
  },

  // test if a string is a JSON
  isJson: function(str) {
    try {
      JSON.parse(str);
    } catch(e) {
      return false;
    }
    return true;
  },

  runUpdaters: function(plugin) {
    if (window.AB.options[plugin]) {
      window.AB.plugins[plugin](window.AB.options[plugin]);
    } else {
      for(var options in AB.options){
        if(window.AB.options.hasOwnProperty(options))
          window.AB.plugins[options](window.AB.options[options]);
      }
    }
  },

  plugins: {},
  options: {}
};

module.exports = window.AB;

},{}],"TYbL":[function(require,module,exports) {
'use strict';

window.AB = require('another-brick');

var mediaQuery = function(opt) {
  window.AB.mediaQuery = (function() {
    var _settings = opt || {bp: {}};

    var _getCurrent = function() {
      var sizes = [];

      for (var key in _settings.bp) {
        if (_settings.bp.hasOwnProperty(key) && window.matchMedia(_settings.bp[key]).matches) {
          sizes.push(key);
        }
      }

      return sizes;
    };

    var _updateSizes = function() {
      var newSize = _getCurrent();

      // check if it's updated
      if (newSize.join('|') !== _currentStore.join('|')) {
        _currentStore = newSize;
        window.dispatchEvent(new CustomEvent('changed.ab-mediaquery'));
      }
    };

    var is = function(size) {
      if (_settings.bp[size])
        return window.matchMedia(_settings.bp[size]).matches;
    };

    // get current breakpoints
    var _currentStore = _getCurrent()

    // change on resize
    window.addEventListener('ab-resize', _updateSizes);

    return {
      get current() { return _currentStore; },
      is: is
    };
  })();
};


window.AB.plugins.mediaQuery = mediaQuery;
module.exports = window.AB;

},{"another-brick":"cnAZ"}],"Focm":[function(require,module,exports) {
'use strict';

window.AB = require('ab-mediaquery');
var pluginName = 'abInterchange';
var attr = 'data-ab-interchange';
var attrSrc = 'data-ab-interchange-src';
var defaultSettings = {
  mode: 'img',
  lazySettings: {
    offscreen: 1.25,
    delayed: false,
    layout: 'fluid' // 'fixed': fixed dimensions

  }
}; // Run right methods depending on 'mode'

function _replace() {
  if (this._replaced) return;

  switch (this.mode) {
    case 'img':
      _replaceImg.call(this);

      break;

    case 'lazy-img':
      _replaceImg.call(this, true);

      break;

    case 'background':
      _replaceBackground.call(this);

      break;

    case 'lazy-background':
      _replaceBackground.call(this, true);

      break;
  }
} // Replace source: img or lazy-img


function _replaceImg(lazy) {
  if (this._imgNode.src === this.currentPath || lazy && !this.inView()) return;
  this._imgNode.src = this.currentPath;

  this._imgNode.addEventListener('load', _isReplaced.bind(this)); // we are done


  this._replaced = true;
} // Replace source: background or lazy-background


function _replaceBackground(lazy) {
  if (this.el.style.backgroundImage === 'url("' + this.currentPath + '")' || lazy && !this.inView()) return;

  if (this.currentPath) {
    this.el.style.backgroundImage = 'url(' + this.currentPath + ')';
  } else {
    this.el.style.backgroundImage = 'none';
  }

  this.el.addEventListener('load', _isReplaced.bind(this));
} // init instance


function _init() {
  var that = this; // no need when using 'img' on browsers supporting that, except when using lazy loading

  if ((this.el.parentNode.tagName === 'PICTURE' || this.el.getAttribute('srcset')) && window.HTMLPictureElement) return; // replace anyway after a delay (for offline support)

  if (this.settings.lazySettings.delayed) {
    this._lazyTimer = setTimeout(function () {
      _replace.call(that);
    }, this.settings.lazySettings.delayed);
  }

  _setPlaceholder.call(this);

  _events.call(this);

  _generateRules.call(this);

  _updatePath.call(this);
} // build the DOM for lazy-img mode


function _setPlaceholder() {
  var placeholderNode = document.createElement('div');
  var imgNode = document.createElement('img');
  var alt = this.el.getAttribute('alt');

  var widthHeight = _getWidthHeight.call(this);

  var width = widthHeight.width;
  var height = widthHeight.height;
  var isNotReady = !width || !height;
  var fragment = document.createDocumentFragment();
  if (this.mode !== 'lazy-img' || isNotReady) return;
  this.el.innerHTML = '';
  this.el.style.overflow = 'hidden';
  this.el.style.position = 'relative';
  this.el.classList.add('ab-interchange-loading');

  if (this.settings.lazySettings.layout === 'fixed') {
    this.el.style.height = height + 'px';
    this.el.style.width = width + 'px';
  }

  placeholderNode.classList.add('ab-interchange-placeholder');
  placeholderNode.style.paddingTop = (height / width * 100).toFixed(2) + "%";
  imgNode.style.position = 'absolute';
  imgNode.style.top = 0;
  imgNode.style.right = 0;
  imgNode.style.bottom = 0;
  imgNode.style.left = 0;
  imgNode.style.maxHeight = '100%';
  imgNode.style.minHeight = '100%';
  imgNode.style.maxWidth = '100%';
  imgNode.style.minWidth = '100%';
  imgNode.style.height = 0;
  imgNode.alt = alt === null ? '' : alt; // always put an 'alt'

  fragment.appendChild(placeholderNode);
  fragment.appendChild(imgNode);
  this.el.appendChild(fragment);
  this._imgNode = this.el.querySelector('img');
} // run after source is replaced


function _isReplaced() {
  this.el.classList.remove('ab-interchange-loading');
  var event = new CustomEvent('replaced.ab-interchange', {
    detail: {
      element: this.el
    }
  });
  window.dispatchEvent(event);
}

function _events() {
  var observer;
  var rootMargin = ""; // update path, then replace

  window.addEventListener('changed.ab-mediaquery', this.resetDisplay.bind(this));

  if (this.mode === 'lazy-img' || this.mode === 'lazy-background') {
    if ('IntersectionObserver' in window) {
      rootMargin = parseInt((this.settings.lazySettings.offscreen - 1) * window.innerHeight) + 'px';
      observer = new IntersectionObserver(_onScroll.bind(this), {
        root: null,
        rootMargin: '0px 0px ' + rootMargin + ' 0px',
        threshold: 0
      });
      observer.observe(this.el);
    } else {
      window.addEventListener('ab-scroll', _onScroll.bind(this));
    }
  }
} // build rules from attribute


function _generateRules() {
  var rulesList = []; // retro compatibility: sources inside 'attr'

  var getAttrSrc = this.el.getAttribute(attrSrc) ? this.el.getAttribute(attrSrc) : this.el.getAttribute(attr);
  var rules = getAttrSrc.match(/\[[^\]]+\]/g);
  var rule, path, query;

  for (var i = 0, len = rules.length; i < len; i++) {
    rule = rules[i].slice(1, -1).split(', ');
    path = rule.slice(0, -1).join('');
    query = rule[rule.length - 1];
    rulesList.push({
      path: path,
      query: query
    });
  }

  this.rules = rulesList;
} // Change source path depending on rules


function _updatePath() {
  var path = '';
  var rules = this.rules; // Iterate through each rule

  for (var i = 0, len = rules.length; i < len; i++) {
    if (window.AB.mediaQuery.is(rules[i].query)) {
      path = rules[i].path;
    }
  } // if path hasn't changed, return


  if (this.currentPath === path) return;
  this.currentPath = path;

  _replace.call(this);
}

function _onScroll() {
  // when inView, no need to use 'delayed'
  if (this.inView() && !this._replaced) {
    clearTimeout(this._lazyTimer);

    _replace.call(this);
  }
} // define the right mode


function _defineMode() {
  // if img tag: no choice
  if (this.el.tagName === 'IMG') return 'img';
  return this.settings.mode;
} // get width and height from attributes and manage multiple dimensions


function _getWidthHeight() {
  var width = this.el.getAttribute('width');
  var height = this.el.getAttribute('height');
  var widthObj = {};
  var heightObj = {};

  if (window.AB.isJson(width) && window.AB.isJson(height)) {
    widthObj = JSON.parse(width);
    heightObj = JSON.parse(height);

    for (var key in widthObj) {
      if (widthObj.hasOwnProperty(key) && window.AB.mediaQuery.is(key)) {
        width = widthObj[key];
        height = heightObj[key];
      }
    }
  }

  return {
    width: width,
    height: height
  };
}

var Plugin = function Plugin(el, options) {
  this.el = el;
  var dataOptions = window.AB.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
  this.settings = window.AB.extend(true, defaultSettings, options, dataOptions);
  this.rules = [];
  this.currentPath = '';
  this.mode = _defineMode.call(this);
  this.replaced = false;
  this._lazyTimer; // for delayed setTimeout

  this._imgNode = this.el; // where the source will be updated

  _init.call(this);
};

Plugin.prototype = {
  // Force elmeent refresh
  resetDisplay: function resetDisplay() {
    this._replaced = false;

    _setPlaceholder.call(this);

    _updatePath.call(this);
  },
  inView: function inView() {
    var windowHeight = window.innerHeight;
    var rect = this.el.getBoundingClientRect();
    var elHeight = this.el.offsetHeight;
    var checkTop = -elHeight - windowHeight * (this.settings.lazySettings.offscreen - 1);
    var checkBottom = windowHeight + windowHeight * (this.settings.lazySettings.offscreen - 1);
    return rect.top >= checkTop && rect.top <= checkBottom;
  }
};

function interchange(options) {
  var elements = document.querySelectorAll('[' + attr + ']');

  for (var i = 0, len = elements.length; i < len; i++) {
    if (elements[i][pluginName]) continue;
    elements[i][pluginName] = new Plugin(elements[i], options);
  } // register plugin and options


  if (!window.AB.options[pluginName]) {
    window.AB.options[pluginName] = options;
  }
}

window.AB.plugins.interchange = interchange;
module.exports = window.AB;
},{"ab-mediaquery":"TYbL"}]},{},["Focm"], null)