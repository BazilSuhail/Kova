import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

import { Icon } from '@/components/ui/icon';
import { chartColors, spacing, useThemeColors } from '@/config/theme';

const RULES = [
  { label: '8+ characters', test: (value: string) => value.length >= 8 },
  { label: 'A number', test: (value: string) => /\d/.test(value) },
  { label: 'A letter', test: (value: string) => /\p{L}/u.test(value) },
];

const LEVELS = [
  { label: 'Too weak', color: chartColors[4] },
  { label: 'Weak', color: chartColors[4] },
  { label: 'Okay', color: chartColors[2] },
  { label: 'Strong', color: chartColors[0] },
];

function Segment({ filled, color, empty }: { filled: boolean; color: string; empty: string }) {
  const style = useAnimatedStyle(() => ({
    backgroundColor: withTiming(filled ? color : empty, { duration: 200 }),
  }));
  return <Animated.View style={[{ flex: 1, height: 4, borderRadius: 2 }, style]} />;
}

/** Advisory strength meter. Only the length rule is enforced (newPasswordSchema). */
export function PasswordStrength({ password }: { password: string }) {
  const colors = useThemeColors();
  const passed = RULES.map((rule) => rule.test(password));
  const score = passed.filter(Boolean).length;
  const level = LEVELS[score];

  return (
    <View className="-mt-2 mb-4" accessibilityLabel={`Password strength: ${level.label}`}>
      <View className="flex-row items-center" style={{ gap: spacing.xs }}>
        {RULES.map((rule, index) => (
          <Segment key={rule.label} filled={index < score} color={level.color} empty={colors.border} />
        ))}
        <Text className="ml-2 text-xs font-medium text-muted" style={{ minWidth: 56 }}>
          {password ? level.label : ''}
        </Text>
      </View>
      <View className="mt-2 flex-row flex-wrap" style={{ columnGap: spacing.lg, rowGap: spacing.xs }}>
        {RULES.map((rule, index) => (
          <View key={rule.label} className="flex-row items-center" style={{ gap: 4 }}>
            <Icon
              name={passed[index] ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              tone={passed[index] ? 'success' : undefined}
              color={passed[index] ? undefined : colors.muted}
            />
            <Text className={`text-xs ${passed[index] ? 'text-body' : 'text-muted'}`}>
              {rule.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
