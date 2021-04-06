import * as dat from 'dat.gui';
import { clamp, lerp, norm } from './utils/mathFunctions';

export default class SweetScrollItems {
  constructor(options = {}) {
    this.slider = document.querySelector('[data-scroll]');
    this.sliderItems = [...this.slider.querySelectorAll('[data-scroll-item]')];
    this.sliderImages = [...this.slider.querySelectorAll('.slider__image')];
    this.itemsVisible = [];
    this.lastItem = null;

    this.state = {
      isScrolling: false
    }

    this.options = {
      ease: options.ease || 0.1,
    }

    this.observer = null;
    this.rafId = null;
    this.scrollTicking = false;
    this.timeoutId = undefined;

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
    }
  }

  bindAll() {
    [ 'setBounds', 'addEvents', 'onWheel', 'run' ]
      .forEach( fn => this[fn] = this[fn].bind(this));
  }

  setInitialStyles() {
    // Body
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

    this.limitScroll = this.sliderSize.width - this.windowSize.width + 140;
  }

  checkItemVisibility() {
    for (let i = 0; i < this.sliderItems.length; i++) {
      this.itemsVisible.push(this.sliderItems[i]);
      this.lastItem = this.itemsVisible.length -1;
      if(this.sliderItems[i].getBoundingClientRect().x > this.windowSize.width) {
        break;
      }
    }
  }

  onWheel(e) {
    this.scroll.delta = e.deltaY || e.deltaX;
    this.setDirection();
  }

  setDirection() {
    this.scroll.current - this.scroll.last > 0 ? this.scroll.direction = 'right' : this.scroll.direction = 'left';
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
    this.transform.translateX = this.scroll.last.toFixed(3) * -1;
  }

  getNextItem(item) {
    const nextItem = this.sliderItems[item.id];
    console.log(nextItem);
  }

  translateItem(item) {
    if(Math.round(this.itemsVisible[this.itemsVisible.length - 1].getBoundingClientRect().x) === window.innerWidth
    ) {
      this.getNextItem(this.itemsVisible[this.itemsVisible.length - 1]);
    };
    
    item.style.transform  = `translateX(${this.transform.translateX}px)`;
    
  }

  run() {
    if(!this.scrollTicking) {
      this.rafId = requestAnimationFrame(() => this.run());
      this.scrollTicking = true;
    }

    this.calculateSliderPosition();
    this.calculateSpeed();

    this.calculateTransform();

    if(this.itemsVisible.length > 1) {
      // console.log();
      this.itemsVisible.forEach((item) => this.translateItem(item))
    };

    this.scrollTicking = false;
  }

  addEvents() {
    document.addEventListener('wheel', this.onWheel, { passive: true });

    window.addEventListener('resize', this.setBounds);
  }

  init() {
    this.setInitialStyles();
    this.bindAll();
    this.setBounds();
    this.checkItemVisibility();
    this.addEvents();
    this.run();
  }
}