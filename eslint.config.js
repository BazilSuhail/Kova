// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    // `dist` is the export output and `.expo` holds generated route types and caches.
    ignores: ['dist/*', '.expo/*'],
  },
]);
