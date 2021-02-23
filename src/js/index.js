import "../styles/main.scss";

const MathUtils = {
  // map number x from range [a, b] to [c, d]
  map: (x, a, b, c, d) => (x - a) * (d - c) / (b - a) + c,
  // linear interpolation
  lerp: (a, b, n) => (1 - n) * a + n * b,
  // normalization
  norm: (value, min, max) => {
    return (value - min) / (max - min)
  }
};

class SweetScroll {
  constructor() {
    this.slider = document.querySelector('.slider__container');

    this.delta = 0;

    this.data = {
      current: 0
    }
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
  }

  wheel(e) {
    this.delta = e.deltaY || e.deltaX;
  }

  addEvents() {
    this.slider.addEventListener('wheel', () => addEventListener('wheel', this.wheel, { passive: true }));
    window.addEventListener('resize', this.setBounds);
  }

  run() {
    this.data.current = this.data.current + this.delta;
    this.delta = 0;
    this.slider.style.transform = `translate3d(-${this.data.current}px, 0, 0)`;

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