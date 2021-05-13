import ResizeObserver from 'resize-observer-polyfill';
import { Subject } from 'rxjs';

import { getScrollbarWidth, isScrollbarStylingSupported } from './support';

export type ScrollMode = 'scroll' | 'overlay' | 'hidden';
export type ScrollPosition = 'top' | 'middle' | 'bottom' | 'full';
export type ScrollState = 'hidden' | 'scrolling';

export interface ScrollConfig {
  mode: ScrollMode;
  topThreshold: number;
  bottomThreshold: number;
  showOnHover: boolean;
  showHiddenContentIndicator: boolean;
}

const DEFAULT_CONFIG: ScrollConfig = {
  mode: 'overlay',
  topThreshold: 50,
  bottomThreshold: 50,
  showOnHover: false,
  showHiddenContentIndicator: false,
};

const HOST_CLASS = 'mr-scroll';
const HOST_HIDDEN_CLASS = `${HOST_CLASS}--hidden`;
const HOST_SHOW_HIDDEN_CONTENT_INDICATOR_CLASS = `${HOST_CLASS}--show-hidden-content-indicator`;
const HOST_HIDDEN_CONTENT_START_CLASS = `${HOST_CLASS}--hidden-content-start`;
const HOST_HIDDEN_CONTENT_END_CLASS = `${HOST_CLASS}--hidden-content-end`;
const CONTENT_CLASS = `${HOST_CLASS}_content`;
const BAR_CLASS = `${HOST_CLASS}_bar`;

export class Scroll {
  private _config: ScrollConfig;
  private _barElement: HTMLElement;
  private _thumbElement: HTMLElement;
  private _mo: MutationObserver = null!;
  private _ro: ResizeObserver = null!;
  private _marginsProcessed = false;
  private _browserScrollWidth: number;
  private _position: ScrollPosition = 'top';
  private _positionAbsolute: ScrollPosition = 'top'; // Position without thresholds
  private _state: ScrollState = 'hidden';
  private _scrollRatio = 0;
  private _scrollTop: number | null = null;

  private _boundUpdate = this.update.bind(this);

  private _scrolled = new Subject<number>();
  private _topReached = new Subject<void>();
  private _bottomReached = new Subject<void>();
  private _positionChanged = new Subject<ScrollPosition>();
  private _positionAbsoluteChanged = new Subject<ScrollPosition>();
  private _stateChanged = new Subject<ScrollState>();

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

    if (config.mode == 'scroll' && !isScrollbarStylingSupported()) {
      // We can't support 'scroll' mode if scrollbar styling isn't supported by the browser
      config.mode = 'overlay';
      _contentElement.classList.add(`${CONTENT_CLASS}--overlay-fallback`);
    }

    this._hostElement.classList.add(`${HOST_CLASS}--mode-` + config.mode);

    this._browserScrollWidth = this._resolveBrowserScrollbarWidth();

