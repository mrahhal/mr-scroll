import ResizeObserver from 'resize-observer-polyfill';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

import { getScrollbarWidth, isScrollbarStylingSupported } from './support';

export type ScrollMode = 'scroll' | 'overlay' | 'hidden';
export type ScrollPosition = 'top' | 'middle' | 'bottom' | 'full';
export type ScrollState = 'hidden' | 'scrolling';

export interface ScrollConfig {
  mode: ScrollMode;
  showOnHover: boolean;
  scrolledDebounce: number;
  topThreshold: number;
  bottomThreshold: number;
}

const DEFAULT_CONFIG: ScrollConfig = {
  mode: 'overlay',
  showOnHover: false,
  scrolledDebounce: 500,
  topThreshold: 100,
  bottomThreshold: 50,
};

const HOST_CLASS = 'mr-scroll';
const CONTENT_CLASS = `${HOST_CLASS}_content`;
const BAR_CLASS = `${HOST_CLASS}_bar`;
const HOST_HIDDEN_CLASS = `${HOST_CLASS}--hidden`;

export class Scroll {
  private _config: ScrollConfig;
  private _barElement: HTMLElement;
  private _thumbElement: HTMLElement;
  private _mo: MutationObserver;
  private _ro: ResizeObserver;
  private _marginsProcessed = false;
  private _browserScrollWidth: number;
  private _position: ScrollPosition = 'top';
  private _state: ScrollState = 'hidden';
  private _scrollRatio = 0;
  private _prevScrollTop: number | null = null;

  private _boundUpdate = this.update.bind(this);

  private _scrolledOrigin = new Subject<number>();
  private _scrolled = new Subject<number>();
  private _scrolledRaw = new Subject<number>();
  private _topReached = new Subject<void>();
  private _bottomReached = new Subject<void>();
  private _positionChanged = new Subject<ScrollPosition>();
  private _stateChanged = new Subject<ScrollState>();

  constructor(
    private _hostElement: HTMLElement,
    private _contentElement: HTMLElement,
    config?: Partial<ScrollConfig>,
  ) {
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

    // Setup subjects
    this._scrolledOrigin.pipe(
      debounceTime(this._config.scrolledDebounce),
    ).subscribe(top => this._scrolled.next(top));
    this._scrolledOrigin.subscribe(top => this._scrolledRaw.next(top));

    this._positionChanged.subscribe((position: ScrollPosition) => {
      switch (position) {
        case 'top': this._topReached.next(); break;
        case 'bottom': this._bottomReached.next(); break;
      }
    });

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
  }

  get mode() { return this._config.mode; }

  get scrollTop() { return this._contentElement.scrollTop; }

  get scrolled() { return this._scrolled.asObservable(); }
  get scrolledRaw() { return this._scrolledRaw.asObservable(); }
  get topReached() { return this._topReached.asObservable(); }
  get bottomReached() { return this._bottomReached.asObservable(); }
  get positionChanged() { return this._positionChanged.asObservable(); }
  get stateChanged() { return this._stateChanged.asObservable(); }

  private get _ownHeight() { return this._contentElement.clientHeight; }

  private get _totalHeight() { return this._contentElement.scrollHeight; }

  initialize() {
    this._browserScrollWidth = this._resolveBrowserScrollbarWidth();
    const browserScrollWidth = this._browserScrollWidth;

    if (!browserScrollWidth) {
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

    this._scrolledOrigin.complete();
    this._scrolled.complete();
    this._scrolledRaw.complete();
    this._topReached.complete();
    this._bottomReached.complete();
    this._positionChanged.complete();
    this._stateChanged.complete();
  }

  update() {
    requestAnimationFrame(() => {
      const totalHeight = this._totalHeight;
      const ownHeight = this._ownHeight;

      this._scrollRatio = ownHeight / totalHeight;

      const scrollTop = this.scrollTop;
      const height = (this._scrollRatio) * 100;
      const top = (scrollTop / totalHeight) * 100;

      if (this._prevScrollTop == null || this._prevScrollTop != scrollTop) {
        this._scrolledOrigin.next(scrollTop);
        this._prevScrollTop = scrollTop;
      }

      let newState: ScrollState = 'scrolling';
      let newPosition: ScrollPosition = 'middle';

      if (this._scrollRatio >= 1) {
        this._hostElement.classList.add(HOST_HIDDEN_CLASS);
        newState = 'hidden';
        newPosition = 'full';
      } else {
        this._hostElement.classList.remove(HOST_HIDDEN_CLASS);

        const isTop = scrollTop < this._config.topThreshold;
        if (isTop) {
          newPosition = 'top';
        }

        if (!isTop) {
          const attainedHeight = scrollTop + ownHeight + this._config.bottomThreshold;
          if (attainedHeight > totalHeight) {
            newPosition = 'bottom';
          }
        }

        const cssText =
          `height:${height}%;` +
          `top:${top}%;`;

        this._thumbElement.style.cssText = cssText;
      }

      this._setPositionAndState(newPosition, newState);
    });
  }

  private _setPositionAndState(position: ScrollPosition, state: ScrollState) {
    const positionChanged = position != this._position;
    const stateChanged = state != this._state;

    if (!positionChanged && !stateChanged) {
      return;
    }

    if (stateChanged) {
      if (state == 'scrolling') {
        this._addMargins();
      }
    }

    this._position = position;
    this._state = state;
    if (positionChanged) {
      this._positionChanged.next(position);
    }
    if (stateChanged) {
      this._stateChanged.next(state);
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
