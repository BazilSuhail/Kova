import { useEffect, useState, type ReactNode } from 'react';
import { Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  interpolate,
  scrollTo,
  useAnimatedKeyboard,
  useAnimatedRef,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';

import { radii, spacing, useThemeColors } from '@/config/theme';
import { tapFeedback } from '@/lib/haptics';
import type { IconName } from '@/theme/icons';
import { Icon } from './icon';

export type SheetAction = {
  icon: IconName;
  label: string;
  onPress: () => void;
  subtitle?: string;
  destructive?: boolean;
  disabled?: boolean;
};

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  icon?: IconName;
  /** YouTube-style "more" list: icon + label rows. Pressing one closes the sheet, then runs onPress. */
  actions?: SheetAction[];
  children?: ReactNode;
};

const OPEN_MS = 280;
const CLOSE_MS = 220;
const DISMISS_VELOCITY = 900;
const DISMISS_FRACTION = 0.3;

export function Sheet({ visible, onClose, title, subtitle, icon, actions, children }: Props) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { height: windowHeight } = useWindowDimensions();
  const [mounted, setMounted] = useState(visible);

  const translateY = useSharedValue(windowHeight);
  const sheetHeight = useSharedValue(windowHeight);
  const scrollY = useSharedValue(0);
  const dragAnchor = useSharedValue(0);
  const keyboard = useAnimatedKeyboard();
  const scrollRef = useAnimatedRef<Animated.ScrollView>();

  useEffect(() => {
    if (visible) {
      setMounted(true);
      translateY.value = withTiming(0, { duration: OPEN_MS, easing: Easing.out(Easing.cubic) });
    } else {
      translateY.value = withTiming(
        windowHeight,
        { duration: CLOSE_MS, easing: Easing.in(Easing.cubic) },
        (finished) => {
          if (finished) scheduleOnRN(setMounted, false);
        },
      );
    }
  }, [visible, windowHeight, translateY]);

  const onScroll = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const scrollGesture = Gesture.Native();

  // Drags the sheet only while the content is scrolled to the top; otherwise the ScrollView scrolls.
  const pan = Gesture.Pan()
    .simultaneousWithExternalGesture(scrollGesture)
    .activeOffsetY([-8, 8])
    .failOffsetX([-16, 16])
    .onStart(() => {
      dragAnchor.value = 0;
    })
    .onUpdate((event) => {
      if (scrollY.value > 0 && translateY.value === 0) {
        dragAnchor.value = event.translationY;
        return;
      }
      translateY.value = Math.max(0, event.translationY - dragAnchor.value);
      if (translateY.value > 0) scrollTo(scrollRef, 0, 0, false);
    })
    .onEnd((event) => {
      if (translateY.value === 0) return;
      const dismiss =
        event.velocityY > DISMISS_VELOCITY ||
        translateY.value > sheetHeight.value * DISMISS_FRACTION;
      if (dismiss) {
        scheduleOnRN(onClose);
      } else {
        translateY.value = withSpring(0, { damping: 24, stiffness: 260 });
      }
    });

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: interpolate(translateY.value, [0, sheetHeight.value], [1, 0], 'clamp'),
  }));

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    marginBottom: keyboard.height.value,
    maxHeight: windowHeight - insets.top - spacing.xxl - keyboard.height.value,
  }));

  if (!mounted) return null;

  function runAction(action: SheetAction) {
    tapFeedback();
    onClose();
    // Wait for the slide-out so a follow-up modal (e.g. confirm dialog) doesn't stack on a closing one (flaky on iOS).
    setTimeout(action.onPress, CLOSE_MS);
  }

  return (
    <Modal
      visible
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      {/* Modals render outside the app root on Android, so gestures need their own root. */}
      <GestureHandlerRootView style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Animated.View
          style={[
            { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
            { backgroundColor: colors.backdrop },
            backdropStyle,
          ]}
        >
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            accessibilityLabel="Close"
            style={{ flex: 1 }}
          />
        </Animated.View>

        <GestureDetector gesture={pan}>
          <Animated.View
            accessibilityViewIsModal
            onLayout={(event) => {
              sheetHeight.value = event.nativeEvent.layout.height;
            }}
            className="border-t border-border bg-surface"
            style={[
              {
                borderTopLeftRadius: radii.xl,
                borderTopRightRadius: radii.xl,
                shadowColor: colors.ink,
                shadowOpacity: 0.12,
                shadowRadius: 16,
                shadowOffset: { width: 0, height: -4 },
                elevation: 12,
              },
              sheetStyle,
            ]}
          >
            <View className="items-center pb-2 pt-3">
              <View className="h-1 w-10 rounded-full bg-border" />
            </View>

            {title ? (
              <View className="px-4 pb-3 pt-1">
                <View className="flex-row items-center" style={{ gap: spacing.md }}>
                  {icon ? (
                    <View className="h-9 w-9 items-center justify-center rounded-md bg-brand-soft">
                      <Icon name={icon} size={18} tone="brand" />
                    </View>
                  ) : null}
                  <View className="flex-1">
                    <Text className="text-lg font-semibold text-heading">{title}</Text>
                    {subtitle ? (
                      <Text className="mt-0.5 text-sm text-muted">{subtitle}</Text>
                    ) : null}
                  </View>
                </View>
              </View>
            ) : null}

            <GestureDetector gesture={scrollGesture}>
              <Animated.ScrollView
                ref={scrollRef}
                onScroll={onScroll}
                scrollEventThrottle={16}
                bounces={false}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{
                  paddingHorizontal: actions && !children ? 0 : spacing.lg,
                  paddingTop: title ? 0 : spacing.xs,
                  paddingBottom: Math.max(insets.bottom, spacing.lg),
                }}
              >
                {children}
                {actions?.length ? (
                  <View style={children ? { marginHorizontal: -spacing.lg, marginTop: spacing.sm } : null}>
                    {actions.map((action) => (
                      <Pressable
                        key={action.label}
                        onPress={() => runAction(action)}
                        disabled={action.disabled}
                        accessibilityRole="button"
                        accessibilityState={{ disabled: action.disabled }}
                        className={`flex-row items-center px-4 py-3 active:bg-surface-alt ${
                          action.disabled ? 'opacity-50' : ''
                        }`}
                        style={{ gap: spacing.lg }}
                      >
                        <Icon
                          name={action.icon}
                          size={22}
                          color={action.destructive ? colors.dangerInk : colors.heading}
                        />
                        <View className="flex-1">
                          <Text
                            className={`text-base ${action.destructive ? 'text-danger-ink' : 'text-heading'}`}
                          >
                            {action.label}
                          </Text>
                          {action.subtitle ? (
                            <Text className="mt-0.5 text-xs text-muted">{action.subtitle}</Text>
                          ) : null}
                        </View>
                      </Pressable>
                    ))}
                  </View>
                ) : null}
              </Animated.ScrollView>
            </GestureDetector>
          </Animated.View>
        </GestureDetector>
      </GestureHandlerRootView>
    </Modal>
  );
}
