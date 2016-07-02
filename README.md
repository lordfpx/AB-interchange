# AB-mediaQuery

hile responsive image loading is not really an easy task even today, here is a solution to manage conditional (based on breakpoints) loading of img, background-image or even HTML content.
Heavily inspired by https://github.com/zurb/foundation-sites.

    // loading of img source:
    <img src="" data-ab-interchange="[img/cat-1x.jpg, small], [img/cat-2x.jpg, medium], [img/cat-3x.jpg, large]">

    // background-image:
    <div data-ab-interchange="[img/cat-1x.jpg, small], [img/cat-2x.jpg, medium], [img/cat-3x.jpg, large]"></div>