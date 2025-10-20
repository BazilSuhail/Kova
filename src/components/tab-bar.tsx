import { useCallback, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Animated, PanResponder, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import HomeScreen from '../screens/home';
import TasksScreen from '../screens/tasks';
import PlanScreen from '../screens/plan';
import InsightsScreen from '../screens/insights';
import ProfileScreen from '../screens/profile';
import { useThemeColors } from '../theme/colors';

type IconName = keyof typeof Ionicons.glyphMap;

type Route = {
  name: string;
  label: string;
  icon: IconName;
  iconActive: IconName;
  Component: ComponentType;
};

/** Bottom-bar tabs. Order and labels mirror the Kova navigation plan. */
const routes: Route[] = [
  { name: 'home',     label: 'Home',     icon: 'home-outline',        iconActive: 'home',         Component: HomeScreen     },
  { name: 'tasks',    label: 'Tasks',    icon: 'checkbox-outline',    iconActive: 'checkbox',     Component: TasksScreen    },
  { name: 'plan',     label: 'Plan',     icon: 'calendar-outline',    iconActive: 'calendar',     Component: PlanScreen     },
  { name: 'insights', label: 'Insights', icon: 'stats-chart-outline', iconActive: 'stats-chart',  Component: InsightsScreen },
  { name: 'profile',  label: 'Profile',  icon: 'person-outline',      iconActive: 'person',       Component: ProfileScreen  },
];

export function TabBar() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [index, setIndex] = useState(0);
  const [pageWidth, setPageWidth] = useState(0);
  const [pageTranslate] = useState(() => new Animated.Value(0));
  // Screens mount on first visit only — no queries fire for tabs you never opened.
  const [visited, setVisited] = useState<ReadonlySet<number>>(() => new Set([0]));

  // Per-tab scale for the bubble indicator (stable, mutable Animated values)
  const [bubbleScales] = useState(() =>
    routes.map((_, i) => new Animated.Value(i === 0 ? 1 : 0)),
  );

  const settleTo = useCallback(
    (nextIndex: number, width = pageWidth) => {
      const bounded = Math.max(0, Math.min(routes.length - 1, nextIndex));
      const distance = width || 360;

      Animated.spring(pageTranslate, {
        toValue: -bounded * distance,
        useNativeDriver: true,
        tension: 75,
        friction: 11,
      }).start();

      if (bounded !== index) {
        Animated.spring(bubbleScales[index], {
          toValue: 0,
          useNativeDriver: true,
          tension: 140,
          friction: 9,
        }).start();
        Animated.spring(bubbleScales[bounded], {
          toValue: 1,
          useNativeDriver: true,
          tension: 140,
          friction: 9,
        }).start();
      }

      setIndex(bounded);
      setVisited((prev) => (prev.has(bounded) ? prev : new Set(prev).add(bounded)));
    },
    [index, pageWidth, pageTranslate, bubbleScales],
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, g) =>
          Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderMove: (_, g) => {
          const base = -index * (pageWidth || 360);
          const min = -(routes.length - 1) * (pageWidth || 360);
          pageTranslate.setValue(Math.max(min, Math.min(0, base + g.dx)));
        },
        onPanResponderRelease: (_, g) => {
          const threshold = Math.max(55, (pageWidth || 360) * 0.2);
          const next = Math.abs(g.dx) > threshold ? index + (g.dx < 0 ? 1 : -1) : index;
          settleTo(next);
        },
        onPanResponderTerminate: () => settleTo(index),
      }),
    [index, pageWidth, pageTranslate, settleTo],
  );

  const BAR_HEIGHT = 72 + (insets.bottom || 14);

  return (
    <View style={{ flex: 1 }} className="bg-slate-100 dark:bg-slate-950">
      {/* ── Page area ── */}
      <View
        style={{ flex: 1, overflow: 'hidden' }}
        onLayout={(e) => {
          const w = e.nativeEvent.layout.width;
          setPageWidth(w);
          pageTranslate.setValue(-index * w);
        }}
        {...panResponder.panHandlers}>
        <Animated.View
          style={{
            flex: 1,
            flexDirection: 'row',
            width: pageWidth * routes.length,
            transform: [{ translateX: pageTranslate }],
          }}>
          {routes.map((route, routeIndex) => (
            <View key={route.name} style={{ width: pageWidth, flex: 1 }}>
              {visited.has(routeIndex) ? <route.Component /> : null}
            </View>
          ))}
        </Animated.View>
      </View>

      {/* ── Tab bar ── */}
      <View
        className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
        style={{ height: BAR_HEIGHT, paddingBottom: insets.bottom || 14, flexDirection: 'row' }}>
        {routes.map((route, routeIndex) => {
          const focused = routeIndex === index;
          const scale = bubbleScales[routeIndex];

          return (
            <Pressable
              key={route.name}
              onPress={() => settleTo(routeIndex)}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 4 }}>

              {/* Bubble highlight behind the active tab */}
              <Animated.View
                pointerEvents="none"
                className="bg-violet-100 dark:bg-violet-950"
                style={{
                  position: 'absolute',
                  width: 66,
                  height: 48,
                  borderRadius: 26,
                  transform: [{ scale }],
                }}
              />

              <Ionicons
                name={focused ? route.iconActive : route.icon}
                size={21}
                color={focused ? colors.primary : colors.textMuted}
              />

              <Text
                className={`text-xs font-semibold ${
                  focused ? 'text-violet-700 dark:text-violet-300' : 'text-slate-500 dark:text-slate-400'
                }`}>
                {route.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
