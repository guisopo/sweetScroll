## SweetScroll

SweetScroll is a Javascript module to create an horizontal smooth scroll page. It uses the __Intersction Observer API__ to animate just the items that are visible in the viewport.

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

const section = document.querySelector('.vs-section')
const smooth = new Smooth({
  native: true,
  section: section,
  ease: 0.1
})

smooth.init()
```

## Dependencies

| Name             | Description                                                        |
| ---------------- | ------------------------------------------------------------------ |
| [lazysizes] | A fast (jank-free), SEO-friendly and self-initializing lazyloader for images                         |

[instance events]: #instance-events
[lazysizes]: https://github.com/aFarkas/lazysizes
