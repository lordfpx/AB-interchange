;(function(name, definition) {
  if (typeof module !== 'undefined') {
    module.exports = definition();
  } else if (typeof define === 'function' && typeof define.amd === 'object') {
    define(definition);
  } else {
    this[name] = definition();
  }
}('abInterchange', function() {

  'use strict';

  var Interchange = function(element, opt) {
    if (!(this instanceof Interchange)) return new Interchange(element, opt);

    this.settings     = AB.extend(Interchange.defaults, opt);
    this.element      = element;
    this.$element     = $(element);
    this.rules        = [];
    this.currentPath  = '';
    this.defaultPath  = '';
    this.mode         = 'img';

    this.preInit();
  };

  Interchange.defaults = {
    lazy            : true,
    delay           : 100,
    offscreen       : 1.5
  };

  Interchange.prototype = {
    preInit: function() {
      // no need for a plugin in case of 'picture' with good support
      if (this.$element.closest('picture').length && window.HTMLPictureElement)
        return this;

      this.init();
    },

    init: function() {
      this._events()
          ._generateRules()
          ._setDefault()
          ._updatePath();

      return this;
    },

    _defineMode: function() {
      // images
      if (this.element.nodeName === 'IMG')
        return 'img';

      // background images
      if (this.currentPath.match(/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i) || this.currentPath === 'empty.bg')
        return 'bg';

      // HTML
      return 'ajax';
    },

    _generateRules: function() {
      var rulesList = [],
          rules;

      if (this.settings.rules) {
        rules = this.settings.rules;
      } else {
        rules = this.$element.data('ab-interchange').match(/\[[^\]]+\]/g);
      }

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

    _setDefault: function() {
      var path  = '',
          rules = this.rules,
          rule;

      // Iterate through each rule
      for (var i = 0, len = rules.length; i < len; i++) {
        rule = rules[i];

        // check if default value is provided
        if (rule.query === 'default' && this.defaultPath === '') {
          this.defaultPath = rule.path;
        }
      }

      return this;
    },

    _updatePath: function() {
      var match        = false,
          path         = '',
          rules        = this.rules,
          currentQuery = AB.mediaQuery.current,
          rule;

      // Iterate through each rule
      for (var i = 0, len = rules.length; i < len; i++) {
        rule = rules[i];

        if (window.matchMedia(AB.mediaQuery.get(rule.query)).matches) {
          path  = rule.path;
          match = true;
        }
      }

      this.currentPath = (path === '') ? this.defaultPath : path;

      this._replace();
      return this;
    },

    _onScroll: function() {
      if (this._inView())
        this._replace();

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
      var scrollTop    = $(window).scrollTop(),
          windowHeight = window.innerHeight;
      return this.element.getBoundingClientRect().top + scrollTop  <= scrollTop + windowHeight * this.settings.offscreen;
    },

    _replace: function() {
      var that    = this,
          path    = that.currentPath,
          trigger = 'replaced.ab-interchange';

      that.mode = that._defineMode();

      if ( !that.settings.lazy || (that.settings.lazy && that._inView()) ) {
        // images
        if (that.mode === 'img') {
          that.$element.attr('src', path).load().trigger(trigger);
          return that;
        }

        // background images
        if (that.mode === 'bg') {
          if (path === 'empty.bg') {
            that.$element.css({ 'background-image': 'none' }).trigger(trigger);
          } else {
            that.$element.css({ 'background-image': 'url('+path+')' }).trigger(trigger);
          }
          return that;
        }

        // HTML
        if (path === 'empty.ajax') {
          that.$element.empty();
        } else {
          $.get(path, function(response) {
            that.$element.html(response).trigger(trigger);
          });
        }

        return that;
      }
    }
  };

  function abInterchange(options){
    var elements = document.querySelectorAll('[data-ab-interchange]');

    for (var i = 0, len = elements.length; i < len; i++) {
      if (elements[i].abInterchange) continue;
      elements[i].abInterchange = new Interchange(elements[i], options);
    }
  }

  return abInterchange;
}));