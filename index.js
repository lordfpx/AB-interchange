'use strict';

window.AB = require('ab-mediaquery');

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
    detail: {
      element: this.el
    }
  });
  window.dispatchEvent(event);
};

var _events = function() {
  // update path, then replace
  window.addEventListener('changed.ab-mediaquery', this.resetDisplay.bind(this));

  if (this.mode === 'lazy-img' || this.mode === 'lazy-background')
    window.addEventListener('ab-scroll', _onScroll.bind(this));
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
