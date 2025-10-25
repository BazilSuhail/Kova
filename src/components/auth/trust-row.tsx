import { Text, View } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { spacing } from '@/config/theme';
import type { IconName } from '@/theme/icons';

const ITEMS: { icon: IconName; label: string }[] = [
  { icon: 'lock-closed-outline', label: 'Encrypted' },
  { icon: 'cloud-done-outline', label: 'Synced' },
  { icon: 'shield-checkmark-outline', label: 'Private' },
];

/** Small reassurance row under auth forms. */
export function TrustRow() {
  return (
    <View
      className="mt-6 flex-row items-center justify-center"
      style={{ gap: spacing.xl }}
    >
      {ITEMS.map((item) => (
        <View key={item.label} className="flex-row items-center" style={{ gap: 6 }}>
          <Icon name={item.icon} size={14} tone="brand" />
          <Text className="text-xs font-medium text-muted">{item.label}</Text>
        </View>
      ))}
    </View>
  );
}
