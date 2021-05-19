import ResizeObserver from 'resize-observer-polyfill';
import { Subject } from 'rxjs';

import { getScrollbarWidth } from './support';

export type ScrollMode = 'auto' | 'overlay' | 'hidden';
export type ScrollPosition = 'start' | 'middle' | 'end' | 'full';
export type ScrollState = 'hidden' | 'scrolling';
export type ScrollExtremity = 'start' | 'end';
export type ScrollDirection = 'h' | 'v';

export interface ScrollConfig {
  mode: ScrollMode;
  topThreshold: number;
  bottomThreshold: number;
  leftThreshold: number;
  rightThreshold: number;
  showOnHover: boolean;
}

const DEFAULT_CONFIG: ScrollConfig = {
  mode: 'auto',
  topThreshold: 50,
  bottomThreshold: 50,
  leftThreshold: 50,
  rightThreshold: 50,
  showOnHover: false,
};

const HOST_CLASS = 'mr-scroll';
const HOST_HIDDEN_CONTENT_MODIFIER = `${HOST_CLASS}--hidden-content`;
const HOST_HIDDEN_CONTENT_LEFT_CLASS = `${HOST_HIDDEN_CONTENT_MODIFIER}-l`;
const HOST_HIDDEN_CONTENT_RIGHT_CLASS = `${HOST_HIDDEN_CONTENT_MODIFIER}-r`;
const HOST_HIDDEN_CONTENT_TOP_CLASS = `${HOST_HIDDEN_CONTENT_MODIFIER}-t`;
const HOST_HIDDEN_CONTENT_BOTTOM_CLASS = `${HOST_HIDDEN_CONTENT_MODIFIER}-b`;
const HOST_HIDDEN_CONTENT_FADE_CLASS = `${HOST_CLASS}_hidden-content-fade`;
const CONTENT_CLASS = `${HOST_CLASS}_content`;
const BAR_CLASS = `${HOST_CLASS}_bar`;
const BAR_HIDDEN_CLASS = `${BAR_CLASS}--hidden`;
const BAR_H_CLASS = `${BAR_CLASS}--h`;
const BAR_V_CLASS = `${BAR_CLASS}--v`;

interface Bar {
  barElement: HTMLDivElement;
  trackElement: HTMLDivElement;
  thumbElement: HTMLDivElement;
}

interface DirectionContext {
  bar: Bar;
  position: ScrollPosition;
  positionAbsolute: ScrollPosition;
  state: ScrollState;
  scrollRatio: number;
  scroll: number | null;

  positionChanged: Subject<ScrollPosition>;
  positionAbsoluteChanged: Subject<ScrollPosition>;
  stateChanged: Subject<ScrollState>;
}

function createDirectionContext(): DirectionContext {
  return {
    bar: null!,
    position: null!,
    positionAbsolute: null!,
    state: null!,
    scrollRatio: 0,
    scroll: null,

    positionChanged: new Subject<ScrollPosition>(),
    positionAbsoluteChanged: new Subject<ScrollPosition>(),
    stateChanged: new Subject<ScrollState>(),
  };
}

/**
 * The core class that implements the custom scroll logic.
 */
export class Scroll {
  private _config: ScrollConfig;
  private _mo: MutationObserver = null!;
  private _ro: ResizeObserver = null!;
  private _browserScrollbarWidth: number;
  private _scrollbarWidth: number;
  private _h = createDirectionContext();
  private _v = createDirectionContext();

  private _boundUpdate = this.update.bind(this);

  private _scrolled = new Subject<{ left: number; top: number }>();
  private _topReached = new Subject<void>();
  private _bottomReached = new Subject<void>();
  private _leftReached = new Subject<void>();
  private _rightReached = new Subject<void>();

