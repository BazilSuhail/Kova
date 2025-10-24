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

export function Sheet({ visible, onClose, title, subtitle, children }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <Pressable
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close"
        className="flex-1 justify-end bg-ink/70"
      >
        <Pressable
          onPress={() => {}}
          className="rounded-t-3xl border-t border-border bg-surface px-6 pt-4"
          style={{ paddingBottom: (insets.bottom || 16) + 16 }}
        >
          <View className="mb-5 h-1.5 w-12 self-center rounded-full bg-border" />

          {title ? <Text className="text-xl font-bold text-heading">{title}</Text> : null}
          {subtitle ? <Text className="mt-1 text-sm text-muted">{subtitle}</Text> : null}

          <View className={title ? 'mt-5' : ''}>{children}</View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
