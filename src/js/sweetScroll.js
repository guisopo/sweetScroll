import * as dat from 'dat.gui';
import { clamp, lerp } from './utils/mathFunctions';
// TO DO
// 1. Drag and drop
// 2. Scroll Loop
// 3. imagesLoader
// 4. add scroll bar
// 5. easings

export default class SweetScroll {
  constructor() {
    this.slider = document.querySelector('[data-scroll]');
    this.sliderItems = [...this.slider.querySelectorAll('[data-scroll-item]')]

    this.observer = null;

    this.options = {
      skewFactor: 0,
      scaleFactorX: 0,
      scaleFactorY: 0,
      ease: 0.1,
      dragFactor: 4
    }

    this.scrollTicking = false;

    this.dragPoint = {
      initialX: null,
      initialY: null,
      lastX: null,
      lastY: null
    }

    this.scroll = {
      delta: 0,
      current: 0,
      last: 0,
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
    [ 'setBounds', 'addEvents', 'onWheel', 'onPointerDown', 'onPointerUp', 'onPointerMove', 'run']
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
    this.scroll.delta = 0;
    this.scroll.current = clamp(this.scroll.current, 0, this.limitScroll);
    this.scroll.last = lerp(this.scroll.last, this.scroll.current, this.options.ease);
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
      requestAnimationFrame(() => this.run());
      this.scrollTicking = true;
    }
    this.calculateSliderPosition();
    this.calculateSpeed();
    this.calculateTransform();
    this.styleSlider();
    
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

  onPointerDown(e) {
    this.dragPoint.initialX = e.clientX;
    this.dragPoint.lastX = this.scroll.current;
    this.slider.removeEventListener('wheel', this.onWheel, { passive: true });
    this.slider.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.slider.addEventListener('pointerup', this.onPointerUp, { passive: true });
  }

  onPointerMove(e) {
    this.scroll.current = this.dragPoint.lastX - ((e.clientX - this.dragPoint.initialX) * this.options.dragFactor);
  }

  onPointerUp(e) {
    this.dragPoint.lastX = this.scroll.current;

    this.slider.addEventListener('wheel', this.onWheel, { passive: true });
    this.slider.removeEventListener('pointermove', this.onPointerMove, { passive: true });
    this.slider.removeEventListener('pointerup', this.onPointerUp, { passive: true });
  }

  addEvents() {
    this.slider.addEventListener('wheel', this.onWheel, { passive: true });
    this.slider.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    window.addEventListener('resize', this.setBounds);
  }

  addDebuger() {
    const gui = new dat.GUI(({ width: 400 }));

    gui.hide();

    gui.add(this.options, 'ease').min(0).max(0.75).step(0.001).name('Scroll ease')
      .onChange((value) => {
        this.options.ease = value;
      });
    gui.add(this.options, 'dragFactor').min(1).max(10).step(0.001).name('Drag Factor')
      .onChange((value) => {
        this.options.dragFactor = value;
      });
    gui.add(this.options, 'scaleFactorX').min(0).max(3).step(0.1).name('scaleX')
      .onChange((value) => {
        this.options.scaleFactorX = value;
      });
    gui.add(this.options, 'scaleFactorY').min(0).max(3).step(0.1).name('scaleY')
      .onChange((value) => {
        this.options.scaleFactorY = value;
      });
    gui.add(this.options, 'skewFactor').min(0).max(70).step(1).name('skewX')
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