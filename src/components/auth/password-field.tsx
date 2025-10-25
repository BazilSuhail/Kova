import { forwardRef, useState, type ComponentProps } from 'react';
import { Pressable, type TextInput } from 'react-native';

import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { useThemeColors } from '@/config/theme';

type Props = Omit<ComponentProps<typeof Input>, 'secureTextEntry' | 'trailing'>;

/** Password input with a show/hide eye toggle. */
export const PasswordField = forwardRef<TextInput, Props>(function PasswordField(props, ref) {
  const colors = useThemeColors();
  const [visible, setVisible] = useState(false);

  return (
    <Input
      ref={ref}
      icon="lock-closed-outline"
      autoCapitalize="none"
      autoCorrect={false}
      {...props}
      secureTextEntry={!visible}
      trailing={
        <Pressable
          onPress={() => setVisible((value) => !value)}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          className="ml-2 py-2 active:opacity-70"
        >
          <Icon name={visible ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.muted} />
        </Pressable>
      }
    />
  );
});
