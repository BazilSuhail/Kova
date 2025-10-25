const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// .svg files import as react-native-svg components (react-native-svg-transformer).
// Uniwind's worker transformer delegates to Expo's, which runs this babel transformer.
config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer/expo');
config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');
config.resolver.sourceExts = [...config.resolver.sourceExts, 'svg'];

module.exports = withUniwindConfig(config, {
  // Relative path to your global.css file
  cssEntryFile: './global.css',
  // (Optional) Path for auto-generated TypeScript types
  dtsFile: './uniwind-types.d.ts'
});
