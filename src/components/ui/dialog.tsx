import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { radii, spacing, useThemeColors } from '@/config/theme';
import { warnFeedback } from '@/lib/haptics';
import type { IconName } from '@/theme/icons';
import { Button } from './button';
import { Icon } from './icon';

export type DialogOptions = {
  title: string;
  message?: string;
  icon?: IconName;
  confirmLabel?: string;
  /** Pass null to hide the cancel button (single-button notice). */
  cancelLabel?: string | null;
  destructive?: boolean;
};

type DialogProps = DialogOptions & {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  loading?: boolean;
};

export function Dialog({
  visible,
  onConfirm,
  onCancel,
  loading = false,
  title,
  message,
  icon,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive = false,
}: DialogProps) {
  const colors = useThemeColors();
  const [mounted, setMounted] = useState(visible);
  const progress = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      if (destructive) warnFeedback();
      progress.value = withTiming(1, { duration: 200, easing: Easing.out(Easing.cubic) });
    } else {
      progress.value = withTiming(0, { duration: 140 }, (finished) => {
        if (finished) scheduleOnRN(setMounted, false);
      });
    }
  }, [visible, destructive, progress]);

  const backdropStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const cardStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.94 + progress.value * 0.06 }],
  }));

  if (!mounted) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={onCancel} statusBarTranslucent>
      <View className="flex-1 items-center justify-center px-6">
        <Animated.View
          style={[
            { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 },
            { backgroundColor: colors.backdrop },
            backdropStyle,
          ]}
        >
          <Pressable
            onPress={onCancel}
            accessibilityRole="button"
            accessibilityLabel="Dismiss"
            style={{ flex: 1 }}
          />
        </Animated.View>

        <Animated.View
          accessibilityViewIsModal
          accessibilityRole="alert"
          className="w-full border border-border bg-surface p-5"
          style={[
            {
              maxWidth: 400,
              borderRadius: radii.xl,
              shadowColor: colors.ink,
              shadowOpacity: 0.14,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 8 },
              elevation: 12,
            },
            cardStyle,
          ]}
        >
          {icon ? (
            <View
              className={`mb-4 h-11 w-11 items-center justify-center rounded-full ${
                destructive ? 'bg-danger' : 'bg-brand-soft'
              }`}
            >
              <Icon name={icon} size={22} color={destructive ? colors.dangerInk : colors.brandInk} />
            </View>
          ) : null}
          <Text className="text-lg font-semibold text-heading">{title}</Text>
          {message ? <Text className="mt-2 text-sm leading-5 text-body">{message}</Text> : null}

          <View className="mt-6 flex-row justify-end" style={{ gap: spacing.sm }}>
            {cancelLabel !== null ? (
              <Button label={cancelLabel} onPress={onCancel} variant="ghost" size="md" />
            ) : null}
            <Button
              label={confirmLabel}
              onPress={onConfirm}
              variant={destructive ? 'danger' : 'primary'}
              size="md"
              loading={loading}
            />
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

type DialogApi = {
  /** Resolves true on confirm, false on cancel/back/backdrop. Drop-in for Alert.alert confirmations. */
  confirm: (options: DialogOptions) => Promise<boolean>;
};

const DialogContext = createContext<DialogApi | null>(null);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<DialogOptions | null>(null);
  const [visible, setVisible] = useState(false);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const settle = useCallback((value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setVisible(false);
  }, []);

  const confirm = useCallback((next: DialogOptions) => {
    resolver.current?.(false);
    setOptions(next);
    setVisible(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const api = useMemo(() => ({ confirm }), [confirm]);

  return (
    <DialogContext.Provider value={api}>
      {children}
      {options ? (
        <Dialog
          {...options}
          visible={visible}
          onConfirm={() => settle(true)}
          onCancel={() => settle(false)}
        />
      ) : null}
    </DialogContext.Provider>
  );
}

export function useDialog(): DialogApi {
  const value = useContext(DialogContext);
  if (!value) throw new Error('useDialog must be used inside <DialogProvider>');
  return value;
}
