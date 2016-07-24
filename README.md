# AB-interchange

While responsive image loading is not really an easy task even today, here is a solution to manage conditional (based on breakpoints) loading of img, background-image or even HTML content.

Heavily inspired by https://github.com/zurb/foundation-sites.

Demo: [Codepen](http://codepen.io/lordfpx/pen/yJbwrK)

NPM: https://www.npmjs.com/package/ab-interchange

> npm install ab-interchange

The plugin is CommonJS and AMD compliant, in vanilla JS, with no dependencies.


## Compatibility

Because of the usage of `matchMedia`, compatibility start with IE 10. To rise compatibility up to IE 9, you can add https://github.com/paulirish/matchMedia.js/ polyfill.


## SETUP

You will need jQuery (https://jquery.com/), but I have plan to remove that dependency in the future.

The other dependency is AB-mediaQuery (https://github.com/lordfpx/AB-mediaQuery).

Install AB-mediaQuery following your needs (or only `abMediaQuery()` for default configuration).

The you only need to initialize with `abInterchange()`.

data-ab-interchange attribute should contain a list of arrays with your needed breakpoints as defined in AB-mediaQuery. Defaults values are :
* small
* medium
* large
* huge


## img

  ```
  <img src="" data-ab-interchange="[img/cat-1x.jpg, small], [img/cat-2x.jpg, medium], [img/cat-3x.jpg, large]">
  ```


## background-image

  ```
  <div data-ab-interchange="[img/cat-1x.jpg, small], [img/cat-2x.jpg, medium], [img/cat-3x.jpg, large]"></div>
  ```

## and even other XMLHttpRequest content!

If the data-ab-interchange is neither an image format nor on an img tag, that will send and http request and put the response inside the element.

```
<div data-ab-interchange="[small-content.html, small], [medium-content.html, medium], [large-content.html.jpg, large]"></div>
```