  constructor(
    private _hostElement: HTMLElement,
    private _contentElement: HTMLElement,
    config?: Partial<ScrollConfig>,
  ) {
    // Filter out undefined
    config = Object.entries(config || {})
      .filter(([, value]) => value !== undefined)
      .reduce((obj, [key, value]) => (obj[key] = value, obj), {} as any);

    this._config = config = { ...DEFAULT_CONFIG, ...config };

    _hostElement.classList.add(HOST_CLASS);
    _contentElement.classList.add(CONTENT_CLASS);

    if (config.showOnHover) {
      this._hostElement.classList.add(`${HOST_CLASS}--show-on-hover`);
    }

    this._hostElement.classList.add(`${HOST_CLASS}--mode-` + config.mode);

    this._browserScrollbarWidth = this._resolveBrowserScrollbarWidth();
    this._scrollbarWidth = this._resolveScrollbarWidth()!;

    // mr-scroll_bar
    const createBar = (): Bar => {
      const barElement = _hostElement.appendChild(document.createElement('div'));
      barElement.classList.add(`${BAR_CLASS}`);
      const trackElement = barElement.appendChild(document.createElement('div'));
      trackElement.classList.add(`${BAR_CLASS}-track`);
      const thumbElement = barElement.appendChild(document.createElement('div'));
      thumbElement.classList.add(`${BAR_CLASS}-thumb`);
      return {
        barElement,
        trackElement,
        thumbElement,
      };
    };

    const createFade = (t: string) => {
      const fadeElement = _hostElement.appendChild(document.createElement('div'));
      fadeElement.classList.add(HOST_HIDDEN_CONTENT_FADE_CLASS);
      fadeElement.classList.add(HOST_HIDDEN_CONTENT_FADE_CLASS + `--${t}`);
    };
    ['t', 'r', 'b', 'l'].forEach(t => createFade(t));

    const barH = this._h.bar = createBar();
    barH.barElement.classList.add(BAR_H_CLASS);
    const barV = this._v.bar = createBar();
    barV.barElement.classList.add(BAR_V_CLASS);

    if (this.mode != 'auto') {
      // In all modes but auto, we always have spacing
      this._addSpacing();
    }
  }

  get mode() { return this._config.mode; }

  get scrollLeft() { return this._h.scroll; }

  get scrollTop() { return this._v.scroll; }

  get positionH() { return this._h.position; }

  get positionV() { return this._v.position; }

  get positionAbsoluteH() { return this._h.positionAbsolute; }

  get positionAbsoluteV() { return this._v.positionAbsolute; }

  get stateH() { return this._h.state; }

  get stateV() { return this._v.state; }

  get scrolled() { return this._scrolled.asObservable(); }
  get topReached() { return this._topReached.asObservable(); }
  get bottomReached() { return this._bottomReached.asObservable(); }
  get leftReached() { return this._leftReached.asObservable(); }
  get rightReached() { return this._rightReached.asObservable(); }
  get positionHChanged() { return this._h.positionChanged.asObservable(); }
  get positionAbsoluteHChanged() { return this._h.positionAbsoluteChanged.asObservable(); }
  get stateHChanged() { return this._h.stateChanged.asObservable(); }
  get positionVChanged() { return this._v.positionChanged.asObservable(); }
  get positionAbsoluteVChanged() { return this._v.positionAbsoluteChanged.asObservable(); }
  get stateVChanged() { return this._v.stateChanged.asObservable(); }

  private get _ownHeight() { return this._contentElement.clientHeight; }
  private get _ownWidth() { return this._contentElement.clientWidth; }
  private get _totalHeight() { return this._contentElement.scrollHeight; }
  private get _totalWidth() { return this._contentElement.scrollWidth; }

  /**
   * Initializes the scroll.
   */
  initialize() {
    // Setup subjects
    this.positionHChanged.subscribe((position: ScrollPosition) => {
      switch (position) {
        case 'start': this._leftReached.next(); break;
        case 'end': this._rightReached.next(); break;
      }
    });

    this.positionVChanged.subscribe((position: ScrollPosition) => {
      switch (position) {
        case 'start': this._topReached.next(); break;
        case 'end': this._bottomReached.next(); break;
      }
    });

    this.positionAbsoluteHChanged.subscribe(() => {
      this._updateHiddenContentClasses();
    });
    this.positionAbsoluteVChanged.subscribe(() => {
      this._updateHiddenContentClasses();
    });
    this._updateHiddenContentClasses();

    if (this.mode == 'auto') {
      // Only in auto mode, we add/remove spacing depending on the state

      this.stateHChanged.subscribe((state: ScrollState) => {
        switch (state) {
          case 'scrolling':
            this._addSpacingH();
            break;

          case 'hidden':
            this._removeSpacingH();
            break;
        }
      });

      this.stateVChanged.subscribe((state: ScrollState) => {
        switch (state) {
          case 'scrolling':
            this._addSpacingV();
            break;

          case 'hidden':
            this._removeSpacingV();
            break;
        }
      });
    }

    // Setup observers
    this._ro = new ResizeObserver(() => {
      this.update();
    });
    this._ro.observe(this._contentElement);

    const observeNodes = (nodes: NodeList) => {
      nodes.forEach(node => {
        if (node.nodeType != node.ELEMENT_NODE) return;
        this._ro.observe(node as Element);
      });
    };
    const unobserveNodes = (nodes: NodeList) => {
      nodes.forEach(node => {
        if (node.nodeType != node.ELEMENT_NODE) return;
        this._ro.unobserve(node as Element);
      });
    };

    observeNodes(this._contentElement.childNodes);

    this._mo = new MutationObserver(mutationsList => {
      for (const mutation of mutationsList) {
        unobserveNodes(mutation.removedNodes);
        observeNodes(mutation.addedNodes);
      }
      this.update();
    });
    this._mo.observe(this._contentElement, { childList: true });

    //
    this._setCssProperty('--mr-scroll-browser-bar-size', `${this._browserScrollbarWidth}px`);
    this._setCssProperty('--mr-scroll-bar-size', `${this._scrollbarWidth}px`);

    if (!this._browserScrollbarWidth) {
      this._hostElement.classList.add(`${HOST_CLASS}--width-0`);
    }

    this._contentElement.addEventListener('scroll', this._boundUpdate);
    this._contentElement.addEventListener('mouseenter', this._boundUpdate);
    window.addEventListener('resize', this._boundUpdate);

    this.update();
  }

