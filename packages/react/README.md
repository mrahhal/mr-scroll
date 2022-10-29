# @mr-scroll/angular

[![npm](https://img.shields.io/npm/v/@mr-scroll/react.svg)](https://www.npmjs.com/package/@mr-scroll/react)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The best custom scroll for the web.

This is the react wrapper. [Check here](../../README.md) (root of this repo) for an overview on mr-scroll.

## Install

```
npm i @mr-scroll/core @mr-scroll/react
```

React 16 and above is supported.

Note: If you're using [css-theming](https://github.com/mrahhal/css-theming), check the [css-theming support package](../css-theming).

## Usage

Import the global CSS styles (for example in App.css):

```css
@import "@mr-scroll/core/dist/styles.css";
```

```tsx
import React, { Component } from "react";
import Scroll from "@mr-scroll/react";

class Example extends Component {
  render() {
    return <Scroll>Content</Scroll>;
  }
}
```

> For more general usage info check the [README](../../README.md) in the root of this repo.
