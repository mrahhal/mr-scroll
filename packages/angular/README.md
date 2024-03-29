# @mr-scroll/angular

[![npm](https://img.shields.io/npm/v/@mr-scroll/angular.svg)](https://www.npmjs.com/package/@mr-scroll/angular)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The best custom scroll for the web.

This is the angular wrapper. [Check here](../../README.md) (root of this repo) for an overview on mr-scroll.

## Install

```
npm i @mr-scroll/core @mr-scroll/angular
```

Angular 10 and above is supported.

Note: If you're using [css-theming](https://github.com/mrahhal/css-theming), check the [css-theming support package](../css-theming).

## Usage

Import the global CSS styles in your `angular.json`, in projects>angular>architect>build>options>styles:

```json
"styles": [
  "node_modules/@mr-scroll/core/dist/styles.css",
  //...
]
```

[Example from sample here.](https://github.com/mrahhal/mr-scroll/blob/0780d36414c7032a5853daa53ec390cc9427537c/samples/angular/angular.json#L34)

Import `ScrollModule` into your module.

[Example from sample here.](https://github.com/mrahhal/mr-scroll/blob/0780d36414c7032a5853daa53ec390cc9427537c/samples/angular/src/app/app.module.ts#L19)

Use `mr-scroll` component:

```html
<mr-scroll> Content </mr-scroll>
```

> For more general usage info check the [README](../../README.md) in the root of this repo.

**NOTE:** The `scrolled` event is the only event that won't trigger change detection. This is by design as it's fired a lot. If you need change detection when you react to it, you can do this easily by using `NgZone`:

```ts
// Inject NgZone in your component.
constructor(private _zone: NgZone) { }

_onScrolled() {
  _zone.Run(() => {
    // Handle the event.
  });
}
```
