// TODO: don't recreate placeholder

'use strict';

var anotherBrick = require('../AB/index.js'); // dev mode
var mediaQuery = require('../AB-mediaQuery/index.js'); // dev mode
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

  // charger tout
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
