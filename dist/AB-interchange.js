/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// polyfill customEvent pour IE
;(function() {
  if ( typeof window.CustomEvent === "function" ) return false;
  function CustomEvent ( event, params ) {
    params = params || { bubbles: false, cancelable: false, detail: undefined };
    var evt = document.createEvent( 'CustomEvent' );
    evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
    return evt;
   }
  CustomEvent.prototype = window.Event.prototype;
  window.CustomEvent = CustomEvent;
})();

// main public AB object
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

  plugins: {}
};

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var AB           = __webpack_require__(0),
    abMediaQuery = __webpack_require__(2);

var pluginName = 'interchange',
    attr       = 'data-ab-interchange',
    attrSrc    = 'data-ab-interchange-src';

var Plugin = function (el, options) {
  this.el = el;

  var dataOptions = window.AB.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
  this.settings = window.AB.extend(true, Plugin.defaults, options, dataOptions);

  this.rules         = [];
  this.currentPath   = '';
  this.settings.mode = this._defineMode();
  this.lazySettings  = this.settings.lazySettings;
  this.isLazy        = this.settings.lazy;
  this.replaced      = false;
  this.animated      = false; // for requestAnimationFrame
  this.lazyTimer; // for delayed setTimeout

  this.init();
};

Plugin.defaults = {
  mode:        'background',
  lazy:        false,
  lazySettings: {
    placeholder: false,
    offscreen:   1.5,
    delayed:     false,
    layout:      'fluid' // 'fixed': fixed dimensions
  }
};

Plugin.prototype = {
  init: function() {
    var that = this;

    // no need when using 'picture' on browsers supporting that, except when using lazy loading
    if (this.el.parentNode.matches('picture') && window.HTMLPictureElement && !this.isLazy)
      return this;

    // replace anyway after a delay (for offline support)
    if (this.isLazy && this.lazySettings.delayed) {
      this.lazyTimer = setTimeout(function() {
        that.isLazy = false;
        that._replace();
      }, this.lazySettings.delayed);
    }

    this._setPlaceholder()
        ._events()
        ._generateRules()
        ._updatePath();
  },

  _defineMode: function() {
    // in case of <img /> there is no doubt
    if (this.el.nodeName === 'IMG' || this.el.parentNode.matches('picture'))
      return 'img';

    return this.settings.mode;
  },

  _setPlaceholder: function() {
    var placeholderNode = document.createElement('div'),
        imgNode         = document.createElement('img'),
        alt             = this.el.getAttribute('alt'),
        width           = this.el.getAttribute('width'),
        height          = this.el.getAttribute('height'),
        isNotReady      = !this.lazySettings.placeholder || this.el.nodeName === 'IMG' || this.el.parentNode.matches('picture') || !width || !height;

    if (isNotReady)
      return this;

    this.el.style.overflow = 'hidden';
    this.el.style.position = 'relative';
    this.el.classList.add('ab-interchange-loading');

    if (this.lazySettings.layout === 'fixed') {
      this.el.style.height = height +'px';
      this.el.style.width  = width +'px';
    }

    placeholderNode.classList.add('ab-interchange-placeholder');
    placeholderNode.style.paddingTop = (height / width * 100).toFixed(2) + "%";

    imgNode.style.position  = 'absolute';
    imgNode.style.top       = 0;
    imgNode.style.right     = 0;
    imgNode.style.bottom    = 0;
    imgNode.style.left      = 0;
    imgNode.style.maxHeight = '100%';
    imgNode.style.minHeight = '100%';
    imgNode.style.maxWidth  = '100%';
    imgNode.style.minWidth  = '100%';
    imgNode.style.height    = 0;
    imgNode.alt             = (alt === null) ? '' : alt; // always put an 'alt'

    this.el.appendChild(placeholderNode);
    this.el.appendChild(imgNode);

    return this;
  },

  _events: function() {
    var that = this;

    // update path, then replace
    window.addEventListener('changed.ab-mediaquery', that._resetDisplay.bind(that));

    if (that.isLazy)
      window.addEventListener('scroll', that._requestAnimationFrame.bind(that));

    return that;
  },

  _generateRules: function() {
    var rulesList  = [],
        // retro compatibility: sources inside 'attr'
        getAttrSrc = this.el.getAttribute(attrSrc) ? this.el.getAttribute(attrSrc) : this.el.getAttribute(attr),
        rules      = getAttrSrc.match(/\[[^\]]+\]/g);

    for (var i = 0, len = rules.length; i < len; i++) {
      var rule  = rules[i].slice(1, -1).split(', '),
          path  = rule.slice(0, -1).join(''),
          query = rule[rule.length - 1];

      rulesList.push({
        path:  path,
        query: query
      });
    }

    this.rules = rulesList;

    return this;
  },

  _updatePath: function() {
    var path  = '',
        rules = this.rules;

    // if already replaced, we stop
    if (this.replaced)
      return this;

    // Iterate through each rule
    for (var i = 0, len = rules.length; i < len; i++) {
      if (window.AB.mediaQuery.is(rules[i].query))
        path = rules[i].path;
    }

    // if path hasn't changed, return
    if (this.currentPath === path)
      return this;

    this.currentPath = path;
    this._replace();
    this.el.classList.remove('ab-interchange-loading');

    return this;
  },

  _onScroll: function() {
    // when inView, no need to use 'delayed'
    if (this._inView()) {
      clearTimeout(this.lazyTimer);
      this._replace();
    }

    this.animated = false;
    return this;
  },

  _requestAnimationFrame: function() {
    if (this.replaced)
      return this;

    if (!this.animated)
      window.requestAnimationFrame(this._onScroll.bind(this));

    this.animated = true;
  },

  _resetDisplay: function() {
    this.replaced = false;
    this._updatePath();
  },

  _inView: function() {
    var windowHeight = window.innerHeight,
        rect         = this.el.getBoundingClientRect(),
        elHeight     = this.el.offsetHeight,
        checkTop     = - (elHeight) - windowHeight * (this.lazySettings.offscreen-1),
        checkBottom  = windowHeight + windowHeight * (this.lazySettings.offscreen - 1);

    return (rect.top >= checkTop && rect.top <= checkBottom);
  },

  _triggerEvent: function() {
    var event = new CustomEvent('replaced.ab-interchange', {
      detail: {
        element: this.el
      }
    });
    window.dispatchEvent(event);
  },

  _replace: function() {
    // if lazy load and not into view: stop
    if (this.isLazy && !this._inView())
      return this;

    if (this.settings.mode === 'img') {
      this._replaceImg();
    } else if (this.settings.mode === 'background') {
      this._replaceBackground();
    } else if (this.settings.mode === 'ajax') {
      this._replaceAjax();
    }

    // we are done
    this.replaced = true;
  },

  _replaceImg: function() {
    var replaceNode;

    if (this.lazySettings.placeholder)
      replaceNode = this.el.querySelector('img');
    else
      replaceNode = this.el;

    if (replaceNode === this.currentPath)
      return this;

    replaceNode.src = this.currentPath;

    replaceNode.addEventListener('load', this._triggerEvent.bind(this));
  },

  _replaceBackground: function() {
    if (this.el.style.backgroundImage === 'url("'+ this.currentPath +'")')
      return this;

    if (this.currentPath)
      this.el.style.backgroundImage = 'url('+ this.currentPath +')';
    else
      this.el.style.backgroundImage = 'none';

    this.el.addEventListener('load', this._triggerEvent.bind(this));
  },

  _replaceAjax: function() {
    var that = this;

    if (!this.currentPath) {
      this.el.innerHTML = '';
      return this;
    }

    var request = new XMLHttpRequest();
    request.open('GET', this.currentPath, true);

    request.onload = function () {
      if (this.status >= 200 && this.status < 400) {
        that.el.innerHTML = this.response;
        that._triggerEvent();
      } else {
        that.el.innerHTML = '';
      }
    };

    request.onerror = function() {
      this.el.innerHTML = '';
    };

    request.send();
  }
};

