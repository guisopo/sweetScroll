import * as dat from 'dat.gui';
import { clamp, lerp } from './utils/mathFunctions';
// TO DO
// 1. Drag and drop
// 3. add scroll bar
// 3. Animate when first entering and initialize
// 3. Yelvy scroll style
// 4. Scroll Loop
// 5. easings
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
      wheelStrength: this.wheelStrength || 1,
      ease: options.ease || 0.1,
      autoScrollAmount: options.autoScroll || 0.5,
      dragFactor: options.dragFactor || 4,
      skewFactor: options.skewFactor || 0,
      scaleFactorX: options.scaleFactorX || 0,
      scaleFactorY: options.scaleFactorY || 0,
      parentRotation: options.parentRotation || -4,
      itemsRotation: options.itemsRotation || 0,
      itemsSkewX: options.itemSkewX || 0,
      itemsSkewY: options.itemSkewY || 0,
    }

    this.observer = null;

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
      item.style.transform = `
        rotate(${this.options.itemsRotation}deg)
        skew(${this.options.itemsSkewX}deg, ${this.options.itemsSkewY}deg)
      `;
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
    this.scroll.delta = e.deltaY/this.options.wheelStrength || e.deltaX/this.options.wheelStrength;
    this.setDirection();
  }

  onDrag() {
    this.scroll.current = this.dragPoint.lastX - (this.dragPoint.delta * this.options.dragFactor);
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

  autoScroll() {
    this.scroll.current += this.options.autoScrollAmount;
  }

  run() {
    if(!this.scrollTicking) {
      requestAnimationFrame(() => this.run());
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
    this.scroll.auto = false;

    this.dragPoint.initialX = e.pageX;
    this.dragPoint.initialY = e.pageY;
    this.dragPoint.lastX = this.scroll.current;

    this.slider.removeEventListener('wheel', this.onWheel, { passive: true });
    this.slider.addEventListener('pointermove', this.onPointerMove, { passive: true });
    this.slider.addEventListener('touchmove', this.onPointerMove, { passive: true });
    this.slider.addEventListener('pointerup', this.onPointerUp, { passive: true });
  }

  onPointerMove(e) {
    this.dragPoint.delta = (e.pageX - this.dragPoint.initialX) + (e.pageY - this.dragPoint.initialY);
    this.onDrag();
  }

  onPointerUp(e) {
    this.state.isDragging = false;
    this.scroll.auto = true;

    this.dragPoint.lastX = this.scroll.current;

    this.slider.addEventListener('wheel', this.onWheel, { passive: true });
    this.slider.removeEventListener('pointermove', this.onPointerMove, { passive: true });
    this.slider.removeEventListener('touchmove', this.onPointerMove, { passive: true });
    this.slider.removeEventListener('pointerup', this.onPointerUp, { passive: true });
  }

  addEvents() {
    Math.abs(this.options.autoScrollAmount) > 0 ? this.scroll.auto = true : '';

    this.slider.addEventListener('wheel', this.onWheel, { passive: true });
    this.slider.addEventListener('pointerdown', this.onPointerDown, { passive: true });
    this.slider.addEventListener('touchstart', this.onPointerDown, { passive: true });
    this.slider.addEventListener('touchend', this.onPointerUp, { passive: true });
    window.addEventListener('resize', this.setBounds);
  }

  addDebuger() {
    const gui = new dat.GUI(({ width: 400 }));

    // gui.hide();

    const scrollVariablesFolder = gui.addFolder('Scroll variables:');
    scrollVariablesFolder.add(this.options, 'ease', 0.05, 1, 0.025).name('Scroll ease:')
      .onChange((value) => {
        this.options.ease = value;
      });
    scrollVariablesFolder.add(this.scroll, 'auto').name('Scroll automatically:');
    scrollVariablesFolder.add(this.options, 'dragFactor', 1, 10, 0.1).name('Drag factor:')
      .onChange((value) => {
        this.options.dragFactor = value;
      });

    const sliderVariablesFolder = gui.addFolder('Slider variables:');
    sliderVariablesFolder.add(this.options, 'scaleFactorX', 0, 3, 0.1).name('Scale factor X:')
      .onChange((value) => {
        this.options.scaleFactorX = value;
      });
    sliderVariablesFolder.add(this.options, 'scaleFactorY', 0, 3, 0.1).name('Scale factor Y:')
      .onChange((value) => {
        this.options.scaleFactorY = value;
      });
    sliderVariablesFolder.add(this.options, 'skewFactor', 0, 70, 1).name('Skew factor X:')
      .onChange((value) => {
        this.options.skewFactor = value;
      });
    sliderVariablesFolder.add(this.options, 'parentRotation', -90, 90, 1).name('Slider rotation:')
      .onChange((value) => {
        this.options.parentRotation = value;
        this.setInitialStyles();
      });
    
    const itemsVariablesFolder = gui.addFolder('Items variables:')
    itemsVariablesFolder.add(this.options, 'itemsRotation', -90, 90, 1).name('Items rotation:')
      .onChange((value) => {
        this.options.itemsRotation = value;
        this.setInitialStyles();
      });
    itemsVariablesFolder.add(this.options, 'itemsSkewX', -45, 45, 1).name('Items skew X:')
      .onChange((value) => {
        this.options.itemsSkewX = value;
        this.setInitialStyles();
      });
    itemsVariablesFolder.add(this.options, 'itemsSkewY', -45, 45, 1).name('Items skew Y:')
      .onChange((value) => {
        this.options.itemsSkewY = value;
        this.setInitialStyles();
      });
    
    this.options.consoleLogOptions = () => console.log(`const sweetScrollOptions = ${JSON.stringify(this.options)}`);
    gui.add(this.options, 'consoleLogOptions').name('Log options in console');
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