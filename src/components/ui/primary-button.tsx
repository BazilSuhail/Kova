import { ActivityIndicator, Pressable, Text } from 'react-native';

type Props = {
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'ghost';
};

export function PrimaryButton({ label, onPress, loading = false, disabled = false, variant = 'primary' }: Props) {
  const isGhost = variant === 'ghost';
  const isBlocked = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isBlocked}
      accessibilityRole="button"
      accessibilityState={{ disabled: isBlocked, busy: loading }}
      className={`h-14 flex-row items-center justify-center rounded-2xl active:opacity-80 ${
        isGhost
          ? 'border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900'
          : 'bg-violet-600'
      } ${isBlocked ? 'opacity-60' : ''}`}>
      {loading ? (
        <ActivityIndicator color={isGhost ? '#7C3AED' : '#FFFFFF'} />
      ) : (
        <Text className={`text-base font-semibold ${isGhost ? 'text-slate-900 dark:text-slate-100' : 'text-white'}`}>
          {label}
        </Text>
      )}
    </Pressable>
  );
}