    // mr-scroll_bar
    const barElement = this._barElement = _hostElement.appendChild(document.createElement('div'));
    barElement.classList.add(`${BAR_CLASS}`);
    const trackElement = barElement.appendChild(document.createElement('div'));
    trackElement.classList.add(`${BAR_CLASS}-track`);
    const thumbElement = this._thumbElement = barElement.appendChild(document.createElement('div'));
    thumbElement.classList.add(`${BAR_CLASS}-thumb`);
  }

  get mode() { return this._config.mode; }

  get scrollTop() { return this._scrollTop; }

  get position() { return this._position; }

  get state() { return this._state; }

  get scrolled() { return this._scrolled.asObservable(); }
  get topReached() { return this._topReached.asObservable(); }
  get bottomReached() { return this._bottomReached.asObservable(); }
  get positionChanged() { return this._positionChanged.asObservable(); }
  get positionAbsoluteChanged() { return this._positionAbsoluteChanged.asObservable(); }
  get stateChanged() { return this._stateChanged.asObservable(); }

  private get _ownHeight() { return this._contentElement.clientHeight; }

  private get _totalHeight() { return this._contentElement.scrollHeight; }

  initialize() {
    // Setup subjects
    this.positionChanged.subscribe((position: ScrollPosition) => {
      switch (position) {
        case 'top': this._topReached.next(); break;
        case 'bottom': this._bottomReached.next(); break;
      }
    });

    if (this._config.showHiddenContentIndicator) {
      this._hostElement.classList.add(HOST_SHOW_HIDDEN_CONTENT_INDICATOR_CLASS);

      this.positionAbsoluteChanged.subscribe(() => {
        this._updateHiddentContentClasses();
      });
      this._updateHiddentContentClasses();
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
    const effectiveScrollbarWidth = this._resolveScrollbarWidth();
    this._setCssProperty('--mr-scroll-width', `${effectiveScrollbarWidth}px`);
    this._setCssProperty('--mr-scroll-browser-scroll-width', `${this._browserScrollWidth}px`);

    if (!this._browserScrollWidth) {
      this._hostElement.classList.add(`${HOST_CLASS}--width-0`);
    }

    this._contentElement.addEventListener('scroll', this._boundUpdate);
    this._contentElement.addEventListener('mouseenter', this._boundUpdate);
    window.addEventListener('resize', this._boundUpdate);

    const css = getComputedStyle(this._contentElement);
    if (css.height === '0px' && css.maxHeight !== '0px') {
      this._hostElement.style.height = css.maxHeight;
    }

    this.update();
  }

  destroy() {
    this._contentElement.removeEventListener('scroll', this._boundUpdate);
    this._contentElement.removeEventListener('mouseenter', this._boundUpdate);
    window.removeEventListener('resize', this._boundUpdate);
    this._mo.disconnect();
    this._ro.disconnect();

    this._scrolled.complete();
    this._topReached.complete();
    this._bottomReached.complete();
    this._positionChanged.complete();
    this._positionAbsoluteChanged.complete();
    this._stateChanged.complete();
  }

  update() {
    requestAnimationFrame(() => {
      const totalHeight = this._totalHeight;
      const ownHeight = this._ownHeight;

      this._scrollRatio = ownHeight / totalHeight;

      const scrollTop = this._contentElement.scrollTop;
      const height = (this._scrollRatio) * 100;
      const top = (scrollTop / totalHeight) * 100;

      if (this._scrollTop == null || this._scrollTop != scrollTop) {
        this._scrollTop = scrollTop;
      }

      const computePosition = (topThreshold: number, bottomThreshold: number) => {
        let p: ScrollPosition = 'middle';
        if (this._scrollRatio >= 1) {
          p = 'full';
        } else {
          const isTop = scrollTop <= topThreshold;
          if (isTop) {
            p = 'top';
          }

          if (!isTop) {
            const attainedHeight = scrollTop + ownHeight + bottomThreshold;
            if (attainedHeight >= totalHeight) {
              p = 'bottom';
            }
          }
        }

        return p;
      };

      const newPosition = computePosition(this._config.topThreshold, this._config.bottomThreshold);
      const newPositionAbsolute = computePosition(0, 0);
      const newState: ScrollState = newPosition == 'full' ? 'hidden' : 'scrolling';

      if (newPosition == 'full') {
        this._hostElement.classList.add(HOST_HIDDEN_CLASS);
      } else {
        const cssText =
          `height:${height}%;` +
          `top:${top}%;`;

        this._thumbElement.style.cssText = cssText;
      }

      this._setPositionAndState(newPosition, newPositionAbsolute, newState);
      this._scrolled.next(scrollTop);
    });
  }

  private _setPositionAndState(position: ScrollPosition, positionAbsolute: ScrollPosition, state: ScrollState) {
    const positionChanged = position != this._position;
    const positionAbsoluteChanged = positionAbsolute != this._positionAbsolute;
    const stateChanged = state != this._state;

    if (!positionChanged && !positionAbsoluteChanged && !stateChanged) {
      return;
    }

    if (stateChanged) {
      if (state == 'scrolling') {
        this._addMargins();
      }
    }

    this._position = position;
    this._positionAbsolute = positionAbsolute;
    this._state = state;
    if (positionChanged) {
      this._positionChanged.next(position);
    }
    if (positionAbsoluteChanged) {
      this._positionAbsoluteChanged.next(positionAbsolute);
    }
    if (stateChanged) {
      this._stateChanged.next(state);
    }
  }

  private _updateHiddentContentClasses() {
    const position = this._positionAbsolute;

    const setClasses = (classes: ('start' | 'end')[] | null) => {
      this._hostElement.classList.remove(HOST_HIDDEN_CONTENT_START_CLASS, HOST_HIDDEN_CONTENT_END_CLASS);
      if (classes != null)
        for (const c of classes) {
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

      case 'top':
        setClasses(['end']);
        break;

      case 'middle':
        setClasses(['start', 'end']);
        break;

      case 'bottom':
        setClasses(['start']);
        break;
    }
  }

  private _addMargins() {
    if (this._marginsProcessed) return;
    if (this.mode == 'hidden' || this.mode == 'overlay') {
      this._forceScroll();
      this._marginsProcessed = true;
      const browserScrollWidth = this._browserScrollWidth;
      this._hostElement.style.marginRight = `-${browserScrollWidth}px`;
      this._barElement.style.marginRight = `${browserScrollWidth}px`;
    }
  }

  private _forceScroll() {
    this._hostElement.classList.add(`${HOST_CLASS}--force-scroll`);
  }

  private _getCssProperty(name: string) {
    return getComputedStyle(this._hostElement).getPropertyValue(name);
  }

  private _setCssProperty(name: string, value: string) {
    this._hostElement.style.setProperty(name, value);
  }

  private _resolveScrollbarWidth(mode = this.mode) {
    const widthRaw = this._getCssProperty(`--mr-scroll-width-${mode}`).trim();
    if (!widthRaw) {
      return null;
    }
    return parseInt(widthRaw.substring(0, widthRaw.length - 2));
  }

  private _resolveBrowserScrollbarWidth() {
    if (isScrollbarStylingSupported()) {
      return this._resolveScrollbarWidth('scroll') as number;
    } else {
      return getScrollbarWidth();
    }
  }
}
