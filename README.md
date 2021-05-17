# mr-scroll

The best custom scroll for the web.

## Features

- Custom and easy to style scrollbar
- Uses the native browser scrollbar behind the scenes -> smooth scrolling, middle mouse click drag works, follows the behavior you're used to
- Behaves exactly like a native scrollbar (auto detects content size changes, so it's always visually in sync unlike most other custom scrollbars)
- Different modes and features: normal, overlay, hidden, show on hover, etc
- Emits various useful events you can handle (scrolled, state changed, position changed, top reached, bottom reached, etc)
  - Great for implementing infinite paging
- Hidden content fade (shows a fading effect to indicate there's hidden content out of view)
- Works exactly the same across supported browsers
- Supports mobile browsers

And finally, we have efficient idiomatic wrapper packages for popular frameworks (as of now: angular).

## Demo

[TODO]

## Packages

- [@mr-scroll/core](./packages/core): The core package. This does the heavy lifting.
- [@mr-scroll/angular](./packages/angular): The wrapper package for Angular.

Can't find your framework? This means we don't have a wrapper for it just yet. Feel free to suggest/contribute one.

### Support packages

We also have support packages:

- [@mr-scroll/css-theming](./packages/css-theming): A support package for styling the scrollbar according to the active theme when using [css-theming](https://github.com/mrahhal/css-theming).

## Samples

Samples show you how to use mr-scroll in frameworks.

- [Angular](./samples/angular)
