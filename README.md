# AB-interchange

Responsive image loading is not really an easy task even today, here is a solution to manage conditional (based on breakpoints) loading of:
- img
- background-image
- HTML content

That plugin also has an lazy-loading option!.

It's inspired by [Zurb Foundation](https://github.com/zurb/foundation-sites).

Here is a demo page: [Codepen](http://codepen.io/lordfpx/pen/yJbwrK)

NPM package: https://www.npmjs.com/package/ab-interchange

> npm install ab-interchange

The plugin is **CommonJS** and **AMD** compliant.

## Dependencies:

- [jQuery](https://jquery.com/)
- [AB-mediaQueries](https://www.npmjs.com/package/ab-mediaquery)


## Compatibility

Because of the usage of `matchMedia`, compatibility start from IE 10. To rise compatibility up to IE 9, you must add https://github.com/paulirish/matchMedia.js/ polyfill.


## SETUP

You will need [jQuery](https://jquery.com/).

The other dependency is [AB-mediaQuery](https://www.npmjs.com/package/ab-mediaquery).

Follow AB-mediaQuery readme to configure it the way you like depending on your needs (or init it with `abMediaQuery()` for default configuration).

Then you only need to initialize with `abInterchange()` or with options:
```
abInterchange({
  lazy      : false, // or true
  delay     : 100    // debounce time on scroll event (only when lazy loading is true)
  offscreen : 1.5    // load items only when in the view + 0.5 by default
});
```

**data-ab-interchange** attribute should contain a list of arrays with the path to the asset and the breakpoint name as defined in AB-mediaQuery. Beware to respect mobile first order!

Defaults breakpoints defined by AB-mediaQueries are:
- small
- smallOnly
- medium
- mediumOnly
- large
- largeOnly
- huge
- hugeOnly

Plus set a default asset in case there is no media query matching: `[path/to/asset, default]`.
If you don't want any default asset, you can must set the corresponding value to empty the content (**NOT for IMG**):
- background-image: `[empty.bg, default]`
- HTML content: `[empty.ajax, default]`

It's clever to prepare a spinner animation as first img src (or default CSS styling when `src=""`) before init, especially when using **lazy-loading** option.


## Examples

### **img**

```
<img
  src="spinner.gif"
  data-ab-interchange="[path/to/default/img, default], [path/to/small/img, small], [path/to/medium/img, medium]"
>
```


### **background-image**

To determine if it's a background-image changing, the script look for image file extensions (`gif|jpg|jpeg|tiff|png`).

```
<div data-ab-interchange="[empty.bg, default], [path/to/medium/img, medium]"></div>
```
It this example, the will not be any background-image on small devices.


### **and even XMLHttpRequest content (ajax)!**

If the data-ab-interchange is neither an image format nor on an img tag, that will send and http request and put the response inside the element.

```
<div data-ab-interchange="[path/to/default/http/request, default], [path/to/small/http/request, small], [path/to/medium/http/request, medium]"></div>
```
