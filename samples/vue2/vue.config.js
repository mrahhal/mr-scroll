// Referencing a local lib causes vue to be loaded twice. This is required to force it to load once.
// https://github.com/vuejs/vue-cli/issues/4271

const path = require('path');

module.exports = {
  configureWebpack: {
    resolve: {
      alias: {
        vue$: path.resolve('./node_modules/vue/dist/vue.runtime.esm.js'),
      },
    },
  },
};
