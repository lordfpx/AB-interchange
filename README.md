# AB-interchange

**AB-interchange** is a small, dependency free and vanilla script to:

- **lazy load** images and background-images
- give responsiveness to **background-images**

It's damn small: about **2.6KB** (uglyfied and GZipped).

**Have a look at this [Demonstration page](https://lordfpx.github.io/AB-interchange/) (offline version in the `docs` folder).**

Version 1 is used on French websites of [ENGIE](https://particuliers.engie.fr) and [Gaz tarif règlementé](https://gaz-tarif-reglemente.fr/).

[![Maintainability](https://api.codeclimate.com/v1/badges/85a4444c8e573ae62a49/maintainability)](https://codeclimate.com/github/lordfpx/AB-interchange/maintainability)


## Important news

- removed `<img>` and `<picture>` support since it's natif and useless on IE 11.
- removed `delayed` option that was quite useless and introduced code complexity


## Install

```bash
npm install --save ab-interchange
```


## Setup

Import it in your JS bundle (webpack, ES6, browserify…):
```js
import abInterchange from 'ab-interchange';
```

(If you are not building your assets, simply load the script `AB-interchange.min.js` in the `dist` folder.)


## Usage

Follow [AB-mediaQuery](https://www.npmjs.com/package/ab-mediaquery) readme file to configure it the way you like depending on your needs. For exemple:

```js
AB.plugins.mediaQuery({
  bp: {
    smallOnly:  'screen and (max-width: 767px)',
    mediumOnly: 'screen and (min-width: 768px) and (max-width: 1024px)',
    medium:     'screen and (min-width: 768px)',
    largeOnly:  'screen and (min-width: 1025px) and (max-width: 1280px)',
    large:      'screen and (min-width: 1025px)'
  }
});
```

Then initialize `interchange` with some options.

```js
AB.plugins.interchange({
  mode: 'lazy-img',
  lazySettings: {
    offscreen: 1.25,
    layout:    'fluid' // can be "fixed" to fixed dimensions (not fluid)
  }
});
```

* **`mode` can be:**
  - `lazy-img`
  - `background`
  - `lazy-background`

* **`lazySettings` are for lazy modes:**
  - `offscreen`: load picture only when in the viewport * `offscreen` value
  - `layout`: Can be `fluid` (default) for fluid images or `fixed` for fixed dimensions

Use `data-ab-interchange` attribute to pass specific options on an element if needed.

`data-ab-interchange-src` attribute is where you define different sources and breakpoints defined with AB-mediaQuery.
It should contain a list of arrays with the path to the asset and the breakpoint name. Beware to respect mobile first order. Order is **VERY** important!

---

## Examples

### Lazy loading of img

```html
<div
  alt=""
  width="100"
  height="75"
  data-ab-interchange='{
    "mode": "lazy-img",
    "lazySettings": {
      "offscreen": 1,
    }
  }"'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>

```
If your images have different ratio depending on media query you can provide a JSON on `width` and `height` attributes:
```html
width='{"smallOnly": 20, "medium": 50}'
height='{"smallOnly": 20, "medium": 50}'
```


### background-image

```html
<div
  data-ab-interchange='{"mode": "background"}'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```

### Lazy load background-image

```html
<div
  data-ab-interchange='{"mode": "lazy-background"}'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```


## JS event

**`replaced.ab-interchange`** event is automatically triggered when when an image/background-image update.

```js
window.addEventListener('replaced.ab-interchange', function(e){
  console.log(e.detail.element);
});
```
