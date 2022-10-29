import ScrollComponent from "./scroll.vue";

(ScrollComponent as any).install = (app: any) => {
  app.component("mr-scroll", ScrollComponent);
};

export default ScrollComponent;
