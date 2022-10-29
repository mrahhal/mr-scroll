<template>
  <div ref="hostRef">
    <div ref="contentRef">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Options, Prop, Ref } from "vue-property-decorator";
import { Scroll, ScrollMode } from "@mr-scroll/core";

@Options({})
export default class ScrollComponent extends Vue {
  private _scroll!: Scroll;

  @Prop() mode?: ScrollMode;
  @Prop() topThreshold?: number;
  @Prop() bottomThreshold?: number;
  @Prop() leftThreshold?: number;
  @Prop() rightThreshold?: number;
  @Prop() showOnHover?: boolean;

  @Ref("hostRef") readonly _hostRef!: HTMLDivElement;
  @Ref("contentRef") readonly _contentRef!: HTMLDivElement;

  get scroll() {
    return this._scroll;
  }

  mounted() {
    this._scroll = new Scroll(this._hostRef, this._contentRef, {
      mode: this.mode,
      topThreshold: this.topThreshold,
      bottomThreshold: this.bottomThreshold,
      leftThreshold: this.leftThreshold,
      rightThreshold: this.rightThreshold,
      showOnHover: this.showOnHover,
    });

    const delegatedEvents = [
      "scrolled",
      "topReached",
      "bottomReached",
      "leftReached",
      "rightReached",
      "positionHChanged",
      "positionAbsoluteHChanged",
      "stateHChanged",
      "positionVChanged",
      "positionAbsoluteVChanged",
      "stateVChanged",
    ];
    for (const eventName of delegatedEvents) {
      (this._scroll as any)[eventName].subscribe((x: any) => {
        this.$emit(eventName, x);
      });
    }

    this._scroll.initialize();
  }

  unmounted() {
    this._scroll.destroy();
  }
}
</script>
