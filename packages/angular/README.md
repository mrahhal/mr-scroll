# @mr-scroll/angular

[![npm](https://img.shields.io/npm/v/@mr-scroll/angular.svg)](https://www.npmjs.com/package/@mr-scroll/angular)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The best custom scroll for the web.

This is the angular wrapper. [Check here](../..) (root of this repo) for an overview on mr-scroll.

## Install

```
npm i @mr-scroll/core @mr-scroll/angular
```

Note: If you're using [css-theming](https://github.com/mrahhal/css-theming), check the [css-theming support package](../css-theming).

## Usage

Import `ScrollModule` into your module.

[Example from sample here.](https://github.com/mrahhal/mr-scroll/blob/f2ca71702f9916f0b0a70b65e61a536506879bf3/samples/angular/src/app/app.module.ts#L13)

Import the CSS styles in `angular.json`, in projects>angular>architect>build>options>styles:
```json
"styles": [
  //...
  "node_modules/@mr-scroll/angular/styles.css"
]
```

[Example from sample here.](https://github.com/mrahhal/mr-scroll/blob/f2ca71702f9916f0b0a70b65e61a536506879bf3/samples/angular/angular.json#L35)

Use `mr-scroll` component:
```html
<mr-scroll>
  Content
</mr-scroll>
```

> For more general usage info check the [README](../..) in the root of this repo.

**NOTE:** The `scrolled` event is the only event that won't trigger change detection. This is by design as it's fired a lot. If you need change detection when you react to it, you can do this easily by using `NgZone`:
```ts
// Inject NgZone in your component
constructor(private _zone: NgZone) { }

_onScrolled() {
  _zone.Run(() => {
    // Handle the event
  });
}
```

## Release notes

### 0.1.0

Initial version.
