# AB-interchange

AB-interchange is a small, dependencie free and vanilla JavaScript component that conditionnaly load things depending on media queries and it also has a powerfull **lazy-loading** option:

- **img**
- **picture**
- **background-image**
- **HTML content** (Ajax)

It's damn small: about **2500 bytes** (uglyfied and GZipped). It is used in the French website of [ENGIE](https://particuliers.engie.fr).

Have a look at the [Codepen demonstration](https://codepen.io/lordfpx/pen/jApqLW).

[![Maintainability](https://api.codeclimate.com/v1/badges/85a4444c8e573ae62a49/maintainability)](https://codeclimate.com/github/lordfpx/AB-interchange/maintainability)


## Install

Install with npm:
```bash
npm install --save ab-interchange
````

Install with yarn:
```bash
yarn add ab-interchange
```


## Setup

You can then import it in your JS bundle (webpack, ES6, browserify...):
```js
import abInterchange from 'ab-interchange';
```

Or loading the js right before `</body>` if you are not using a builder.

Because of the usage of `matchMedia` and `requestAnimationFrame`, compatibility start with IE 10. To rise compatibility up to IE 9, you can add [matchMedia polyfill](https://github.com/paulirish/matchMedia.js/) and [requestAnimationFrame polyfill](https://gist.github.com/paulirish/1579671).


## Usage

Follow [AB-mediaQuery](https://www.npmjs.com/package/ab-mediaquery) readme to configure it the way you like depending on your needs. For exemple:

```js
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

```js
abInterchange({
  mode:        'background',
  lazy:        false,
  lazySettings: {
    placeholder: false, // trick to prevent reflow of the page
    offscreen:   1.5,   // load items only when in the view + 0.5
    delayed:     false,
    layout:      'fluid' // can be "fixed" to fixed dimensions (not fluid)
  }
});
```

Then use `data-ab-interchange` attribute to pass options on each elemets if needed.

`data-ab-interchange-src` attribute is where you define different sources and breakpoints defined with AB-mediaQuery.
It should contain a list of arrays with the path to the asset and the breakpoint name. Beware to respect mobile first order. Order is **VERY** important!



## Examples

### **img**

Recommanded usage to prevent reflow with lazy loading enabled:
```html
<div
  alt=""
  width="100"
  height="75"
  data-ab-interchange='{"lazy": true, "lazySettings": {
    "placeholder": true,
    "offscreen":   1,
    "delayed":     2000
  }}"'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```
If your images have different ratio depending on media query:
```html
<div
  alt=""
  width='{"smallOnly": 20, "medium": 50}'
  height='{"smallOnly": 20, "medium": 50}'
  data-ab-interchange='{"lazy": true, "lazySettings": {
    "placeholder": true,
    "offscreen":   1,
    "delayed":     2000
  }}"'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```

Or on normal img tags:
```html
<img
  alt=""
  width="100"
  height="75"
  data-ab-interchange='{"lazy": true}"'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]"/>
```

### **picture**

```html
<picture>
  <source srcset="xxx" media="(min-width: 80em)"/>
  <source srcset="xxx" media="(min-width: 64em)"/>
  <source srcset="xxx" media="(min-width: 48em)"/>
  <source srcset="xxx"/>
  <img
    alt=""
    width="100"
    height="75"
    data-ab-interchange
    data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]"/>
</picture>
```


### **background-image**

```html
<div
  data-ab-interchange='{"mode": "background", "lazy": true, "lazySettings": {"offscreen": 1.5}"}'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```


### **XMLHttpRequest content (Ajax)**

```html
<div
  data-ab-interchange='{"mode": "ajax"}'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, mediumOnly]">
</div>
```


## JS event
`replaced.ab-interchange` event is automatically triggered when an IMG (or else) changed. **For IMG and HTML, it's fired only when the new content is loaded**, for background-image, immediatly, because it does not impact the layout:

```js
window.addEventListener('replaced.ab-interchange', function(e){
  console.log(e.detail.element);
});
```
