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
  if (typeof window.CustomEvent === "function")
    return false;

  function CustomEvent (event, params) {
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
      if (running)
        return;

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
  throttle("keyup", "ab-keyup");
})();

// deep extend function
var extend = function() {
  var extended = {};
  var deep = false;
  var i = 0;
  var length = arguments.length;

  if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]'){
    deep = arguments[0];
    i++;
  }

  var merge = function(obj) {
    for (var prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          extended[prop] = extend(true, extended[prop], obj[prop]);
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
};

// test if a string is a JSON
var isJson = function(str) {
  try {
    JSON.parse(str);
  } catch(e) {
    return false;
  }
  return true;
};


window.AB = {
  runUpdaters: function(plugin) {
    if (this.options[plugin]) {
      this.plugins[plugin](this.options[plugin]);
    } else {
      for(var options in AB.options){
        if(this.options.hasOwnProperty(options)) {
          this.plugins[options](this.options[options]);
        }
      }
    }
  },
  plugins: {},
  options: {}
};


module.exports = {
  extend: extend,
  isJson: isJson,
  AB: window.AB
};


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
// TODO: don't recreate placeholder



var anotherBrick = __webpack_require__(0); // dev mode
var mediaQuery = __webpack_require__(2); // dev mode
// var anotherBrick = require('another-brick');

var pluginName = 'abInterchange';
var attr = 'data-ab-interchange';
var attrSrc = 'data-ab-interchange-src';
var defaultSettings = {
  mode: 'img',
  lazySettings: {
    offscreen: 1,
    delayed: null,
    layout: 'fluid' // 'fixed': fixed dimensions
  }
};

// get width and height from attributes and manage multiple dimensions
var _getWidthHeight = function() {
  var width = this.el.getAttribute('width');
  var height = this.el.getAttribute('height');
  var widthObj = {};
  var heightObj = {};

  if (anotherBrick.isJson(width) && anotherBrick.isJson(height)) {
    widthObj = JSON.parse(width);
    heightObj = JSON.parse(height);

    for (var key in widthObj) {
      if (widthObj.hasOwnProperty(key)) {
        if (window.AB.mediaQuery.is(key)) {
          width = widthObj[key];
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

// build the DOM for img mode (to prevent big reflow)
var _setPlaceholder = function() {
  var placeholderNode = document.createElement('div');
  var imgNode = document.createElement('img');
  var alt = this.el.getAttribute('alt');
  var widthHeight = _getWidthHeight.call(this);
  var width = widthHeight.width;
  var height = widthHeight.height;

  this.el.innerHTML = '';
  this.el.style.overflow = 'hidden';
  this.el.style.position = 'relative';
  this.el.classList.add('ab-interchange-loading');

  if (this.settings.lazySettings.layout === 'fixed') {
    this.el.style.height = height +'px';
    this.el.style.width = width +'px';
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
  imgNode.alt = alt || ''; // always put an 'alt'

  this.el.appendChild(placeholderNode);
  this.el.appendChild(imgNode);

  this._imgNode = this.el.querySelector('img');
};

// Run right methods depending on 'mode'
var _replace = function() {
  if (this._replaced) return;
  if (this.mode === 'img') _replaceImg.call(this);
  if (this.mode === 'background') _replaceBackground.call(this);
};

// Replace img src
var _replaceImg = function() {
  var that = this;
  var img = new Image();

  if (this._imgNode.src === this.currentPath || !this.inView())
    return;

  if (this.mode === 'img')
    _setPlaceholder.call(this);

  img.onload = function() {
    that._imgNode.src = that.currentPath;
    _isReplaced.call(that);
    that._replaced = true;
  }
  img.src = this.currentPath;
};

// Replace background-image src
var _replaceBackground = function() {
  var that = this;
  var img = new Image();
console.log(this.el.style.backgroundImage, 'url("'+ this.currentPath +'")');
  if (this.el.style.backgroundImage === 'url("'+ this.currentPath +'")' || !this.inView())
    return;

  if (this.currentPath) {
    // to check img loading
    img.onload = function() {
      that.el.style.backgroundImage = 'url('+ that.currentPath +')';
      _isReplaced.call(that);
      // we are done
      that._replaced = true;
    }
    img.src = this.currentPath;
  } else {
    this.el.style.backgroundImage = 'none';
  }
};

// run after source is replaced
var _isReplaced = function() {
  this.el.classList.remove('ab-interchange-loading');

  window.dispatchEvent(new CustomEvent('replaced.ab-interchange', {
    detail: { element: this.el }
  }));
};

var _events = function() {
  var rootMargin = "";
  var observer;

  // update path, then replace
  window.addEventListener('changed.ab-mediaquery', this.resetDisplay.bind(this));

  if ('IntersectionObserver' in window) {
    rootMargin = parseInt((this.settings.lazySettings.offscreen - 1) * window.innerHeight, 10) +'px';

    observer = new IntersectionObserver(_onScroll.bind(this), {
      root: null,
      rootMargin: '0px 0px '+ rootMargin +' 0px',
      threshold: 0
    });

    observer.observe(this.el);
  } else {
    window.addEventListener('ab-scroll', _onScroll.bind(this));
  }
};

// build rules from attribute
var _generateRules = function() {
  var rulesList = [];
  var getAttrSrc = this.el.getAttribute(attrSrc);
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
};

// Change source path depending on rules
var _updatePath = function() {
  var path = '';
  var rules = this.rules;

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

// init instance
var _init = function() {
  var that = this;

  // replace anyway after a delay (for offline support)
  if (this.settings.lazySettings.delayed) {
    this._lazyTimer = setTimeout(function() {
      _replace.call(that);
    }, this.settings.lazySettings.delayed);
  }

  if (this.mode === 'img') _setPlaceholder.call(this);
  _events.call(this);
  _generateRules.call(this);
  _updatePath.call(this);
};

var Plugin = function (el, options) {
  this.el = el;

  var dataOptions = anotherBrick.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
  this.settings = anotherBrick.extend(true, defaultSettings, options, dataOptions);

  this.rules = [];
  this.currentPath = '';
  this.mode = this.settings.mode;
  this.replaced = false;
  this._imgNode = this.el; // where the source will be updated
  this._lazyTimer; // for delayed setTimeout

  _init.call(this);
};

Plugin.prototype = {
  // Force element refresh
  resetDisplay: function() {
    this._replaced = false;
    _updatePath.call(this);
  },

  // check if element is in view
  inView: function() {
    var windowHeight = window.innerHeight;
    var rect = this.el.getBoundingClientRect();
    var elHeight = this.el.offsetHeight;
    var checkTop = - (elHeight) - windowHeight * (this.settings.lazySettings.offscreen - 1);
    var checkBottom = windowHeight + windowHeight * (this.settings.lazySettings.offscreen - 1);

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
module.exports = interchange;


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var anotherBrick = __webpack_require__(0); // dev mode
// var anotherBrick = require('another-brick');

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
module.exports = mediaQuery;


/***/ })
/******/ ]);