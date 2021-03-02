import "../styles/main.scss";
import * as dat from 'dat.gui';

// TO DO
// 1. Drag and drop
// 2. Scroll Loop
// 3. imagesLoader
// 4. add scroll bar

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
    this.slider = document.querySelector('[data-scroll]');
    this.sliderItems = [...this.slider.querySelectorAll('[data-scroll-item]')]

    this.observer = null;

    this.options = {
      skewFactor: 0,
      scaleFactorX: 0,
      scaleFactorY: 0
    }

    this.scrollTicking = false;

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
      skewX: null,
      scaleX: null,
      scaleY: null
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

  calculateTransform() {
    this.transform.translateX = this.scroll.last.toFixed(2);
    this.transform.skewX = this.scroll.acc * this.options.skewFactor;
    this.transform.scaleX = 1 - Math.abs(this.scroll.acc * this.options.scaleFactorX);
    this.transform.scaleY = 1 - Math.abs(this.scroll.acc * this.options.scaleFactorY);
  }

  styleSlider() {
    this.slider.style.transform = `
      matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${-this.scroll.last},0,0,1) 
      skew(${this.transform.skewX}deg, 0)
      scale(${this.transform.scaleX}, ${this.transform.scaleY})`;
  }

  run() {
    if(!this.scrollTicking) {
      this.sweetScrollRaf = requestAnimationFrame(() => this.run());
      this.scrollTicking = true;
    }
    this.calculateSliderPosition();
    this.calculateSpeed();
    this.calculateTransform();
    this.styleSlider();
    
    this.scroll.delta = 0;
    
    this.scrollTicking = false;
  }

  createObserver() {
    this.observer = new IntersectionObserver(entries => {
      for (const entry of entries) { 
        const id = Number(entry.target.id);
        console.log(`${entry.target.id} is in view: ${entry.isIntersecting}`);
        console.log(`${entries[id + 1]} is ${entries[id + 1].isIntersecting}`);
        entry.isIntersecting 
          ? entry.target.style.visibility = 'visible' 
          : entry.target.style.display = 'hidden';
      }
    });

    this.observeSliderItems();
  }

  observeSliderItems() {
    this.sliderItems.forEach(item => this.observer.observe(item))
  }

  addEvents() {
    this.slider.addEventListener('wheel', this.onWheel, { passive: true });
    window.addEventListener('resize', this.setBounds);
  }

  addDebuger() {
    const gui = new dat.GUI(({ width: 400 }));

    gui.hide();

    gui
      .add(this.options, 'scaleFactorX')
      .min(0)
      .max(3)
      .step(0.1)
      .name('scaleX')
      .onChange((value) => {
        this.options.scaleFactorX = value;
        console.log(this.options.scaleFactorX);
      });
    gui
      .add(this.options, 'scaleFactorY')
      .min(0)
      .max(3)
      .step(0.1)
      .name('scaleY')
      .onChange((value) => {
        this.options.scaleFactorY = value;
      });
    gui
      .add(this.options, 'skewFactor')
      .min(0)
      .max(70)
      .step(1)
      .name('skewX')
      .onChange((value) => {
        this.options.skewFactor = value;
      });
  }

  init() {
    this.setInitialStyles();
    this.bindAll();
    this.addDebuger();
    this.setBounds();
    this.addEvents();
    // this.createObserver();
    this.run();
  }
}

const runSweetScroll = new SweetScroll().init();