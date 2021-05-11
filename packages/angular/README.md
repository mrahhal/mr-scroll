# @mr-scroll/angular

[![npm](https://img.shields.io/npm/v/@mr-scroll/angular.svg)](https://www.npmjs.com/package/@mr-scroll/angular)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The best custom scroll for the web.

This is the angular wrapper.

## Install

```
npm i @mr-scroll/angular
```

## Usage

Import `ScrollModule` into your module.

[Example from sample here.](https://github.com/mrahhal/mr-scroll/blob/f2ca71702f9916f0b0a70b65e61a536506879bf3/samples/angular/src/app/app.module.ts#L13)

Import the css styles in `angular.json`, in projects>angular>architect>build>options>styles:
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

## Release notes

### 0.1.0

Initial version.
