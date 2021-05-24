<template>
  <div class="app">
    <div class="general-example">
      <mr-scroll>
        <div
          v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
          :key="item"
          class="general-item"
        >
          Item {{ item }}
        </div>
      </mr-scroll>
    </div>
    <div class="general-example">
      <mr-scroll mode="overlay">
        <div
          v-for="item in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
          :key="item"
          class="general-item"
        >
          Item {{ item }}
        </div>
      </mr-scroll>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import Scroll from "@mr-scroll/vue";

@Options({
  components: {
    "mr-scroll": Scroll,
  },
})
export default class App extends Vue {}
</script>

<style src='@mr-scroll/core/dist/styles.css'></style>

<style>
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.app {
  margin: 10px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 30px;
}

.general-example > .mr-scroll {
  height: 200px;
  border: 1px solid #aaa;
  border-radius: 2px;
}

.general-item {
  padding: 10px;
}
</style>
