;(function(name, definition) {
  if (typeof module !== 'undefined') module.exports = definition();
  else if (typeof define === 'function' && typeof define.amd === 'object') define(definition);
  else this[name] = definition();
}('abInterchange', function() {

  'use strict';

  var pluginName = 'interchange',
      attr       = 'data-ab-interchange',
      attrSrc    = 'data-ab-interchange-src';

  var Plugin = function(el, options) {
    this.el = el;

    var dataOptions  = AB.isJson(this.el.getAttribute(attr)) ? JSON.parse(this.el.getAttribute(attr)) : {};
    this.settings    = AB.extend(Plugin.defaults, options, dataOptions);

    this.rules       = [];
    this.currentPath = '';
    this.mode        = this._defineMode();

    this.preInit();
  };

  Plugin.defaults = {
    mode      : 'background',
    lazy      : true,
    delay     : 100,
    offscreen : 1.5
  };

  Plugin.prototype = {
    preInit: function() {
      // no need for a plugin in case of 'picture' with good support
      if (this.el.parentNode.matches('picture') && window.HTMLPictureElement)
        return this;

      this.init();
    },

    init: function() {
      this._events()
          ._generateRules()
          ._updatePath();

      return this;
    },

    _defineMode: function() {
      // in case of <img /> there is no doubt
      if (this.el.nodeName === 'IMG')
        return 'img';

      return this.settings.mode;
    },

    _generateRules: function() {
      var rulesList = [],
          rules = this.el.getAttribute(attrSrc).match(/\[[^\]]+\]/g);

      for (var i = 0, len = rules.length; i < len; i++) {
        var rule  = rules[i].slice(1, -1).split(', '),
            path  = rule.slice(0, -1).join(''),
            query = rule[rule.length - 1];

        rulesList.push({
          path: path,
          query: query
        });
      }

      this.rules = rulesList;

      return this;
    },

    _updatePath: function() {
      var match        = false,
          path         = '',
          rules        = this.rules,
          //currentQuery = AB.mediaQuery.current,
          rule;

      // Iterate through each rule
      for (var i = 0, len = rules.length; i < len; i++) {
        rule = rules[i];

        if (AB.mediaQuery.is(rule.query)) {
          path  = rule.path;
          match = true;
        }
      }

      this.currentPath = path;
      this._replace();

      return this;
    },

    _onScroll: function() {
      if (this._inView()) this._replace();

      return this;
    },

    _events: function() {
      var that = this,
          scrollTimer;

      // updata path then replace
      window.addEventListener('changed.ab-mediaquery', that._updatePath.bind(that));

      if (that.settings.lazy) {
        window.addEventListener('scroll', function() {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function() {
            that._onScroll.call(that);
          }, that.settings.delay);
        });
      }

      return that;
    },

    _inView: function() {
      var scrollTop    = window.scrollY,
          windowHeight = window.innerHeight;

      return this.el.getBoundingClientRect().top + scrollTop  <= scrollTop + windowHeight * this.settings.offscreen;
    },

    _replace: function() {
      var that      = this,
          path      = that.currentPath,
          eventName = 'replaced.ab-interchange';

      that.mode = that._defineMode();

      if ( !that.settings.lazy || (that.settings.lazy && that._inView()) ) {
        // images
        if (that.mode === 'img') {
          that.el.src = path;

          var event = new CustomEvent(eventName);
          window.dispatchEvent(event);

          return that;
        }

        // background images
        if (that.mode === 'background') {
          if (path)
            path = 'url('+path+')';
          else
            path = 'none';

          that.el.style.backgroundImage = path;

          var event = new CustomEvent(eventName);
          window.dispatchEvent(event);

          return that;
        }

        // HTML
        var request = new XMLHttpRequest();
        if (!path) {
          that.el.innerHTML = '';
          return that;
        }

        request.open('GET', path, true);

        request.onload = function() {
          if (this.status >= 200 && this.status < 400) {
            var resp = this.response;

            that.el.innerHTML = resp;

            var event = new CustomEvent(eventName);
            window.dispatchEvent(event);
          } else {
            that.el.innerHTML = '';
          }
        };

        request.onerror = function() {
          that.el.innerHTML = '';
        };

        request.send();

        return that;
      }
    }
  };

  AB[pluginName] = function(options) {
    var elements = document.querySelectorAll('['+ attr +']');
    for (var i = 0, len = elements.length; i < len; i++) {
      if (elements[i][pluginName]) continue;
      elements[i][pluginName] = new Plugin(elements[i], options);
    }
  };

  return AB.interchange;
}));