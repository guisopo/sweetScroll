## SweetScroll 🍭

SweetScroll is a Javascript module to create an horizontal virtual smooth scrolling page with optional CSS transform effects on each children item from the main section. 

It uses the __Intersction Observer API__ to improve the performance by animating just the items that are visible in the viewport.

![alt text](https://raw.githubusercontent.com/guisopo/sweetScroll/main/src/images/screenshot.png "Slider screenshot")

### Methods

#### `smooth.init()`

Will add all event listeners and create the intersection observer.

### Options

- `wheelStrength`: on-scroll events listener & parent container for all elements
- `ease: 0.1,
  autoScrollDelta: 0,
  dragFactor: 4,
  skewFactor: 0,
  scaleFactorY: 0,
  parentRotation:  0,
  itemRotateX: false,
  itemRotateY: false,
  itemRotateZ: false,
  rotate3dFactor: 0,

### Usage

#### HTML
```html
<section class="slider js-slider">
    <div class="slider__container js-container" data-scroll>

      <div class="slider__item item" id="1" data-scroll-item data-speed="0.0">
        <img data-src="./images/1.jpg" class="slider__image lazyload">
      </div>
      
      [...]
      
  </div>
  
  <div class="progress-bar">
    <span class="progress-bar__fill" data-scroll-progress></span>
  </div>
</section>
```
#### Javascript
```javascript
import 'lazysizes';
import SweetScroll from './sweetScroll';

const sweetScrollOptions = {
      wheelStrength: 1,
      ease: 0.1,
      autoScrollDelta: 0,
      dragFactor: 4,
      skewFactor: 0,
      scaleFactorY: 0,
      parentRotation:  0,
      itemRotateX: false,
      itemRotateY: false,
      itemRotateZ: false,
      rotate3dFactor: 0,
    }

const slider = new SweetScroll(sweetScrollOptions).init();
```


## Building your SweetScroll

In the terminal, enter the following:

```
$ npm install
$ npm run build
```

## npm scripts

- npm run build - Build development and production version of scripts.
- npm run dev - Build development version of script and watch for changes.

## Dependencies

| Name             | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| [lazysizes] | A fast (jank-free), SEO-friendly and self-initializing lazyloader for images |
| [dat.GUI] | A lightweight graphical user interface for changing variables in JavaScript |

[instance events]: #instance-events
[lazysizes]: https://github.com/aFarkas/lazysizes
[dat.GUI]: https://github.com/dataarts/dat.gui
