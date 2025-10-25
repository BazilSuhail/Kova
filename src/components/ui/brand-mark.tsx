import { View, type StyleProp, type ViewStyle } from 'react-native';

import KovaLogo from '@/assets/kova.svg';

type Props = {
  size?: number;
  style?: StyleProp<ViewStyle>;
};

/**
 * Kova's brand mark, rendered from the single source of truth: assets/kova.svg.
 * The artwork includes its own forest background, so it reads on light and dark surfaces.
 */
export function BrandMark({ size = 48, style }: Props) {
  return (
    <View
      style={[{ width: size, height: size, borderRadius: size * 0.3, overflow: 'hidden' }, style]}
      accessibilityRole="image"
      accessibilityLabel="Kova logo"
    >
      <KovaLogo width={size} height={size} />
    </View>
  );
}
