'use strict';

window.AB = require('ab-mediaquery');

var pluginName = 'abInterchange';
var attr = 'data-ab-interchange';
var attrSrc = attr +'-src';
var defaultSettings = {
  mode: 'lazy-img',
  lazySettings: {
    offscreen: 1.25,
    layout: 'fluid', // or 'fixed' for fixed dimensions
  },
};

// Run right methods depending on 'mode'
function _replace() {
  if (this._replaced)
    return;

  switch(this.mode) {
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
}

// Replace source: lazy-img
function _replaceImg(lazy) {
  if (this._imgNode.src === this.currentPath || (lazy && !this.inView()))
    return;

  this._imgNode.src = this.currentPath;
  this._imgNode.addEventListener('load', _isReplaced.bind(this));

  // we are done
  this._replaced = true;
}

// Replace source: background or lazy-background
function _replaceBackground(lazy) {
  if (this.el.style.backgroundImage === 'url("'+ this.currentPath +'")' || (lazy && !this.inView()))
    return;

  this.el.style.backgroundImage = this.currentPath ? 'url('+ this.currentPath +')' : 'none';
  this.el.addEventListener('load', _isReplaced.bind(this));
}

// build the DOM for lazy-img mode
function _setPlaceholder() {
  var placeholderNode = document.createElement('div');
  var imgNode = document.createElement('img');
  var alt = this.el.getAttribute('alt');
  var widthHeight = _getWidthHeight.call(this);
  var width = widthHeight.width;
  var height = widthHeight.height;
  var isNotReady = !width || !height;
  var fragment = document.createDocumentFragment();

  if (this.mode !== 'lazy-img' || isNotReady)
    return;

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
  imgNode.style.top = imgNode.style.right = imgNode.style.bottom = imgNode.style.left = 0;
  imgNode.style.maxHeight = imgNode.style.minHeight = imgNode.style.maxWidth = imgNode.style.minWidth = '100%';
  imgNode.style.height = 0;
  imgNode.alt = (alt === null) ? '' : alt; // always put an 'alt'

  fragment.appendChild(placeholderNode);
  fragment.appendChild(imgNode);
  this.el.appendChild(fragment);

  this._imgNode = this.el.querySelector('img');
}

// run after source is replaced
function _isReplaced() {
  this.el.classList.remove('ab-interchange-loading');

  var event = new CustomEvent(pluginName +'.replaced', {
    detail: { element: this.el }
  });
  window.dispatchEvent(event);
}

function _events() {
  var observer;
  var rootMargin = "";

  // update path, then replace
  window.addEventListener('changed.ab-mediaquery', this.resetDisplay.bind(this));

  if (this.mode === 'lazy-img' || this.mode === 'lazy-background') {
    if ('IntersectionObserver' in window) {
      rootMargin = parseInt((this.settings.lazySettings.offscreen - 1) * window.innerHeight) +'px';

      observer = new IntersectionObserver(_onScroll.bind(this), {
        root: null,
        rootMargin: '0px 0px '+ rootMargin +' 0px',
        threshold: 0,
      });

      observer.observe(this.el);
    } else {
      // 'ab-scroll' is a custom event from AB dependency
      window.addEventListener('ab-scroll', _onScroll.bind(this));
    }
  }
}

// build rules from attribute
function _generateRules() {
  // retro compatibility: sources inside 'attr'
  var getAttrSrc = this.el.getAttribute(attrSrc) || this.el.getAttribute(attr);
  var rulesList  = [];
  var rules = getAttrSrc.match(/\[[^\]]+\]/g);
  var rule, path, query;

  for (var i = 0, len = rules.length; i < len; i++) {
    rule = rules[i].slice(1, -1).split(', ');
    path = rule.slice(0, -1).join('');
    query = rule[rule.length - 1];

    rulesList.push({
      path: path,
      query: query,
    });
  }

  this.rules = rulesList;
}

// Change source path depending on rules
function _updatePath() {
  var path = '';
  var rules = this.rules;

  // Iterate through each rule
  for (var i = 0, len = rules.length; i < len; i++) {
    if (window.AB.mediaQuery.is(rules[i].query)) {
      path = rules[i].path;
    }
  }

  // if path hasn't changed, return
  if (this.currentPath === path)
    return;

  this.currentPath = path;
  _replace.call(this);
}

function _onScroll() {
  // when inView, no need to use 'delayed'
  if (this.inView() && !this._replaced) {
    _replace.call(this);
  }
}

// get width and height from attributes and manage multiple dimensions
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
    height: height,
  };
}

// init instance
function _init() {
  _setPlaceholder.call(this);
  _events.call(this);
  _generateRules.call(this);
  _updatePath.call(this);
}

var Plugin = function (el, options) {
  this.el = el;

  var dataOptions = window.AB.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
  this.settings = window.AB.extend(true, defaultSettings, options, dataOptions);

  this.rules = [];
  this.currentPath = '';
  this.mode = this.settings.mode;
  this.replaced = false;
  this._imgNode = this.el; // where the source will be updated

  // no need when using 'img' on browsers supporting that, except when using lazy loading
  if ((this.el.tagName === 'IMG' || this.el.parentNode.tagName === 'PICTURE' || this.el.getAttribute('srcset')) && window.HTMLPictureElement)
    return;

  _init.call(this);
};

Plugin.prototype = {
  // Force element refresh
  resetDisplay: function() {
    this._replaced = false;
    _setPlaceholder.call(this);
    _updatePath.call(this);
  },

  inView: function() {
    var windowHeight = window.innerHeight;
    var rect = this.el.getBoundingClientRect();
    var elHeight = this.el.offsetHeight;
    var checkTop = - (elHeight) - windowHeight * (this.settings.lazySettings.offscreen - 1);
    var checkBottom = windowHeight + windowHeight * (this.settings.lazySettings.offscreen - 1);

    return (rect.top >= checkTop && rect.top <= checkBottom);
  },
};

function interchange(options) {
  var elements = document.querySelectorAll('['+ attr +']');

  for (var i = 0, len = elements.length; i < len; i++) {
    if (elements[i][pluginName]) continue;
    elements[i][pluginName] = new Plugin(elements[i], options);
  }

  // register plugin and options
  if (!window.AB.options[pluginName]) {
    window.AB.options[pluginName] = options;
  }
}

window.AB.plugins.interchange = interchange;
module.exports = window.AB;