  /**
   * Destroys the scroll. It's required to call this after you finish using the scroll
   * so that it can properly deallocate resources and clean after itself.
   */
  destroy() {
    this._contentElement.removeEventListener('scroll', this._boundUpdate);
    this._contentElement.removeEventListener('mouseenter', this._boundUpdate);
    window.removeEventListener('resize', this._boundUpdate);
    this._mo.disconnect();
    this._ro.disconnect();

    this._scrolled.complete();
    this._topReached.complete();
    this._bottomReached.complete();
    this._leftReached.complete();
    this._rightReached.complete();
    this._h.positionChanged.complete();
    this._h.positionAbsoluteChanged.complete();
    this._h.stateChanged.complete();
    this._v.positionChanged.complete();
    this._v.positionAbsoluteChanged.complete();
    this._v.stateChanged.complete();
  }

  /**
   * Updates the scroll's state. Usually you don't need to call this manually as the scroll detects and updates
   * itself automatically whenever it needs to.
   */
  update() {
    requestAnimationFrame(() => {
      const ownHeight = this._ownHeight;
      const ownWidth = this._ownWidth;
      const totalHeight = this._totalHeight;
      const totalWidth = this._totalWidth;

      this._h.scrollRatio = ownWidth / totalWidth;
      this._v.scrollRatio = ownHeight / totalHeight;

      const { scrollTop, scrollLeft } = this._contentElement;
      const width = (this._h.scrollRatio) * 100;
      const left = (scrollLeft / totalWidth) * 100;
      const height = (this._v.scrollRatio) * 100;
      const top = (scrollTop / totalHeight) * 100;

      if (this._h.scroll == null || this._h.scroll != scrollLeft) {
        this._h.scroll = scrollLeft;
      }
      if (this._v.scroll == null || this._v.scroll != scrollTop) {
        this._v.scroll = scrollTop;
      }

      const computePosition = (scrollRatio: number, scroll: number, ownSize: number, totalSize: number, startThreshold: number, endThreshold: number) => {
        let p: ScrollPosition = 'middle';
        if (scrollRatio >= 1) {
          p = 'full';
        } else {
          const isStart = scroll <= startThreshold;
          if (isStart) {
            p = 'start';
          }

          if (!isStart) {
            const attainedSize = scroll + ownSize + endThreshold;
            if (attainedSize >= totalSize) {
              p = 'end';
            }
          }
        }

        return p;
      };

      const computePositionH = (leftThreshold: number, rightThreshold: number) => {
        return computePosition(this._h.scrollRatio, scrollLeft, ownWidth, totalWidth, leftThreshold, rightThreshold);
      };

      const computePositionV = (topThreshold: number, bottomThreshold: number) => {
        return computePosition(this._v.scrollRatio, scrollTop, ownHeight, totalHeight, topThreshold, bottomThreshold);
      };

      const newPositionH = computePositionH(this._config.leftThreshold, this._config.rightThreshold);
      const newPositionAbsoluteH = computePositionH(0, 0);
      const newStateH: ScrollState = newPositionH == 'full' ? 'hidden' : 'scrolling';

      if (newPositionH == 'full') {
        this._h.bar.barElement.classList.add(BAR_HIDDEN_CLASS);
      } else {
        this._h.bar.barElement.classList.remove(BAR_HIDDEN_CLASS);

        const cssText =
          `width:${width}%;` +
          `left:${left}%;`;

        this._h.bar.thumbElement.style.cssText = cssText;
      }

      const newPositionV = computePositionV(this._config.topThreshold, this._config.bottomThreshold);
      const newPositionAbsoluteV = computePositionV(0, 0);
      const newStateV: ScrollState = newPositionV == 'full' ? 'hidden' : 'scrolling';

      if (newPositionV == 'full') {
        this._v.bar.barElement.classList.add(BAR_HIDDEN_CLASS);
      } else {
        this._v.bar.barElement.classList.remove(BAR_HIDDEN_CLASS);

        const cssText =
          `height:${height}%;` +
          `top:${top}%;`;

        this._v.bar.thumbElement.style.cssText = cssText;
      }

      this._setPositionAndStateH(newPositionH, newPositionAbsoluteH, newStateH);
      this._setPositionAndStateV(newPositionV, newPositionAbsoluteV, newStateV);
      this._scrolled.next({ left: scrollLeft, top: scrollTop });
    });
  }

