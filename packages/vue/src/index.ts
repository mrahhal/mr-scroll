import { App } from 'vue';

import ScrollComponent from './scroll.vue';

(ScrollComponent as any).install = (app: App) => {
  app.component('mr-scroll', ScrollComponent);
};

export default ScrollComponent;
