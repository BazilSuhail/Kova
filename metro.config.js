const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withUniwindConfig(config, {
  // Relative path to your global.css file
  cssEntryFile: './global.css',
  // (Optional) Path for auto-generated TypeScript types
  dtsFile: './uniwind-types.d.ts'
});