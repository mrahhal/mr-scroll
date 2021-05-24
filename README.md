# mr-scroll

[![CI](https://github.com/mrahhal/mr-scroll/actions/workflows/ci.yml/badge.svg)](https://github.com/mrahhal/mr-scroll/actions/workflows/ci.yml)

The best custom scroll for the web.

[Live demo here.](https://mr-scroll-demo.mrahhal.net)

## Features

- Custom and easy to style scrollbar
- Uses the native browser scrollbar behind the scenes -> smooth scrolling, middle mouse click drag works, follows the behavior you're used to
- Behaves exactly like a native scrollbar (detects content size changes, so it's always visually in sync unlike every other custom scrollbar)
- Different modes: scroll, auto, overlay, hidden
- Show on hover
- Hidden content fade (shows a fading effect to indicate there's hidden content out of view)
- Emits various useful events you can handle (scrolled, state changed, position changed, top/bottom reached with configurable thresholds, etc)
  - Great for implementing infinite paging
- Works exactly the same across supported browsers
- Supports mobile browsers

And finally, we have efficient idiomatic wrapper packages for popular frameworks (angular, react, vue2, vue3).

## Packages

- [@mr-scroll/core](./packages/core): The core package. This does the heavy lifting.
- [@mr-scroll/angular](./packages/angular): The wrapper package for Angular.
- [@mr-scroll/react](./packages/react): The wrapper package for React.
- [@mr-scroll/vue2](./packages/vue2): The wrapper package for Vue 2.
- [@mr-scroll/vue](./packages/vue): The wrapper package for Vue 3.

Can't find your framework? This means we don't have a wrapper for it just yet. Feel free to suggest/contribute one.

### Support packages

We also have support packages:

- [@mr-scroll/css-theming](./packages/css-theming): A support package for styling the scrollbar according to the active theme when using [css-theming](https://github.com/mrahhal/css-theming).

All packages in the @mr-scroll org here: https://www.npmjs.com/org/mr-scroll

## Samples

Samples contain working examples of how to use mr-scroll.

- [Angular](./samples/angular)

---

[![CCSS](https://img.shields.io/badge/follows-CCSS-cc00ff.svg)](https://github.com/mrahhal/CCSS)

This project follows [CCSS](https://github.com/mrahhal/CCSS) for CSS naming conventions.
