import { Text, View } from 'react-native';

import { selectFeedback } from '@/lib/haptics';
import { Chip } from './chip';

export type ChipOption = { value: string; label: string };

type Props = {
  label: string;
  options: ChipOption[];
  value: string | undefined;
  onChange: (value: string) => void;
  feedback?: boolean;
};

export function ChipRow({ label, options, value, onChange, feedback = false }: Props) {
  function select(next: string) {
    if (feedback) selectFeedback();
    onChange(next);
  }

  return (
    <View>
      <Text className="mb-2 text-xs font-medium text-muted">{label}</Text>
      <View className="flex-row flex-wrap" style={{ gap: 8 }}>
        {options.map((option) => (
          <Chip
            key={option.value}
            label={option.label}
            selected={value === option.value}
            onPress={() => select(option.value)}
          />
        ))}
      </View>
    </View>
  );
}