  scrollTo(options: ScrollToOptions) {
    this._contentElement.scroll(options);
  }

  private _resolveDirectionContext(direction: ScrollDirection) {
    switch (direction) {
      case 'h': return this._h;
      case 'v': return this._v;
    }
  }

  private _setPositionAndState(direction: ScrollDirection, position: ScrollPosition, positionAbsolute: ScrollPosition, state: ScrollState) {
    const c = this._resolveDirectionContext(direction);
    const positionChanged = position != c.position;
    const positionAbsoluteChanged = positionAbsolute != c.positionAbsolute;
    const stateChanged = state != c.state;

    if (!positionChanged && !positionAbsoluteChanged && !stateChanged) {
      return;
    }

    c.position = position;
    c.positionAbsolute = positionAbsolute;
    c.state = state;

    if (positionChanged) {
      c.positionChanged.next(position);
    }
    if (positionAbsoluteChanged) {
      c.positionAbsoluteChanged.next(positionAbsolute);
    }
    if (stateChanged) {
      c.stateChanged.next(state);
    }
  }

  private _setPositionAndStateH(position: ScrollPosition, positionAbsolute: ScrollPosition, state: ScrollState) {
    this._setPositionAndState('h', position, positionAbsolute, state);
  }

  private _setPositionAndStateV(position: ScrollPosition, positionAbsolute: ScrollPosition, state: ScrollState) {
    this._setPositionAndState('v', position, positionAbsolute, state);
  }

  private _updateHiddenContentClasses() {
    const setClasses = (classes: { start: string; end: string }, extremities: ScrollExtremity[] | null) => {
      this._hostElement.classList.remove(classes.start, classes.end);
      if (extremities != null)
        for (const c of extremities) {
          switch (c) {
            case 'start':
              this._hostElement.classList.add(classes.start);
              break;

            case 'end':
              this._hostElement.classList.add(classes.end);
              break;
          }
        }
    };

    const classesH = { start: HOST_HIDDEN_CONTENT_LEFT_CLASS, end: HOST_HIDDEN_CONTENT_RIGHT_CLASS };
    const classesV = { start: HOST_HIDDEN_CONTENT_TOP_CLASS, end: HOST_HIDDEN_CONTENT_BOTTOM_CLASS };

    [{ position: this._h.positionAbsolute, classes: classesH }, { position: this._v.positionAbsolute, classes: classesV }].forEach(x => {
      switch (x.position) {
        case 'full':
          setClasses(x.classes, null);
          break;

        case 'start':
          setClasses(x.classes, ['end']);
          break;

        case 'middle':
          setClasses(x.classes, ['start', 'end']);
          break;

        case 'end':
          setClasses(x.classes, ['start']);
          break;
      }
    });
  }

  private _addSpacing() {
    this._addSpacingH();
    this._addSpacingV();
  }

  private _addSpacingH() {
    this._contentElement.style.marginBottom = `-${this._browserScrollbarWidth}px`;
    if (this.mode == 'auto') {
      this._contentElement.style.paddingBottom = `${this._scrollbarWidth}px`;
    }
  }

  private _removeSpacingH() {
    this._contentElement.style.marginBottom = '';
    this._contentElement.style.paddingBottom = '';
  }

  private _addSpacingV() {
    this._contentElement.style.marginRight = `-${this._browserScrollbarWidth}px`;
    if (this.mode == 'auto') {
      this._contentElement.style.paddingRight = `${this._scrollbarWidth}px`;
    }
  }

  private _removeSpacingV() {
    this._contentElement.style.marginRight = '';
    this._contentElement.style.paddingRight = '';
  }

  private _getCssProperty(name: string) {
    return getComputedStyle(this._hostElement).getPropertyValue(name);
  }

  private _setCssProperty(name: string, value: string) {
    this._hostElement.style.setProperty(name, value);
  }

  private _resolveBrowserScrollbarWidth() {
    return getScrollbarWidth();
  }

  private _resolveScrollbarWidth(mode = this.mode) {
    let type = 'normal';
    if (mode == 'overlay' || mode == 'hidden') {
      type = 'overlay';
    }
    const widthRaw = this._getCssProperty(`--mr-scroll-bar-size-${type}`).trim();
    if (!widthRaw) {
      return null;
    }
    return parseInt(widthRaw.substring(0, widthRaw.length - 2));
  }
}
