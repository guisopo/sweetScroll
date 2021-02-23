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
    this.maxScroll;
    this.isScrolling = false;
    this.data = {
      delta: 0,
      current: 0
    };
  }

  bindAll() {
    [ 'setBounds', 'addEvents', 'wheel', 'run']
      .forEach( fn => this[fn] = this[fn].bind(this));
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

    this.maxScroll = this.sliderShize.width - this.windowSize.width;
  }

  wheel(e) {
    this.data.delta = e.deltaY || e.deltaX;
  }

  addEvents() {
    this.slider.addEventListener('wheel', () => addEventListener('wheel', this.wheel, { passive: true }));
    window.addEventListener('resize', this.setBounds);
  }

  run() {
    if(this.data.delta !== 0) {
      this.data.current = MathUtils.clamp(this.data.current, 0, this.maxScroll);
      this.data.current = this.data.current + this.data.delta;
      this.data.delta = 0;
      this.slider.style.transform = `translate3d(-${this.data.current}px, 0, 0)`;
    }

    requestAnimationFrame(() => this.run());
  }

  init() {
    this.bindAll();
    this.setBounds();
    this.addEvents();
    this.run();
  }
}

const runSweetScroll = new SweetScroll().init();