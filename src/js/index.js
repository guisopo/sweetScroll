import "../styles/main.scss";

// TO - DO
// 1. Change aspect ratio to div not to pseudoelement due to performance issues

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
    this.scroll = {
      delta: 0,
      current: 0,
      last: 0,
      ease: 0.1,
      speed: 0,
      direction: null
    };
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

    this.sliderShize = {
      width: this.slider.offsetWidth,
      height: this.slider.offsetHeight
    }

    this.limitScroll = this.sliderShize.width - this.windowSize.width;
  }

  onWheel(e) {
    this.scroll.delta = e.deltaY || e.deltaX;
    this.addDirection();
  }

  addDirection() {
    this.scroll.delta > 0 ? this.scroll.direction = 'right' : this.scroll.direction = 'left';
  }

  run() {
    this.scroll.current += this.scroll.delta;
    this.scroll.current = MathUtils.clamp(this.scroll.current, 0, this.limitScroll);
    this.scroll.last = MathUtils.lerp(this.scroll.last, this.scroll.current, this.scroll.ease);

    this.scroll.speed = Math.abs(this.scroll.current - this.scroll.last);
    
    this.slider.style.transform = `translate3d(-${this.scroll.last}px, 0, 0)`;
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