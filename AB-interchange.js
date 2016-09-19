!(function(name, definition) {
  if (typeof module !== 'undefined') {
    module.exports = definition();
  } else if (typeof define === 'function' && typeof define.amd === 'object') {
    define(definition);
  } else {
    this[name] = definition();
  }
}('abInterchange', function() {

  'use strict';

  function extend(){
    for (var i=1; i<arguments.length; i++) {
      for (var key in arguments[i]) {
        if (arguments[i].hasOwnProperty(key)) arguments[0][key] = arguments[i][key];
      }
    }
    return arguments[0];
  }

  var Interchange = function(element, opt) {
    if (!(this instanceof Interchange)) return new Interchange(element, opt);

    this.settings     = extend({}, Interchange.defaults, opt);
    this.element      = element;
    this.$element     = $(element);
    this.rules        = [];
    this.currentPath  = '';
    this.defaultPath  = '';

    this.init()
        ._events();
  };

  Interchange.defaults = {
    lazy      : true,
    delay     : 100,
    offscreen : 1.5
  };

  Interchange.prototype = {
    init: function() {
      this._generateRules()
          ._setDefault()
          ._updatePath();

      return this;
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
        var rule    = rules[i].slice(1, -1).split(', '),
            path    = rule.slice(0, -1).join(''),
            query   = rule[rule.length - 1];

        rulesList.push({
          path: path,
          query: query
        });
      }

      this.rules = rulesList;

      return this;
    },

    _setDefault: function() {
      var path              = '',
          rules             = this.rules;

      // Iterate through each rule
      for (var i = 0, len = rules.length; i < len; i++) {
        var rule  = rules[i];

        // check if default value is provided
        if (rule.query === 'default' && this.defaultPath === '') {
          this.defaultPath = rule.path;
        }
      }

      return this;
    },

    _updatePath: function() {
      var match         = false,
          path          = '',
          rules         = this.rules,
          currentQuery  = AB.mediaQuery.current;

      // Iterate through each rule
      for (var i = 0, len = rules.length; i < len; i++) {
        var rule  = rules[i];

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
      if (this._inView()) {
        this._replace();
      }
      return this;
    },

    _events: function() {
      var that = this,
          scrollTimer;

      window.addEventListener('changed.ab-mediaquery', function(){
        // updata path then replace
        that._updatePath();
      });

      if (this.settings.lazy) {
        window.addEventListener('scroll', function() {
          clearTimeout(scrollTimer);
          scrollTimer = setTimeout(function() {
            that._onScroll.call(that);
          }, that.settings.delay);
        });
      }
    },

    _inView: function() {
      var scrollTop     = $(window).scrollTop(),
          windowHeight  = window.innerHeight;
      return this.element.getBoundingClientRect().top + scrollTop  <= scrollTop + windowHeight * this.settings.offscreen;
    },

    _replace: function() {
      var that    = this,
          path    = that.currentPath,
          trigger = 'replaced.ab-interchange';

      if ( !that.settings.lazy || (that.settings.lazy && that._inView()) ) {

        // Replacing images
        if (that.$element[0].nodeName === 'IMG') {
          that.$element.attr('src', path).load().trigger(trigger);
        }

        // Replacing background images
        else if (path.match(/\.(gif|jpg|jpeg|tiff|png)([?#].*)?/i) || path === 'empty.bg') {
          if (path === 'empty.bg') {
            that.$element.css({ 'background-image': 'none' }).trigger(trigger);
          } else {
            that.$element.css({ 'background-image': 'url('+path+')' }).trigger(trigger);
          }
        }

        // Replacing HTML
        else {
          if (path === 'empty.ajax') {
            that.$element.empty();
          } else {
            $.get(path, function(response) {
              that.$element.html(response).trigger(trigger);
            });
          }
        }

      }
    }
  };

  function abInterchange(opt){
    var elements = document.querySelectorAll('[data-ab-interchange]');

    for (var i = 0, len = elements.length; i < len; i++) {
      if (!elements[i].getAttribute('data-plugin_interchange')) {
        elements[i].setAttribute('data-plugin_interchange', new Interchange(elements[i], opt));
      }
    }
  }

  return abInterchange;
}));
