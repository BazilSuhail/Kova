import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Animated, Keyboard, Pressable, Text, View } from 'react-native';
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

const SLOT_WIDTH = 58;
const SLOT_HEIGHT = 34;

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

  if (keyboardVisible) return null;

  const bottomInset = insets.bottom || spacing.sm;

  return (
    <View
      className="flex-row border-t border-border bg-nav"
      style={{ height: 56 + bottomInset, paddingTop: 4, paddingBottom: bottomInset }}
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
            className="flex-1 items-center justify-center active:opacity-70"
            style={{ gap: 2 }}
          >
            <View
              style={{
                width: SLOT_WIDTH,
                height: SLOT_HEIGHT,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Animated.View
                pointerEvents="none"
                style={{
                  position: 'absolute',
                  width: SLOT_WIDTH,
                  height: SLOT_HEIGHT,
                  borderRadius: SLOT_HEIGHT / 2,
                  backgroundColor: colors.navActive,
                  transform: [{ scale: bubbles[index] }],
                }}
              />

              <Ionicons
                name={focused ? config.iconActive : config.icon}
                size={21}
                color={focused ? colors.nav : colors.navMuted}
              />
            </View>

            <Text
              className={`text-[11px] font-semibold ${focused ? 'text-nav-active' : 'text-nav-muted'}`}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
