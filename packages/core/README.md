# @mr-scroll/core

[![npm](https://img.shields.io/npm/v/@mr-scroll/core.svg)](https://www.npmjs.com/package/@mr-scroll/core)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The best custom scroll for the web.

This is the core package. [Check here](../..) for a general usage guide.

## Implementation

> NOTE: If you're using a framework we have a wrapper for then you don't need this. [Check here](../..) to see which ones we support.

@mr-scroll/core has the core logic to make a custom scrollbar.

We implement it by doing the following:
- Wrap it in a component (or something similar)
- Provide the compiled CSS styles that includes the SCSS from this package

Implementing @mr-scroll/core in a framework is simple. You'll use the `Scroll` class inside your component.

The `Scroll` constructor takes 3 arguments:
- Host element: The html element that will act as the host. Required.
- Content element: The html element that will contain the actual contents. Required.
- A config object

So this requires you to provide the host and content elements. As an example you could have this html template:
```html
<div> <!-- host element -->
  <div> <!-- content element -->
    CONTENT
  </div>
</div>
```

Use whatever is the idiomatic approach in your framework to do this.

In your wrapper component:
```ts
import { Scroll } from '@mr-scroll/core';

// Inside the wrapper

// You'll want to store the reference to the scroll
this.scroll = new Scroll(hostElement, contentElement, /* config */ { ... });

// Initialize whenever is the right time to do so in your framework
this.scroll.initialize();

// And don't forget to destroy it when your component is being destroyed
this.scroll.destroy();
```

Providing the compiled CSS is a matter of importing [scroll.scss](./src/scss/scroll.scss) in your own SCSS file, compiling it to CSS on build, and finally providing it in the final package.

Check our [angular wrapper](../angular) to see an example of all of this for Angular.

## Release notes

### 0.1.0

Initial version.
