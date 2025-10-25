import { View } from 'react-native';

import { Icon } from '@/components/ui/icon';

/** Inline "looks good" mark for an Input's trailing slot. */
export function ValidMark({ show }: { show: boolean }) {
  return show ? (
    <View className="ml-2" accessibilityLabel="Looks good">
      <Icon name="checkmark-circle" size={18} tone="success" />
    </View>
  ) : null;
}
