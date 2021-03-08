import * as dat from 'dat.gui';
import { clamp, lerp } from './utils/mathFunctions';
// TO DO
// 1. Mouse events
// 5. easings
// 4. Scroll Loop: animate just items and give them different easings
// 3. Animate when first entering and initialize
// 3. add scroll bar
// 3. Yelvy scroll style
// 6. add key events
// 7. handle pointer events when scrolling and dragging

export default class SweetScroll {
  constructor(options = {}) {
    this.slider = document.querySelector('[data-scroll]');
    this.sliderItems = [...this.slider.querySelectorAll('[data-scroll-item]')]

    this.state = {
      isDragging: false,
      isScrolling: false
    }

    this.options = {
      wheelStrength: options.wheelStrength || 1,
      ease: options.ease || 0.1,
      autoScrollDelta: options.autoScroll || 0,
      dragFactor: options.dragFactor || 4,
      skewFactor: options.skewFactor || 0,
      scaleFactorX: options.scaleFactorX || 0,
      scaleFactorY: options.scaleFactorY || 0,
      parentRotation: options.parentRotation || 0,
      itemsRotation: options.itemsRotation || 0,
    }

    this.observer = null;
    this.rafId = null;
    this.scrollTicking = false;

    this.dragPoint = {
      initialX: null,
      initialY: null,
      lastX: null,
      lastY: null,
      delta: 0
    }

    this.scroll = {
      delta: 0,
      current: 0,
      last: 0,
      speed: 0,
      acc: 0,
      direction: null,
      auto: false
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
    // Body
    document.body.style.overscrollBehavior = 'none';
    document.body.style.overflow = 'hidden';
    // Slider
    this.slider.parentNode.style.transform = `rotate(${this.options.parentRotation}deg)`;
    // Slider items
    this.sliderItems.forEach(item => {
      item.style.transform = `rotate(${this.options.itemsRotation}deg)`;
    });
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
    this.scroll.delta = e.deltaY * this.options.wheelStrength || e.deltaX * this.options.wheelStrength;
    this.setDirection();
  }

  onDrag() {
    this.scroll.current = this.dragPoint.lastX - (this.dragPoint.delta * this.options.dragFactor);
  }

  autoScroll() {
    this.scroll.current += this.options.autoScrollDelta;
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
    this.scroll.speed = (this.scroll.current - this.scroll.last).toFixed(3);
    this.scroll.acc = this.scroll.speed / this.limitScroll;
  }

  calculateTransform() {
    this.transform.translateX = this.scroll.last.toFixed(3);
    this.transform.skewX = (this.scroll.acc * this.options.skewFactor).toFixed(3);
    this.transform.scaleX = 1 - Math.abs(this.scroll.acc * this.options.scaleFactorX).toFixed(3);
    this.transform.scaleY = 1 - Math.abs(this.scroll.acc * this.options.scaleFactorY).toFixed(3);
  }

  styleSlider() {
    this.slider.style.transform = '';
    this.transform.translateX > 0 ? this.slider.style.transform += `matrix3d(1,0,0.00,0,0.00,1,0.00,0,0,0,1,0,${-this.scroll.last},0,0,1)` : '';
    Math.abs(this.transform.skewX) > 0 ? this.slider.style.transform += `skew(${this.transform.skewX}deg, 0)` : '';
    this.transform.scaleY < 0.999 ? this.slider.style.transform += `scale(${this.transform.scaleX}, ${this.transform.scaleY})` : '';
  }

  run() {
    if(!this.scrollTicking) {
      this.rafId = requestAnimationFrame(() => this.run());
      this.scrollTicking = true;
    }

    this.scroll.auto === true ? this.autoScroll() : '';
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
    this.state.isDragging = true;

    if(this.options.autoScrollDelta) {
      this.scroll.auto = false;
    }

    this.dragPoint.initialX = e.pageX;
    this.dragPoint.initialY = e.pageY;
    this.dragPoint.lastX = this.scroll.current;

    this.slider.removeEventListener('wheel', this.onWheel, { passive: true });

    if(window.PointerEvent) {
      e.target.setPointerCapture(e.pointerId);
      this.slider.addEventListener('pointermove', this.onPointerMove, { passive: true });
      this.slider.addEventListener('pointerup', this.onPointerUp, { passive: true });
    }
    this.slider.addEventListener('touchmove', this.onPointerMove, { passive: true });
    this.slider.addEventListener('touchend', this.onPointerUp, { passive: true });
  }

  onPointerMove(e) {
    if(!this.state.isDragging) return;

    this.dragPoint.delta = (e.pageX - this.dragPoint.initialX) + (e.pageY - this.dragPoint.initialY);
    this.onDrag();
  }

  onPointerUp(e) {
    this.state.isDragging = false;

    if(this.options.autoScrollDelta) {
      this.scroll.auto = true;
    }

    this.dragPoint.lastX = this.scroll.current;

    this.slider.addEventListener('wheel', this.onWheel, { passive: true });
    
    if(window.PointerEvent) {
      e.target.releasePointerCapture(e.pointerId);
      this.slider.removeEventListener('pointermove', this.onPointerMove, { passive: true });
      this.slider.removeEventListener('pointerup', this.onPointerUp, { passive: true });
    }

    this.slider.removeEventListener('touchmove', this.onPointerMove, { passive: true });
  }

  addEvents() {
    document.addEventListener('wheel', this.onWheel, { passive: true });

    if(window.PointerEvent) {
      document.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    } else {
      document.addEventListener('touchstart', this.onPointerDown, { passive: true });
    }

    window.addEventListener('resize', this.setBounds);
  }

  addDebuger() {
    const gui = new dat.GUI({ width: 400 });

    gui.hide();

    let autoScrollCache = null;

    const scrollVariablesFolder = gui.addFolder('Scroll variables:');
    scrollVariablesFolder.open();
    scrollVariablesFolder.add(this.options, 'ease', 0.05, 1, 0.025).name('Scroll ease:')
      .onChange(value => this.options.ease = value);
    scrollVariablesFolder.add(this.options, 'wheelStrength', 0.05, 2, 0.025).name('Wheel strength:')
      .onChange(value => this.options.wheelStrength = value);
    scrollVariablesFolder.add(this.options, 'dragFactor', 1, 10, 0.1).name('Drag factor:')
      .onChange(value => this.options.dragFactor = value);
    scrollVariablesFolder.add(this.scroll, 'auto').name('Scroll automatically:')
      .onChange(value => {
        if(value) {
          this.options.autoScrollDelta ? this.options.autoScrollDelta : this.options.autoScrollDelta = autoScrollCache
        } else {
          autoScrollCache = this.options.autoScrollDelta;
          this.options.autoScrollDelta = 0;
        }
      });
    scrollVariablesFolder.add(this.options, 'autoScrollDelta', 0, 2, 0.25).name('Scroll auto delta:')
      .onChange(value => this.options.autoScrollDelta = value);

    const sliderVariablesFolder = gui.addFolder('Slider variables:');
    sliderVariablesFolder.add(this.options, 'scaleFactorX', 0, 3, 0.1).name('Scale factor X:')
      .onChange(value => this.options.scaleFactorX = value);
    sliderVariablesFolder.add(this.options, 'scaleFactorY', 0, 3, 0.1).name('Scale factor Y:')
      .onChange(value => this.options.scaleFactorY = value);
    sliderVariablesFolder.add(this.options, 'skewFactor', 0, 70, 1).name('Skew factor X:')
      .onChange(value => this.options.skewFactor = value);
    sliderVariablesFolder.add(this.options, 'parentRotation', -90, 90, 1).name('Slider rotation:')
      .onChange(value => {
        this.options.parentRotation = value;
        this.setInitialStyles();
      });
    
    const itemsVariablesFolder = gui.addFolder('Items variables:');
    itemsVariablesFolder.add(this.options, 'itemsRotation', -90, 90, 1).name('Items rotation:')
      .onChange(value => {
        this.options.itemsRotation = value;
        this.setInitialStyles();
      });
    
    this.options.consoleLogOptions = () => console.log(`const sweetScrollOptions = ${JSON.stringify(this.options)}`);
    gui.add(this.options, 'consoleLogOptions').name('Log options in console');
  }

  init() {
    Math.abs(this.options.autoScrollDelta) > 0 ? this.scroll.auto = true : '';
    this.setInitialStyles();
    this.bindAll();
    this.setBounds();
    this.addEvents();
    this.addDebuger();
    // this.createObserver();
    this.run();
  }
}