import { Ionicons } from '@expo/vector-icons';
import { Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useThemeColors } from '@/config/theme';
import type { IconName } from '@/theme/icons';
import { Card } from './card';

export type StatTrend = 'up' | 'down' | 'flat';

type Props = {
  icon: IconName;
  value: string | number;
  label: string;
  /** Short change text, e.g. "+12%" or "3 more than last week". */
  delta?: string;
  /** Arrow + color for the delta. up = good (success), down = bad (danger), flat = muted. */
  trend?: StatTrend;
  onPress?: () => void;
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const TREND_ICON: Record<StatTrend, IconName> = {
  up: 'arrow-up',
  down: 'arrow-down',
  flat: 'remove',
};

export function StatTile({
  icon,
  value,
  label,
  delta,
  trend = 'flat',
  onPress,
  className,
  style,
}: Props) {
  const colors = useThemeColors();
  const deltaColor =
    trend === 'up' ? colors.success : trend === 'down' ? colors.danger : colors.muted;

  return (
    <Card onPress={onPress} className={`flex-1 ${className ?? ''}`} style={style}>
      <View className="h-8 w-8 items-center justify-center rounded-md bg-brand-soft">
        <Ionicons name={icon} size={16} color={colors.brandInk} />
      </View>
      <Text className="mt-3 text-2xl font-bold tracking-tight text-heading">{value}</Text>
      <Text numberOfLines={1} className="mt-0.5 text-xs text-muted">
        {label}
      </Text>
      {delta ? (
        <View className="mt-2 flex-row items-center" style={{ gap: 2 }}>
          <Ionicons name={TREND_ICON[trend]} size={12} color={deltaColor} />
          <Text className="text-xs font-medium" style={{ color: deltaColor }}>
            {delta}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}
