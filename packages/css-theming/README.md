# @mr-scroll/css-theming

[![npm](https://img.shields.io/npm/v/@mr-scroll/css-theming.svg)](https://www.npmjs.com/package/@mr-scroll/css-theming)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The best custom scroll for the web.

This is the [css-theming](https://github.com/mrahhal/css-theming) support package. [Check here](../../README.md) (root of this repo) for an overview on mr-scroll.

This package styles the scroll (thumb, etc) according to the active theme when using [css-theming](https://github.com/mrahhal/css-theming).

## Install

Assuming we're using angular (if not, install the respective wrapper package instead of @mr-scroll/angular):
```
npm i @mr-scroll/core @mr-scroll/angular @mr-scroll/css-theming
```

## Usage

You only need to import the SCSS file that this package includes in your global SCSS file, and call the mixin it provides:
```scss
// For example, in styles.scss

// From css-theming
@import 'css-theming/src/scss/css-theming';
// From @mr-scroll/css-theming
@import '@mr-scroll/css-theming/src/scss/css-theming';

// You can optionally provide values here.
@include msct-apply();
```

If you're using the SCSS module system instead:
```scss
// For example, in styles.scss

// From css-theming
@use 'css-theming/src/scss/css-theming';
// From @mr-scroll/css-theming
@use '@mr-scroll/css-theming/src/scss/css-theming' as msct;

// You can optionally provide values here.
@include msct.apply();
```

[Example from sample here.](https://github.com/mrahhal/mr-scroll/blob/0780d36414c7032a5853daa53ec390cc9427537c/samples/angular/src/styles.scss#L3-L7)

That's it. If you have css-theming set up properly, you'll see that the scroll's thumb changes colors as the user switches between light and dark themes.
