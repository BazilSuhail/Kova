import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type {
  Descriptor,
  NavigationHelpers,
  ParamListBase,
  RouteProp,
  TabNavigationState,
} from 'expo-router/react-navigation';
import type {
  MaterialTopTabNavigationEventMap,
  MaterialTopTabNavigationOptions,
  MaterialTopTabNavigationProp,
} from 'expo-router/js-top-tabs';

import { spacing, useThemeColors } from '@/config/theme';
import { selectFeedback } from '@/lib/haptics';
import type { IconName } from '@/theme/icons';

export type AppTabBarProps = {
  state: TabNavigationState<ParamListBase>;
  navigation: NavigationHelpers<ParamListBase, MaterialTopTabNavigationEventMap>;
  descriptors: Record<
    string,
    Descriptor<
      MaterialTopTabNavigationOptions,
      MaterialTopTabNavigationProp<ParamListBase>,
      RouteProp<ParamListBase>
    >
  >;
};

type TabConfig = {
  label: string;
  icon: IconName;
  iconActive: IconName;
};

const TABS: Record<string, TabConfig> = {
  '(home)': { label: 'Home', icon: 'home-outline', iconActive: 'home' },
  tasks: { label: 'Tasks', icon: 'checkbox-outline', iconActive: 'checkbox' },
  plan: { label: 'Plan', icon: 'calendar-outline', iconActive: 'calendar' },
  insights: { label: 'Insights', icon: 'stats-chart-outline', iconActive: 'stats-chart' },
  profile: { label: 'Profile', icon: 'person-outline', iconActive: 'person' },
};

function useKeyboardVisible() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setVisible(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setVisible(false));

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return visible;
}

export function AppTabBar({ state, descriptors, navigation }: AppTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const keyboardVisible = useKeyboardVisible();

  if (keyboardVisible) return null;

  const bottomInset = insets.bottom || spacing.sm;

  return (
    <View
      className="flex-row border-border"
      style={{
        height: 52 + bottomInset,
        borderTopWidth: StyleSheet.hairlineWidth,
        paddingTop: 4,
        paddingBottom: bottomInset,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        backgroundColor: colors.navBackground,
      }}
    >
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

          if (!focused) selectFeedback();
          if (!event.defaultPrevented) {
            navigation.navigate(route.name, { screen: 'index' });
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
            className="flex-1 items-center justify-center active:opacity-60"
            style={{ gap: 3 }}
          >
            <Ionicons
              name={focused ? config.iconActive : config.icon}
              size={24}
              color={focused ? colors.navActive : colors.navMuted}
            />

            {/* Fixed-height bar: cap scaling so labels don't clip. */}
            <Text
              maxFontSizeMultiplier={1.3}
              numberOfLines={1}
              className={`text-[11px] ${focused ? 'font-semibold text-nav-active' : 'font-medium text-nav-muted'}`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
