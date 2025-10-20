import { SafeAreaView } from 'react-native-safe-area-context';
import { withUniwind } from 'uniwind';

/**
 * Uniwind resolves `className` automatically only on React Native's own components.
 * Third-party components have to opt in, so `SafeAreaView` gets wrapped once here and
 * every screen goes through `<Screen>`.
 */
export const ThemedSafeAreaView = withUniwind(SafeAreaView);
