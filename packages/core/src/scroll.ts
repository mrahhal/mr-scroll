import ResizeObserver from 'resize-observer-polyfill';
import { Subject } from 'rxjs';

import { getScrollbarWidth } from './support';

export type ScrollMode = 'auto' | 'overlay' | 'hidden';
export type ScrollPosition = 'start' | 'middle' | 'end' | 'full';
export type ScrollState = 'hidden' | 'scrolling';
export type ScrollExtremity = 'start' | 'end';

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
const HOST_HIDDEN_CONTENT_START_CLASS = `${HOST_CLASS}--hidden-content-start`;
const HOST_HIDDEN_CONTENT_END_CLASS = `${HOST_CLASS}--hidden-content-end`;
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

/**
 * The core class that implements the custom scroll logic.
 */
export class Scroll {
  private _config: ScrollConfig;
  private _mo: MutationObserver = null!;
  private _ro: ResizeObserver = null!;
  private _browserScrollbarWidth: number;
  private _scrollbarWidth: number;
  private _barH: Bar;
  private _barV: Bar;
  private _positionH: ScrollPosition = null!;
  private _positionHAbsolute: ScrollPosition = null!;
  private _stateH: ScrollState = null!;
  private _positionV: ScrollPosition = null!;
  private _positionVAbsolute: ScrollPosition = null!;
  private _stateV: ScrollState = null!;
  private _scrollRatioH = 0;
  private _scrollRatioV = 0;
  private _scrollTop: number | null = null;
  private _scrollLeft: number | null = null;

  private _boundUpdate = this.update.bind(this);

  private _scrolled = new Subject<{ left: number; top: number }>();
  private _topReached = new Subject<void>();
  private _bottomReached = new Subject<void>();
  private _leftReached = new Subject<void>();
  private _rightReached = new Subject<void>();
  private _positionHChanged = new Subject<ScrollPosition>();
  private _positionHAbsoluteChanged = new Subject<ScrollPosition>();
  private _stateHChanged = new Subject<ScrollState>();
  private _positionVChanged = new Subject<ScrollPosition>();
  private _positionVAbsoluteChanged = new Subject<ScrollPosition>();
  private _stateVChanged = new Subject<ScrollState>();

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

    const barH = this._barH = createBar();
    barH.barElement.classList.add(BAR_H_CLASS);
    const barV = this._barV = createBar();
    barV.barElement.classList.add(BAR_V_CLASS);

