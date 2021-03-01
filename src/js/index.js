import "../styles/main.scss";

// TO DO
// 1. Check if with flexbox we increase performance
// 2. Scroll Ticking: check locomotiv and article
// 3. Recalculate style: check if with fixed width and height better performance

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
      skewFactor: 25
    }

    this.isScrolling = false;
    this.scrollTicking = false;
    this.startScrollTS = null;

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

    this.styleSlider();
  }

  calculateSpeed() {
    this.scroll.speed = (this.scroll.current - this.scroll.last).toFixed(2);
    this.scroll.acc = this.scroll.speed / this.limitScroll;
  }

  styleSlider() {
    this.transform.translateX = this.scroll.last.toFixed(2);
    this.slider.style.transform = `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${-this.scroll.last},0,0,1)`;
  }

  run() {
    if(!this.scrollTicking) {
      this.sweetScrollRaf = requestAnimationFrame(() => this.run());
      this.scrollTicking = true;
    }

    this.calculateSliderPosition();
    
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

  init() {
    this.setInitialStyles();
    this.bindAll();
    this.setBounds();
    this.addEvents();
    // this.createObserver();
    this.run();
  }
}

const runSweetScroll = new SweetScroll().init();