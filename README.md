# AB-interchange

AB-interchange is a pure JavaScript file that makes possible to conditionnaly load:

- **img** (it can be also used as **picture** polyfill on unsupported browsers)
- **background-image**
- **HTML content** (Ajax)

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

The plugin is **CommonJS** and **AMD** compliant (UMD).

It's used on French website [ENGIE](https://particuliers.engie.fr/).

---

## Dependencies:

- [AB (another-brick)](https://www.npmjs.com/package/ab-mediaquery)
- [AB-mediaQueries v2](https://www.npmjs.com/package/ab-mediaquery)

You can either loads those scripts or import them (with browserify or webpack for ex.):
```
import AB from 'another-brick';
import abMediaQuery from 'ab-mediaquery';
import abInterchange from 'ab-interchange';
```

---

## Compatibility

Because of the usage of `matchMedia`, compatibility start from IE 10. To rise compatibility up to IE 9, you must add this [polyfill](https://github.com/paulirish/matchMedia.js/).

---

## SETUP

Follow [AB-mediaQuery](https://www.npmjs.com/package/ab-mediaquery) readme to configure it the way you like depending on your needs. For exemple:

```
abMediaQuery({
  bp: {
    smallOnly: 'screen and (max-width: 767px)',
    mediumOnly: 'screen and (min-width: 768px) and (max-width: 1024px)',
    medium: 'screen and (min-width: 768px)',
    largeOnly: 'screen and (min-width: 1025px) and (max-width: 1280px)',
    large: 'screen and (min-width: 1025px)'
  }
});
```

Then you only need to initialize with `AB.interchange()` or with options:

```
abInterchange({
  mode      : 'img"
  lazy      : true, // or false
  delay     : 100   // debounce time on scroll event (only when lazy loading is true)
  offscreen : 1.5    // load items only when in the view + 0.5 by default
});
```

You can also use **data-ab-interchange** attribute to pass those otpions individually.

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
  data-ab-interchange='{"mode": "background", "lazy": true, "delay": 100, "offscreen": 1.5}"
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
