'use strict';

var AB           = require('another-brick'),
    abMediaQuery = require('ab-mediaquery');

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
  this.animated      = false;
  this.lazyTimer;

  this.init();
};

Plugin.defaults = {
  mode:        'background',
  lazy:        false,
  offscreen:   1.5,
  delayed:     false,
  placeholder: false
};

Plugin.prototype = {
  init: function() {
    var that = this;

    // no need for a plugin in case of 'picture' except when lazy is true
    if (this.el.parentNode.matches('picture') && window.HTMLPictureElement && !this.settings.lazy)
      return this;

    if (this.settings.lazy && this.settings.delayed) {
      this.lazyTimer = setTimeout(function() {
        that.settings.lazy = false;
        that._replace();
      }, this.settings.delayed);
    }

    if (this.settings.placeholder) {
      this._setPlaceholder();
    }

    this._events()
        ._generateRules()
        ._updatePath();
  },

  _setPlaceholder: function() {
    var placeholderNode = document.createElement('div'),
        width           = this.el.getAttribute('width'),
        height          = this.el.getAttribute('height');

    if (!width && !height)
      return this;

    placeholderNode.classList.add('ab-interchange-placeholder');

    placeholderNode.style.overflow   = 'hidden';
    placeholderNode.style.position   = 'relative';
    placeholderNode.style.paddingTop = (height / width * 100).toFixed(2) + "%";

    this.el.style.position  = 'absolute';
    this.el.style.top       = 0;
    this.el.style.right     = 0;
    this.el.style.bottom    = 0;
    this.el.style.left      = 0;
    this.el.style.maxHeight = '100%';
    this.el.style.minHeight = '100%';
    this.el.style.maxWidth  = '100%';
    this.el.style.minWidth  = '100%';
    this.el.style.width     = 0;
    this.el.style.height    = 0;

    if (this.el.parentNode.matches('picture')) {
      this.el.parentNode.parentNode.insertBefore(placeholderNode, this.el.parentNode);
      placeholderNode.appendChild(this.el.parentNode);
    } else {
      this.el.parentNode.insertBefore(placeholderNode, this.el);
      placeholderNode.appendChild(this.el);
    }
  },

  _defineMode: function() {
    // in case of <img /> there is no doubt
    if (this.el.nodeName === 'IMG')
      return 'img';

    return this.settings.mode;
  },

  _generateRules: function() {
    var rulesList = [],
        rules     = this.el.getAttribute(attrSrc).match(/\[[^\]]+\]/g);

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

    return this;
  },

  _onScroll: function() {
    if (this._inView()) {
      clearTimeout(this.lazyTimer);
      this._replace();
    }

    this.animated = false;
    return this;
  },

  _requestAnimationFrame: function() {
    if (!this.animated)
      window.requestAnimationFrame(this._onScroll.bind(this));

    this.animated = true;
  },

  _events: function() {
    var that = this;

    // update path, then replace
    window.addEventListener('changed.ab-mediaquery', that._updatePath.bind(that));

    if (that.settings.lazy)
      window.addEventListener('scroll', that._requestAnimationFrame.bind(that));

    // on img change
    that.el.addEventListener('load', that._triggerEvent.bind(that));

    return that;
  },

  _inView: function() {
    var windowHeight = window.innerHeight,
        rect         = this.el.getBoundingClientRect();

    return (
      rect.top >= - windowHeight * this.settings.offscreen &&
      rect.bottom <= windowHeight + windowHeight * this.settings.offscreen
    );
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
    if (this.settings.lazy && !this._inView())
      return this;

    if (this.settings.mode === 'img') {
      this._replaceImg();
    } else if (this.settings.mode === 'background') {
      this._replaceBackground();
    } else if (this.settings.mode === 'ajax') {
      this._replaceAjax();
    }
  },

  _replaceImg: function() {
    if (this.el.src === this.currentPath)
      return this;

    this.el.src = this.currentPath; // event triggered when img is loaded
    this._triggerEvent();
  },

  _replaceBackground: function() {
    if (this.el.style.backgroundImage === 'url("'+ this.currentPath +'")')
      return this;

    if (this.currentPath)
      this.el.style.backgroundImage = 'url('+ this.currentPath +')';
    else
      this.el.style.backgroundImage = 'none';

    this._triggerEvent();
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