window.abInterchange = function(options) {
  var elements = document.querySelectorAll('['+ attr +']');
  for (var i = 0, len = elements.length; i < len; i++) {
    if (elements[i][pluginName]) continue;
    elements[i][pluginName] = new Plugin(elements[i], options);
  }
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var AB = __webpack_require__(0);

var Plugin = function(opt) {
  this.settings = window.AB.extend(true, Plugin.defaults, opt);
  this.queries  = this.settings.bp;
  this.current  = [];
  this.animated = false;

  this._init();
};

Plugin.defaults = {
  bp: {}
};

Plugin.prototype = {
  _init: function() {
    this.current = this._getCurrent();
    this._watcher();

    return this;
  },

  _getCurrent: function() {
    var sizes = [];

    for (var key in this.queries) {
      if (!this.queries.hasOwnProperty(key))
        continue;

      if (window.matchMedia(this.queries[key]).matches)
        sizes.push(key);
    }

    return sizes;
  },

  _watcher: function() {
    var that  = this;

    window.addEventListener('resize', function() {
      if (!that.animated) {
        window.requestAnimationFrame(that._updateSizes.bind(that));
        that.animated = true;
      }
    });
  },

  _updateSizes: function() {
    var newSize = this._getCurrent(),
        event   = new CustomEvent('changed.ab-mediaquery');

    this.animated = false;

    // check if it's updated
    if (newSize.join('|') !== this.current.join('|')) {
      this.current = newSize;
      window.dispatchEvent(event);
    }
  },

  is: function(size) {
    return window.matchMedia(this.queries[size]).matches;
  }
};

window.abMediaQuery = function(opt) {
  window.AB.mediaQuery = new Plugin(opt);
};


/***/ })
/******/ ]);