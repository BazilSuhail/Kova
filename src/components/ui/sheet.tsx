import type { ReactNode } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

/** Bottom sheet built on the core `Modal`, so it works without a gesture library. */
export function Sheet({ visible, onClose, title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        className="flex-1 justify-end bg-slate-900/60">
        {/* Swallows taps so the sheet body does not dismiss itself. */}
        <Pressable
          onPress={() => {}}
          className="rounded-t-3xl border-t border-slate-200 bg-white px-6 pt-4 dark:border-slate-800 dark:bg-slate-900"
          style={{ paddingBottom: (insets.bottom || 16) + 16 }}>
          <View className="mb-5 h-1.5 w-12 self-center rounded-full bg-slate-300 dark:bg-slate-700" />

          {title ? (
            <Text className="text-xl font-bold text-slate-900 dark:text-slate-100">{title}</Text>
          ) : null}
          {subtitle ? (
            <Text className="mt-1 text-sm text-slate-500 dark:text-slate-400">{subtitle}</Text>
          ) : null}

          <View className={title ? 'mt-5' : ''}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
