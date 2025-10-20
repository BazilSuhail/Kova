import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, type ComponentProps } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { Tabs } from 'expo-router';

import { selectFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';
import type { IconName } from '@/theme/icons';

/** The props React Navigation hands to a custom `tabBar`. */
type TabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

type TabConfig = {
  label: string;
  icon: IconName;
  iconActive: IconName;
};

/** Keyed by route name, so it works whether the file is `(home)` or a folder. */
const TABS: Record<string, TabConfig> = {
  '(home)': { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  tasks: { label: 'Tasks', icon: 'checkbox-outline', iconActive: 'checkbox' },
  plan: { label: 'Plan', icon: 'calendar-outline', iconActive: 'calendar' },
  insights: { label: 'Insights', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  profile: { label: 'Profile', icon: 'person-outline', iconActive: 'person' },
};

/**
 * Bottom bar for the tab shell.
 *
 * The active tab gets a scaling violet bubble. Each tab's screen stays mounted once
 * visited (React Navigation's default), so switching tabs never refetches.
 */
export function AppTabBar({ state, descriptors, navigation }: TabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [bubbles] = useState(() =>
    state.routes.map((_, index) => new Animated.Value(index === state.index ? 1 : 0)),
  );

  useEffect(() => {
    bubbles.forEach((bubble, index) => {
      Animated.spring(bubble, {
        toValue: index === state.index ? 1 : 0,
        useNativeDriver: true,
        tension: 140,
        friction: 9,
      }).start();
    });
  }, [bubbles, state.index]);

  const bottomInset = insets.bottom || 14;

  return (
    <View
      className="flex-row border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      style={{ height: 72 + bottomInset, paddingBottom: bottomInset }}>
      {state.routes.map((route, index) => {
        const config = TABS[route.name];
        if (!config) return null;

        const focused = state.index === index;
        const options = descriptors[route.key]?.options;
        const label = options?.title ?? config.label;

        function handlePress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!focused && !event.defaultPrevented) {
            selectFeedback();
            navigation.navigate(route.name, route.params);
          }
        }

        function handleLongPress() {
          navigation.emit({ type: 'tabLongPress', target: route.key });
        }

        return (
          <Pressable
            key={route.key}
            onPress={handlePress}
            onLongPress={handleLongPress}
            accessibilityRole="tab"
            accessibilityLabel={options?.tabBarAccessibilityLabel ?? label}
            accessibilityState={{ selected: focused }}
            className="flex-1 items-center justify-center active:opacity-70"
            style={{ gap: 4 }}>
            <Animated.View
              pointerEvents="none"
              style={{
                position: 'absolute',
                width: 66,
                height: 48,
                borderRadius: 26,
                backgroundColor: colors.primarySoft,
                transform: [{ scale: bubbles[index] }],
              }}
            />

            <Ionicons
              name={focused ? config.iconActive : config.icon}
              size={21}
              color={focused ? colors.primary : colors.textMuted}
            />

            <Text
              className={`text-xs font-semibold ${
                focused
                  ? 'text-violet-700 dark:text-violet-300'
                  : 'text-slate-500 dark:text-slate-400'
              }`}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
