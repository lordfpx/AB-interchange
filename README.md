# AB-interchange

Responsive image loading is not really an easy task even today, here is a solution to manage conditional (based on breakpoints) loading of img, background-image or even HTML content. That also provide for lazy-loading (optional).

Inspired by https://github.com/zurb/foundation-sites.

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

Then you only need to initialize with `abInterchange()` or with options:
```
abInterchange({
  lazy      : false,// or true
  delay     : 100   // debounce time on scroll event (only when lazy loading is true)
  offscreen : 1.5   // load items only when in the view + 0.5
});
```

**data-ab-interchange** attribute should contain a list of arrays with your needed breakpoints as defined in AB-mediaQuery AND a default image that will be loaded when matching is false. Defaults values are :
* small
* medium
* large
* huge

It's clever to prepare a spinner animation as first img src or default styling before init. You can use **'replaced.ab-interchange'** event to remove that right after.


## img

  ```
  <img src="spinner.gif" data-ab-interchange="[img/cat-1x.jpg, default], [img/cat-1x.jpg, small], [img/cat-2x.jpg, medium], [img/cat-3x.jpg, large]">
  ```


## background-image

  ```
  <div data-ab-interchange="[img/cat-1x.jpg, default], [img/cat-1x.jpg, small], [img/cat-2x.jpg, medium], [img/cat-3x.jpg, large]"></div>
  ```

## and even other XMLHttpRequest content!

If the data-ab-interchange is neither an image format nor on an img tag, that will send and http request and put the response inside the element.

```
<div data-ab-interchange="[small-content.html, default], [small-content.html, small], [medium-content.html, medium], [large-content.html, large]"></div>
```
