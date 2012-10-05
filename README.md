position: sticky;  The polyfill!
========================

This shim/polyfill is based on [this][http://codepen.io/FWeinb/details/xLakC] polyfill, exception my version has no dependencies. Yay! Additionally, this polyfill will add a class "stuck" when in the sticky position (and remove it when not).

### Usage
Simply include the polyfill:

``` html
  <script src="sticky.js"></script>
```

And that's it. Simply use CSS as you normally would, for example:

``` css
.my-sticky-element {
  position: sticky;
  top: 20px;
}

.my-sticky-element.stuck {
  box-shadow: 0px 4px 13px #8E8E8E;
}
```
