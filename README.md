# AB-interchange

**AB-interchange** is a small, dependency free and vanilla script to:

- responsive **lazy load** images and background-images

It's damn small: about **2.3KB** (uglyfied and GZipped).

Have a look at the [Codepen demonstration](https://codepen.io/lordfpx/pen/jApqLW).

Version 1 is used on French websites of [ENGIE](https://particuliers.engie.fr) and [Gaz tarif règlementé](https://gaz-tarif-reglemente.fr/).

[![Maintainability](https://api.codeclimate.com/v1/badges/85a4444c8e573ae62a49/maintainability)](https://codeclimate.com/github/lordfpx/AB-interchange/maintainability)


## Install

```bash
npm install --save ab-interchange
```


## Setup

Import **abInterchange** in your JS bundle (webpack, ES6, browserify…):
```js
import abInterchange from 'ab-interchange';
```

(If you are not building your assets, simply load the script `AB-interchange.min.js` in the `dist` folder.)


## Usage

Follow [AB-mediaQuery](https://www.npmjs.com/package/ab-mediaquery) readme file to configure breakpoints the way you like, for exemple:

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

Then initialize `interchange` with some default options. You can override these options on each images/background (see below).

```js
AB.plugins.interchange({
  mode: 'img',
  lazySettings: {
    offscreen: 1,
    delayed:   null,
    layout:    'fluid' // can be "fixed" to fixed dimensions (not fluid)
  }
});
```

* **`mode` can be:**
  - `img`
  - `background`

* **`lazySettings` are for lazy modes:**
  - `offscreen`: load picture only when in the viewport * `offscreen` value
  - `delayed`: when defined, will load the image even when not visible after xxx millisecond (good when going offline later).
  - `layout`: Can be `fluid` (default) for fluid images or `fixed` for fixed dimensions

Use `data-ab-interchange` attribute to pass specific options on an element if needed.

`data-ab-interchange-src` attribute is where you define different sources and breakpoints defined with AB-mediaQuery.
It should contain a list of arrays with the path to the asset and the breakpoint name. Beware to respect mobile first order. Order is **VERY** important!

---

## Examples

### For img

```html
<div
  alt=""
  width="100"
  height="75"
  data-ab-interchange='{"mode": "img"}'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>

```
If your images have different ratio depending on media query you can provide a JSON on `width` and `height` attributes:
```html
<div
  alt=""
  width='{"smallOnly": 20, "medium": 50}'
  height='{"smallOnly": 20, "medium": 50}'
  data-ab-interchange='{"mode": "img"}'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```

### For background-image

```html
<div
  data-ab-interchange='{"mode": "background"}'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```


### How to override default settings?

```html
<div
  data-ab-interchange='{
    "mode": "img",
    "lazySettings": {
      "offscreen": 1.3,
      "delayed":   10000,
      "layout":    "fixed"
    }
  }'
  data-ab-interchange-src="[xxx, smallOnly], [xxx, medium]">
</div>
```


## JS event

**`replaced.ab-interchange`** event is automatically triggered when an image/background-image is updated.

```js
window.addEventListener('replaced.ab-interchange', function(ev) {
  console.log(ev.detail.element);
});
```
