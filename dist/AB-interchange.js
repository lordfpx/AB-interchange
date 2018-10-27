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
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


window.AB = __webpack_require__(1);

var pluginName = 'interchange',
    attr       = 'data-ab-interchange',
    attrSrc    = 'data-ab-interchange-src',
    defaultSettings = {
      mode: 'img',
      lazySettings: {
        offscreen: 1.25,
        delayed:   false,
        layout:    'fluid' // 'fixed': fixed dimensions
      }
    };

// Run right methods depending on 'mode'
var _replace = function() {
  if (this._replaced)
    return;

  switch(this.mode) {
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
};

// Replace source: img or lazy-img
var _replaceImg = function(lazy) {
  if (this._imgNode.src === this.currentPath || (lazy && !this.inView()))
    return;

  this._imgNode.src = this.currentPath;
  this._imgNode.addEventListener('load', _isReplaced.bind(this));

  // we are done
  this._replaced = true;
};

// Replace source: background or lazy-background
var _replaceBackground = function(lazy) {
  if (this.el.style.backgroundImage === 'url("'+ this.currentPath +'")' || (lazy && !this.inView()))
    return;

  if (this.currentPath)
    this.el.style.backgroundImage = 'url('+ this.currentPath +')';
  else
    this.el.style.backgroundImage = 'none';

  this.el.addEventListener('load', _isReplaced.bind(this));
};

// init instance
var _init = function() {
  var that = this;

  // no need when using 'img' on browsers supporting that, except when using lazy loading
  if ((this.el.parentNode.tagName === 'PICTURE' || this.el.getAttribute('srcset')) && window.HTMLPictureElement)
    return;

  // replace anyway after a delay (for offline support)
  if (this.settings.lazySettings.delayed) {
    this._lazyTimer = setTimeout(function() {
      _replace.call(that);
    }, this.settings.lazySettings.delayed);
  }

  _setPlaceholder.call(this);
  _events.call(this);
  _generateRules.call(this);
  _updatePath.call(this);
};

// build the DOM for lazy-img mode
var _setPlaceholder = function() {
  var placeholderNode = document.createElement('div'),
      imgNode         = document.createElement('img'),
      alt             = this.el.getAttribute('alt'),
      widthHeight     = _getWidthHeight.call(this),
      width           = widthHeight.width,
      height          = widthHeight.height,
      isNotReady      = !width || !height;

  if (this.mode !== 'lazy-img' || isNotReady)
    return;

  this.el.innerHTML = '';

  this.el.style.overflow = 'hidden';
  this.el.style.position = 'relative';
  this.el.classList.add('ab-interchange-loading');

  if (this.settings.lazySettings.layout === 'fixed') {
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

  this._imgNode = this.el.querySelector('img');
};

// run after source is replaced
var _isReplaced = function() {
  this.el.classList.remove('ab-interchange-loading');

  var event = new CustomEvent('replaced.ab-interchange', {
    detail: { element: this.el }
  });
  window.dispatchEvent(event);
};

var _events = function() {
  var observer, rootMargin = "";

  // update path, then replace
  window.addEventListener('changed.ab-mediaquery', this.resetDisplay.bind(this));

  if (this.mode === 'lazy-img' || this.mode === 'lazy-background') {
    if ('IntersectionObserver' in window) {
      rootMargin = parseInt((this.settings.lazySettings.offscreen - 1) * window.innerHeight) +'px';

      observer = new IntersectionObserver(_onScroll.bind(this), {
        root: null,
        rootMargin: '0px 0px '+ rootMargin +' 0px',
        threshold: 0
      });

      observer.observe(this.el);
    } else {
      window.addEventListener('ab-scroll', _onScroll.bind(this));
    }
  }
};

// build rules from attribute
var _generateRules = function() {
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
};

// Change source path depending on rules
var _updatePath = function() {
  var path  = '',
      rules = this.rules;

  // Iterate through each rule
  for (var i = 0, len = rules.length; i < len; i++) {
    if (window.AB.mediaQuery.is(rules[i].query))
      path = rules[i].path;
  }

  // if path hasn't changed, return
  if (this.currentPath === path)
    return;

  this.currentPath = path;
  _replace.call(this);
};

var _onScroll = function() {
  // when inView, no need to use 'delayed'
  if (this.inView() && !this._replaced) {
    clearTimeout(this._lazyTimer);
    _replace.call(this);
  }
};

// define the right mode
var _defineMode = function() {
  // if img tag: no choice
  if (this.el.tagName === 'IMG')
    return 'img';

  return this.settings.mode;
};

// get width and height from attributes and manage multiple dimensions
var _getWidthHeight = function() {
  var width     = this.el.getAttribute('width'),
      height    = this.el.getAttribute('height'),
      widthObj  = {},
      heightObj = {};

  if (window.AB.isJson(width) && window.AB.isJson(height)) {
    widthObj  = JSON.parse(width);
    heightObj = JSON.parse(height);

    for (var key in widthObj) {
      if (widthObj.hasOwnProperty(key)) {
        if (window.AB.mediaQuery.is(key)) {
          width  = widthObj[key];
          height = heightObj[key];
        }
      }
    }
  }

  return {
    width: width,
    height: height
  };
};


var Plugin = function (el, options) {
  this.el = el;

  var dataOptions = window.AB.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
  this.settings   = window.AB.extend(true, defaultSettings, options, dataOptions);

  this.rules       = [];
  this.currentPath = '';
  this.mode        = _defineMode.call(this);
  this.replaced   = false;
  this._lazyTimer; // for delayed setTimeout
  this._imgNode     = this.el; // where the source will be updated

  _init.call(this);
};

Plugin.prototype = {
  // Force elmeent refresh
  resetDisplay: function() {
    this._replaced = false;

    _setPlaceholder.call(this);
    _updatePath.call(this);
  },

  inView: function() {
    var windowHeight = window.innerHeight,
        rect         = this.el.getBoundingClientRect(),
        elHeight     = this.el.offsetHeight,
        checkTop     = - (elHeight) - windowHeight * (this.settings.lazySettings.offscreen - 1),
        checkBottom  = windowHeight + windowHeight * (this.settings.lazySettings.offscreen - 1);

    return (rect.top >= checkTop && rect.top <= checkBottom);
  }
};

var interchange = function(options) {
  var elements = document.querySelectorAll('['+ attr +']');
  for (var i = 0, len = elements.length; i < len; i++) {
    if (elements[i][pluginName])
      continue;
    elements[i][pluginName] = new Plugin(elements[i], options);
  }

  // register plugin and options
  if (!window.AB.options[pluginName])
    window.AB.options[pluginName] = options;
};

window.AB.plugins.interchange = interchange;
module.exports = window.AB;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


window.AB = __webpack_require__(2);

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


/***/ }),
/* 2 */
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


/***/ })
/******/ ]);