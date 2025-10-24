import { Text, View } from 'react-native';

const PRIORITY_BG: Record<string, string> = {
  high: 'bg-surface-alt',
  medium: 'bg-surface-alt',
};

const PRIORITY_TEXT: Record<string, string> = {
  high: 'text-danger-ink',
  medium: 'text-brand-ink',
};

export function PriorityChip({ priority }: { priority?: string }) {
  const label = priority ? priority.charAt(0).toUpperCase() + priority.slice(1) : 'Info';

  return (
    <View className={`rounded-full px-3 py-1 ${PRIORITY_BG[priority ?? ''] ?? 'bg-surface-alt'}`}>
      <Text className={`text-xs font-semibold ${PRIORITY_TEXT[priority ?? ''] ?? 'text-muted'}`}>
        {label}
      </Text>
    </View>
  );
}