    if (this.mode != 'auto') {
      // In all modes but auto, we always have spacing
      this._addSpacing();
    }
  }

  get mode() { return this._config.mode; }

  get scrollTop() { return this._scrollTop; }

  get scrollLeft() { return this._scrollLeft; }

  get position() { return this._positionV; }

  get positionAbsolute() { return this._positionVAbsolute; }

  get state() { return this._stateV; }

  get scrolled() { return this._scrolled.asObservable(); }
  get topReached() { return this._topReached.asObservable(); }
  get bottomReached() { return this._bottomReached.asObservable(); }
  get leftReached() { return this._leftReached.asObservable(); }
  get rightReached() { return this._rightReached.asObservable(); }
  get positionHChanged() { return this._positionHChanged.asObservable(); }
  get positionHAbsoluteChanged() { return this._positionHAbsoluteChanged.asObservable(); }
  get stateHChanged() { return this._stateHChanged.asObservable(); }
  get positionVChanged() { return this._positionVChanged.asObservable(); }
  get positionVAbsoluteChanged() { return this._positionVAbsoluteChanged.asObservable(); }
  get stateVChanged() { return this._stateVChanged.asObservable(); }

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

    this.positionVAbsoluteChanged.subscribe(() => {
      this._updateHiddentContentClasses();
    });
    this._updateHiddentContentClasses();

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
    this._positionHChanged.complete();
    this._positionHAbsoluteChanged.complete();
    this._stateHChanged.complete();
    this._positionVChanged.complete();
    this._positionVAbsoluteChanged.complete();
    this._stateVChanged.complete();
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

      this._scrollRatioH = ownWidth / totalWidth;
      this._scrollRatioV = ownHeight / totalHeight;

      const { scrollTop, scrollLeft } = this._contentElement;
      const width = (this._scrollRatioH) * 100;
      const left = (scrollLeft / totalWidth) * 100;
      const height = (this._scrollRatioV) * 100;
      const top = (scrollTop / totalHeight) * 100;

      if (this._scrollLeft == null || this._scrollLeft != scrollLeft) {
        this._scrollLeft = scrollLeft;
      }
      if (this._scrollTop == null || this._scrollTop != scrollTop) {
        this._scrollTop = scrollTop;
      }

      const computePositionH = (leftThreshold: number, rightThreshold: number) => {
        let p: ScrollPosition = 'middle';
        if (this._scrollRatioH >= 1) {
          p = 'full';
        } else {
          const isLeft = scrollLeft <= leftThreshold;
          if (isLeft) {
            p = 'start';
          }

          if (!isLeft) {
            const attainedWidth = scrollLeft + ownWidth + rightThreshold;
            if (attainedWidth >= totalWidth) {
              p = 'end';
            }
          }
        }

        return p;
      };

      const computePositionV = (topThreshold: number, bottomThreshold: number) => {
        let p: ScrollPosition = 'middle';
        if (this._scrollRatioV >= 1) {
          p = 'full';
        } else {
          const isTop = scrollTop <= topThreshold;
          if (isTop) {
            p = 'start';
          }

          if (!isTop) {
            const attainedHeight = scrollTop + ownHeight + bottomThreshold;
            if (attainedHeight >= totalHeight) {
              p = 'end';
            }
          }
        }

        return p;
      };

      const newPositionH = computePositionH(this._config.leftThreshold, this._config.rightThreshold);
      const newPositionHAbsolute = computePositionH(0, 0);
      const newStateH: ScrollState = newPositionH == 'full' ? 'hidden' : 'scrolling';

      if (newPositionH == 'full') {
        this._barH.barElement.classList.add(BAR_HIDDEN_CLASS);
      } else {
        this._barH.barElement.classList.remove(BAR_HIDDEN_CLASS);

        const cssText =
          `width:${width}%;` +
          `left:${left}%;`;

        this._barH.thumbElement.style.cssText = cssText;
      }

      const newPositionV = computePositionV(this._config.topThreshold, this._config.bottomThreshold);
      const newPositionVAbsolute = computePositionV(0, 0);
      const newStateV: ScrollState = newPositionV == 'full' ? 'hidden' : 'scrolling';

      if (newPositionV == 'full') {
        this._barV.barElement.classList.add(BAR_HIDDEN_CLASS);
      } else {
        this._barV.barElement.classList.remove(BAR_HIDDEN_CLASS);

        const cssText =
          `height:${height}%;` +
          `top:${top}%;`;

        this._barV.thumbElement.style.cssText = cssText;
      }

      this._setPositionAndStateH(newPositionH, newPositionHAbsolute, newStateH);
      this._setPositionAndStateV(newPositionV, newPositionVAbsolute, newStateV);
      this._scrolled.next({ left: scrollLeft, top: scrollTop });
    });
  }

  scrollTo(options: ScrollToOptions) {
    this._contentElement.scroll(options);
  }

  private _setPositionAndStateH(position: ScrollPosition, positionAbsolute: ScrollPosition, state: ScrollState) {
    const positionChanged = position != this._positionH;
    const positionAbsoluteChanged = positionAbsolute != this._positionHAbsolute;
    const stateChanged = state != this._stateH;

    if (!positionChanged && !positionAbsoluteChanged && !stateChanged) {
      return;
    }

    this._positionH = position;
    this._positionHAbsolute = positionAbsolute;
    this._stateH = state;
    if (positionChanged) {
      this._positionHChanged.next(position);
    }
    if (positionAbsoluteChanged) {
      this._positionHAbsoluteChanged.next(positionAbsolute);
    }
    if (stateChanged) {
      this._stateHChanged.next(state);
    }
  }

  private _setPositionAndStateV(position: ScrollPosition, positionAbsolute: ScrollPosition, state: ScrollState) {
    const positionChanged = position != this._positionV;
    const positionAbsoluteChanged = positionAbsolute != this._positionVAbsolute;
    const stateChanged = state != this._stateV;

    if (!positionChanged && !positionAbsoluteChanged && !stateChanged) {
      return;
    }

    this._positionV = position;
    this._positionVAbsolute = positionAbsolute;
    this._stateV = state;
    if (positionChanged) {
      this._positionVChanged.next(position);
    }
    if (positionAbsoluteChanged) {
      this._positionVAbsoluteChanged.next(positionAbsolute);
    }
    if (stateChanged) {
      this._stateVChanged.next(state);
    }
  }

  private _updateHiddentContentClasses() {
    const position = this._positionVAbsolute;

    const setClasses = (extremities: ScrollExtremity[] | null) => {
      this._hostElement.classList.remove(HOST_HIDDEN_CONTENT_START_CLASS, HOST_HIDDEN_CONTENT_END_CLASS);
      if (extremities != null)
        for (const c of extremities) {
          switch (c) {
            case 'start':
              this._hostElement.classList.add(HOST_HIDDEN_CONTENT_START_CLASS);
              break;

            case 'end':
              this._hostElement.classList.add(HOST_HIDDEN_CONTENT_END_CLASS);
              break;
          }
        }
    };

    switch (position) {
      case 'full':
        setClasses(null);
        break;

      case 'start':
        setClasses(['end']);
        break;

      case 'middle':
        setClasses(['start', 'end']);
        break;

      case 'end':
        setClasses(['start']);
        break;
    }
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
