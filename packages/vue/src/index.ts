import { App } from 'vue';

import ScrollComponent from './scroll.vue';

const install = (app: App) => {
  app.component(ScrollComponent.name, ScrollComponent);
};

(ScrollComponent as any).install = install;

export default ScrollComponent;
