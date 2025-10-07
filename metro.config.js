const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Uniwind MUST be the outermost wrapper
module.exports = withUniwindConfig(config, {
  // Path to your global CSS file
  cssEntryFile: './global.css',
});