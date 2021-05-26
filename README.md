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

## Config

> Check the respective wrapper package and samples for an example usage.

| Name | Type | Default | Description |
|------|------|---------|-------------|
| mode | 'auto' \| 'overlay' \| 'hidden' | 'auto' | The mode that the scroll will adapt. |
| topThreshold | number | 50 | The top threshold in px. Affects when the topReached event is raised. |
| bottomThreshold | number | 50 | The bottom threshold in px. Affects when the bottomReached event is raised. |
| leftThreshold | number | 50 | The left threshold in px. Affects when the leftReached event is raised. |
| rightThreshold | number | 50 | The right threshold in px. Affects when the rightReached event is raised. |
| showOnHover | boolean | false | Respresents whether or not to show the scrollbar only on hover. |

## Events

> Check the respective wrapper package or sample for an example usage.

| Name | Event data | Description |
|------|------------|-------------|
| scrolled | { left: number; top: number } | Raised whenever the scrollbar is scrolled. |
| topReached | N/A | Raised when the top is reached, taken into account the topThreshold config. |
| bottomReached | N/A | Raised when the bottom is reached, taken into account the bottomThreshold config. |
| leftReached | N/A | Raised when the left is reached, taken into account the leftThreshold config. |
| rightReached | N/A | Raised when the right is reached, taken into account the rightThreshold config. |
| positionHChanged | 'start' \| 'middle' \| 'end' \| 'full' | Raised when the horizontal position is changed. |
| positionAbsoluteHChanged | 'start' \| 'middle' \| 'end' \| 'full' | Raised when the horizontal position is changed without taking thresholds into account. |
| stateHChanged | 'hidden' \| 'scrolling' | Raised when the horizontal state is changed. |
| positionVChanged | 'start' \| 'middle' \| 'end' \| 'full' | Raised when the vertical position is changed. |
| positionAbsoluteVChanged | 'start' \| 'middle' \| 'end' \| 'full' | Raised when the vertical position is changed without taking thresholds into account. |
| stateVChanged | 'hidden' \| 'scrolling' | Raised when the vertical state is changed. |

## Mixins

Defined [here](./packages/core/src/scss/_mixins.scss).

The [@mr-scroll/core](./packages/core) package provides several helper mixins in SCSS. You'll always `@include` the mixins in the direct parent of an mr-scroll.

To use them, you'll import the pure file and include any mixin you want:
```scss
@import '~@mr-scroll/core/src/scss/pure';

.foo {
  @include msc-[mixin name](...);
}
```

If you're using the SCSS module system:
```scss
@use '~@mr-scroll/core/src/scss/pure' as msc;

.foo {
  @include msc.[mixin name](...);
}
```

As an example, using the height mixin:
```scss
@use '~@mr-scroll/core/src/scss/pure' as msc;

.my-scroll-parent {
  @include msc.height(200px);
}
```

## Styling

To style mr-scroll in our whole app we can set some global CSS variables. But keep in mind that this sets the styles for all scrolls in the whole hierarchy.

Sometimes you want to override a certain style just for one scroll without affecting the others. For that, you can use any of the `override-*` mixins in that mr-scroll's direct parent:

| Name | Description |
|------|-------------|
| override-thumb-border-radius | Overrides the thumb border radius. |
| override-hidden-content-fade-size | Overrides the hidden content fade size. |

## General usage

Generally, we want to control our scroll in only 3 different ways: fixed height, max height, or fully adaptive. Here is how to do each.

- Fixed height: You'll use the `height` mixin on the direct parent for mr-scroll (or simply just set a `height: ...px;` on an .mr-scroll).

- Max height: You'll use the `max-height` mixin on the direct parent for mr-scroll (or simply just set a `max-height: ...px;` on an .mr-scroll).

- Adaptive: This is a bit harder to implement when you have a complex layout, but it's still easy. In complex layouts, flexible design doesn't always work well with scrolls. The trick is to use the `flex-adaptive-container` mixin we provide on parents, all the way up to the root container (or a fixed/absolute container). This will lead to a fully working adaptive layout. For an example of this, check the the full-page page in the angular sample.

## Samples

Samples contain working examples of how to use mr-scroll.

- [Angular](./samples/angular)
- [React](./samples/react)
- [Vue 2](./samples/vue2)
- [Vue 3](./samples/vue)

---

[![CCSS](https://img.shields.io/badge/follows-CCSS-cc00ff.svg)](https://github.com/mrahhal/CCSS)

This project follows [CCSS](https://github.com/mrahhal/CCSS) for CSS naming conventions.
