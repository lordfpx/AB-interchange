parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"tg39":[function(require,module,exports) {
!function(){if("function"==typeof window.CustomEvent)return!1;function o(o,n){n=n||{bubbles:!1,cancelable:!1,detail:void 0};var t=document.createEvent("CustomEvent");return t.initCustomEvent(o,n.bubbles,n.cancelable,n.detail),t}o.prototype=window.Event.prototype,window.CustomEvent=o}(),function(){var o=function(o,n){var t=!1;window.addEventListener(o,function(){t||(t=!0,window.requestAnimationFrame(function(){window.dispatchEvent(new CustomEvent(n)),t=!1}))})};o("resize","ab-resize"),o("scroll","ab-scroll"),o("mousemove","ab-mousemove"),o("touchmove","ab-touchmove")}(),window.AB={extend:function(){var o={},n=!1,t=0,e=arguments.length;"[object Boolean]"===Object.prototype.toString.call(arguments[0])&&(n=arguments[0],t++);for(var i=function(t){for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&(n&&"[object Object]"===Object.prototype.toString.call(t[e])?o[e]=window.AB.extend(!0,o[e],t[e]):o[e]=t[e])};t<e;t++)i(arguments[t]);return o},isJson:function(o){try{JSON.parse(o)}catch(n){return!1}return!0},runUpdaters:function(o){if(window.AB.options[o])window.AB.plugins[o](window.AB.options[o]);else for(var n in AB.options)window.AB.options.hasOwnProperty(n)&&window.AB.plugins[n](window.AB.options[n])},plugins:{},options:{}},module.exports=window.AB;
},{}],"nJpS":[function(require,module,exports) {
"use strict";window.AB=require("another-brick");var n=function(n){var e,i,r;window.AB.mediaQuery=(e=n||{bp:{}},r=(i=function(){var n=[];for(var i in e.bp)e.bp.hasOwnProperty(i)&&window.matchMedia(e.bp[i]).matches&&n.push(i);return n})(),window.addEventListener("ab-resize",function(){var n=i();n.join("|")!==r.join("|")&&(r=n,window.dispatchEvent(new CustomEvent("changed.ab-mediaquery")))}),{get current(){return r},is:function(n){if(e.bp[n])return window.matchMedia(e.bp[n]).matches}})};window.AB.plugins.mediaQuery=n,module.exports=window.AB;
},{"another-brick":"tg39"}],"S3PC":[function(require,module,exports) {
"use strict";window.AB=require("ab-mediaquery");var t="abInterchange",e="data-ab-interchange",i="data-ab-interchange-src",s={mode:"img",lazySettings:{offscreen:1.25,delayed:!1,layout:"fluid"}};function n(){if(!this._replaced)switch(this.mode){case"img":l.call(this);break;case"lazy-img":l.call(this,!0);break;case"background":a.call(this);break;case"lazy-background":a.call(this,!0)}}function l(t){this._imgNode.src===this.currentPath||t&&!this.inView()||(this._imgNode.src=this.currentPath,this._imgNode.addEventListener("load",o.bind(this)),this._replaced=!0)}function a(t){this.el.style.backgroundImage==='url("'+this.currentPath+'")'||t&&!this.inView()||(this.currentPath?this.el.style.backgroundImage="url("+this.currentPath+")":this.el.style.backgroundImage="none",this.el.addEventListener("load",o.bind(this)))}function h(){var t=this;("PICTURE"===this.el.parentNode.tagName||this.el.getAttribute("srcset"))&&window.HTMLPictureElement||(this.settings.lazySettings.delayed&&(this._lazyTimer=setTimeout(function(){n.call(t)},this.settings.lazySettings.delayed)),r.call(this),d.call(this),c.call(this),g.call(this))}function r(){var t=document.createElement("div"),e=document.createElement("img"),i=this.el.getAttribute("alt"),s=w.call(this),n=s.width,l=s.height,a=!n||!l,h=document.createDocumentFragment();"lazy-img"!==this.mode||a||(this.el.innerHTML="",this.el.style.overflow="hidden",this.el.style.position="relative",this.el.classList.add("ab-interchange-loading"),"fixed"===this.settings.lazySettings.layout&&(this.el.style.height=l+"px",this.el.style.width=n+"px"),t.classList.add("ab-interchange-placeholder"),t.style.paddingTop=(l/n*100).toFixed(2)+"%",e.style.position="absolute",e.style.top=0,e.style.right=0,e.style.bottom=0,e.style.left=0,e.style.maxHeight="100%",e.style.minHeight="100%",e.style.maxWidth="100%",e.style.minWidth="100%",e.style.height=0,e.alt=null===i?"":i,h.appendChild(t),h.appendChild(e),this.el.appendChild(h),this._imgNode=this.el.querySelector("img"))}function o(){this.el.classList.remove("ab-interchange-loading");var t=new CustomEvent("replaced.ab-interchange",{detail:{element:this.el}});window.dispatchEvent(t)}function d(){var t="";window.addEventListener("changed.ab-mediaquery",this.resetDisplay.bind(this)),"lazy-img"!==this.mode&&"lazy-background"!==this.mode||("IntersectionObserver"in window?(t=parseInt((this.settings.lazySettings.offscreen-1)*window.innerHeight)+"px",new IntersectionObserver(u.bind(this),{root:null,rootMargin:"0px 0px "+t+" 0px",threshold:0}).observe(this.el)):window.addEventListener("ab-scroll",u.bind(this)))}function c(){for(var t,s,n,l=[],a=(this.el.getAttribute(i)?this.el.getAttribute(i):this.el.getAttribute(e)).match(/\[[^\]]+\]/g),h=0,r=a.length;h<r;h++)s=(t=a[h].slice(1,-1).split(", ")).slice(0,-1).join(""),n=t[t.length-1],l.push({path:s,query:n});this.rules=l}function g(){for(var t="",e=this.rules,i=0,s=e.length;i<s;i++)window.AB.mediaQuery.is(e[i].query)&&(t=e[i].path);this.currentPath!==t&&(this.currentPath=t,n.call(this))}function u(){this.inView()&&!this._replaced&&(clearTimeout(this._lazyTimer),n.call(this))}function m(){return"IMG"===this.el.tagName?"img":this.settings.mode}function w(){var t=this.el.getAttribute("width"),e=this.el.getAttribute("height"),i={},s={};if(window.AB.isJson(t)&&window.AB.isJson(e))for(var n in i=JSON.parse(t),s=JSON.parse(e),i)i.hasOwnProperty(n)&&window.AB.mediaQuery.is(n)&&(t=i[n],e=s[n]);return{width:t,height:e}}var y=function(t,i){this.el=t;var n=window.AB.isJson(this.el.getAttribute(e))?JSON.parse(this.el.getAttribute(e)):{};this.settings=window.AB.extend(!0,s,i,n),this.rules=[],this.currentPath="",this.mode=m.call(this),this.replaced=!1,this._lazyTimer,this._imgNode=this.el,h.call(this)};function p(i){for(var s=document.querySelectorAll("["+e+"]"),n=0,l=s.length;n<l;n++)s[n][t]||(s[n][t]=new y(s[n],i));window.AB.options[t]||(window.AB.options[t]=i)}y.prototype={resetDisplay:function(){this._replaced=!1,r.call(this),g.call(this)},inView:function(){var t=window.innerHeight,e=this.el.getBoundingClientRect(),i=-this.el.offsetHeight-t*(this.settings.lazySettings.offscreen-1),s=t+t*(this.settings.lazySettings.offscreen-1);return e.top>=i&&e.top<=s}},window.AB.plugins.interchange=p,module.exports=window.AB;
},{"ab-mediaquery":"nJpS"}]},{},["S3PC"], null)