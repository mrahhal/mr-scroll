let _computed = false;
let _scrollbarWidth: number;
let _scrollbarStylingSupported: boolean;

/**
 * Computes the browser's native scrollbar width.
 */
function computeScrollbarWidth() {
  const test = document.createElement('div');
  test.style.width = '100px';
  test.style.height = '100px';
  test.style.overflow = 'scroll';
  test.style.position = 'absolute';
  test.style.top = '-9999px';

  document.body.appendChild(test);
  const scrollbarWidth = test.offsetWidth - test.clientWidth;
  document.body.removeChild(test);

  return scrollbarWidth;
}

/**
 * Computes whether or not scrollbar styling is supported.
 */
function computeScrollbarStylingSupported() {
  const test = document.createElement('div');
  test.className = '__mr-sb-styling-test';
  test.style.overflow = 'scroll';
  test.style.width = '40px';

  const style = document.createElement('style');
  style.innerHTML = '.__mr-sb-styling-test::-webkit-scrollbar { width: 0px; }';

  // Apply
  document.body.appendChild(test);
  document.body.appendChild(style);

  // If css scrollbar is supported, than the scrollWidth should not be impacted
  const supported = test.scrollWidth == 40;

  // Cleaning
  document.body.removeChild(test);
  document.body.removeChild(style);

  return supported;
}

function ensureComputed() {
  if (_computed) {
    return;
  }
  _computed = true;

  _scrollbarWidth = computeScrollbarWidth();
  _scrollbarStylingSupported = computeScrollbarStylingSupported();
}

/**
 * @returns the browser's native scrollbar width.
 */
export function getScrollbarWidth() {
  ensureComputed();
  return _scrollbarWidth;
}

/**
 * @returns whether or not scrollbar styling is supported.
 */
export function isScrollbarStylingSupported() {
  ensureComputed();
  return _scrollbarStylingSupported;
}
