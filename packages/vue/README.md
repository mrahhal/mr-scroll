# @mr-scroll/vue

[![npm](https://img.shields.io/npm/v/@mr-scroll/react.svg)](https://www.npmjs.com/package/@mr-scroll/react)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)

The best custom scroll for the web.

This is the vue wrapper. [Check here](../../README.md) (root of this repo) for an overview on mr-scroll.

## Install

```
npm i @mr-scroll/core @mr-scroll/vue
```

Note: If you're using [css-theming](https://github.com/mrahhal/css-theming), check the [css-theming support package](../css-theming).

## Usage

Register as a global component:
```js
import { createApp } from 'vue';
import Scroll from '@mr-scroll/vue';

const app = createApp(..options);
app.use(Scroll);
```

Register as a local component:
```js
import Scroll from '@mr-scroll/vue';

export default {
  name: 'MyComponent',
  components: {
    'mr-scroll': Scroll,
  },
};
```

Import the global CSS styles (for example in your App.vue):
```vue
<style src='@mr-scroll/core/dist/styles.css'></style>
```

Use `mr-scroll` component:
```html
<mr-scroll>
  Content
</mr-scroll>
```

> For more general usage info check the [README](../../README.md) in the root of this repo.
