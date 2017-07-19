# AB-interchange

AB-interchange is a vanilla JavaScript that makes possible conditionnaly loading depending on media queries:

- **img** (it can be also used as a **picture** polyfill on unsupported browsers)
- **background-image**
- **HTML content** (Ajax)

It's damn small: about **1800 bytes** (uglyfied and GZipped).

That plugin also has an **lazy-loading** option!

- [codepen](https://codepen.io/lordfpx/pen/jApqLW)
- [NPM](https://www.npmjs.com/package/ab-interchange)

```
> npm install ab-interchange
```
or
```
> yarn add ab-interchange
```

It's used on French website [ENGIE](https://particuliers.engie.fr/).

---

## Setup

### Classic usage
Just load the script on your page, just before `</body>`.

### As a module
The best solution is to use browserify or Webpack and import 'abInterchange'.

```
import abInterchange from 'ab-interchange';
```

---

## Compatibility

Because of the usage of `matchMedia` and `requestAnimationFrame`, compatibility start with IE 10. To rise compatibility up to IE 9, you can add [matchMedia polyfill](https://github.com/paulirish/matchMedia.js/) and [requestAnimationFrame polyfill](https://gist.github.com/paulirish/1579671).

---

## Usage

Follow [AB-mediaQuery](https://www.npmjs.com/package/ab-mediaquery) readme to configure it the way you like depending on your needs. For exemple:

```
abMediaQuery({
  bp: {
    smallOnly:  'screen and (max-width: 767px)',
    mediumOnly: 'screen and (min-width: 768px) and (max-width: 1024px)',
    medium:     'screen and (min-width: 768px)',
    largeOnly:  'screen and (min-width: 1025px) and (max-width: 1280px)',
    large:      'screen and (min-width: 1025px)'
  }
});
```

Then you only need to initialize with `AB.interchange()` or with some options:

```
abInterchange({
  lazy      : true, // or false
  offscreen : 1.5,  // load items only when in the view + 0.5 by default
});
```

Then use **data-ab-interchange** attribute to pass otpions individually.

**data-ab-interchange-src** attribute is where you define different sources and breakpoints defined with AB-mediaQuery.
It should contain a list of arrays with the path to the asset and the breakpoint name. Beware to respect mobile first order. Order is **VERY** important!

---

## Examples

### **picture**

```
<picture>
  <source srcset="xxx" media="(min-width: 80em)"/>
  <source srcset="xxx" media="(min-width: 64em)"/>
  <source srcset="xxx" media="(min-width: 48em)"/>
  <source srcset="xxx"/>
  <img
    alt=""
    data-ab-interchange='{"lazy": false}"
    data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]"/>
</picture>
```

### **img**

```
<img
  alt=""
  data-ab-interchange='{"lazy": false}"
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]"/>
```


### **background-image**

```
<div
  data-ab-interchange='{"mode": "background", "lazy": true, "offscreen": 1.5}"
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```


### **and even XMLHttpRequest content (ajax)!**

```
<div
  data-ab-interchange="{"mode": "ajax", "lazy": false}"
  data-ab-interchange-src="[xxx, smallOnly], [xxx, mediumOnly]">
</div>
```


### JS event
'replaced.ab-interchange' event is automatically triggered when an IMG (or else) changed. **For IMG and HTML, it's fired only when the new content is loaded**, for background-image, immediatly, because it does not impact the layout:

```
window.addEventListener('replaced.ab-interchange', function(e){
  console.log(e.detail.element);
});
```