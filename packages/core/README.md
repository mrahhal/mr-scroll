# @mr-scroll/core

[![npm](https://img.shields.io/npm/v/@mr-scroll/core.svg)](https://www.npmjs.com/package/@mr-scroll/core)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The best custom scroll for the web.

This is the core package. [Check here](../../README.md) for a general usage guide.

## Implementation

> NOTE: If you're using a framework we have a wrapper for then you don't need this. [Check here](../../README.md#packages) to see which ones we support.

@mr-scroll/core has the core logic to make an mr-scroll custom scrollbar.

Implementing @mr-scroll/core in a framework is simple. You'll wrap the `Scroll` class inside a component (or something similar).

The `Scroll` constructor takes 3 arguments:
- Host element: The html element that will act as the host. Required.
- Content element: The html element that will contain the actual contents. Required.
- A config object

So this requires you to provide the host and content elements. Usually, you'll have this html template:
```html
<div> <!-- host element -->
  <div> <!-- content element -->
    CONTENT <!-- transcluded content -->
  </div>
</div>
```

Use whatever is the idiomatic approach in your framework to do this.

And then in your wrapper component:
```ts
import { Scroll } from '@mr-scroll/core';

// Inside the wrapper

// You'll want to store the reference to the scroll
this.scroll = new Scroll(hostElement, contentElement, /* config: fill from your inputs */ { ... });

// Delegate events in a way that makes sense in your framework.
// For example, in angular, we add EventEmitters that delegate the inner events of Scroll.

// Initialize whenever is the right time to do so in your framework
this.scroll.initialize();

// And don't forget to destroy it when your component is being destroyed
this.scroll.destroy();
```

This package also provides the main CSS styles to be imported in your app. You can find the bundled styles at "@mr-scroll/core/dist/styles.css".

Check our [angular wrapper](../angular) for an implementation example of all of this for Angular.
