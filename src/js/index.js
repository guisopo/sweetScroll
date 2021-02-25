import "../styles/main.scss";

const MathUtils = {
  // map number x from range [a, b] to [c, d]
  map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c,
  // linear interpolation
  lerp: (a, b, n) => (1 - n) * a + n * b,
  // normalization
  norm: (value, min, max) => (value - min) / (max - min),
  // clamp
  clamp: (x, min, max) =>  Math.min(Math.max(x, min), max)
};

class SweetScroll {
  constructor() {
    this.slider = document.querySelector('.slider__container');
    this.isScrolling = false;

    this.options = {
      skewFactor: 25
    }
    
    this.scroll = {
      delta: 0,
      current: 0,
      last: 0,
      ease: 0.1,
      speed: 0,
      acc: 0,
      direction: null
    };

    this.transform = {
      translateX: null,
      skewX: null
    }
  }

  bindAll() {
    [ 'setBounds', 'addEvents', 'onWheel', 'run']
      .forEach( fn => this[fn] = this[fn].bind(this));
  }

  setInitialStyles() {
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'hidden';
  }

  setBounds() {
    this.windowSize = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    this.sliderSize = {
      width: this.slider.offsetWidth,
      height: this.slider.offsetHeight
    }

    this.limitScroll = this.sliderSize.width - this.windowSize.width;
  }

  onWheel(e) {
    this.scroll.delta = e.deltaY || e.deltaX;
    this.setDirection();
  }

  setDirection() {
    this.scroll.delta > 0 ? this.scroll.direction = 'right' : this.scroll.direction = 'left';
  }

  calculateSliderPosition() {
    this.scroll.current += this.scroll.delta;
    this.scroll.current = MathUtils.clamp(this.scroll.current, 0, this.limitScroll);
    this.scroll.last = MathUtils.lerp(this.scroll.last, this.scroll.current, this.scroll.ease);
  }

  calculateSpeed() {
    this.scroll.speed = (this.scroll.current - this.scroll.last).toFixed(2);
    this.scroll.acc = this.scroll.speed / this.limitScroll;
  }

  styleSlider() {
    this.transform.translateX = this.scroll.last.toFixed(2);
    
    this.slider.style.transform = `translate3d(-${this.transform.translateX}px, 0, 0)`;
  }

  run() {
    this.calculateSliderPosition();
    // this.calculateSpeed();
    this.styleSlider();

    this.scroll.delta = 0;

    requestAnimationFrame(this.run);
  }

  addEvents() {
    this.slider.addEventListener('wheel', this.onWheel, { passive: true });
    window.addEventListener('resize', this.setBounds);
  }

  init() {
    this.setInitialStyles();
    this.bindAll();
    this.setBounds();
    this.addEvents();
    this.run();
  }
}

const runSweetScroll = new SweetScroll().init();