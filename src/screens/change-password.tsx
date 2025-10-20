import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, Text, View, type TextInputProps } from 'react-native';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { FormError } from '@/components/ui/form-error';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { useChangePassword } from '@/hooks/queries/account';
import { errorMessage, isApiError } from '@/lib/errors';
import { successFeedback } from '@/lib/haptics';
import { useThemeColors } from '@/theme/colors';

type FieldErrors = { current?: string; next?: string; confirm?: string };

/** An `Input` with a show/hide eye button overlaid on the trailing edge. */
function PasswordField({
  label,
  value,
  onChangeText,
  error,
  hint,
  visible,
  onToggle,
  autoComplete,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  visible: boolean;
  onToggle: () => void;
  autoComplete?: TextInputProps['autoComplete'];
}) {
  const colors = useThemeColors();

  return (
    <View>
      <Input
        label={label}
        value={value}
        onChangeText={onChangeText}
        error={error}
        hint={hint}
        icon="lock-closed-outline"
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        autoComplete={autoComplete}
      />
      <Pressable
        onPress={onToggle}
        accessibilityRole="button"
        accessibilityLabel={visible ? `Hide ${label}` : `Show ${label}`}
        hitSlop={8}
        className="absolute right-3 top-9 h-9 w-9 items-center justify-center active:opacity-70">
        <Ionicons
          name={visible ? 'eye-off-outline' : 'eye-outline'}
          size={18}
          color={colors.textMuted}
        />
      </Pressable>
    </View>
  );
}

export default function ChangePasswordScreen() {
  const colors = useThemeColors();
  const changePassword = useChangePassword();

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [visible, setVisible] = useState({ current: false, next: false, confirm: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function validate(): boolean {
    const found: FieldErrors = {};
    if (!current) found.current = 'Enter your current password.';
    if (next.length < 8) found.next = 'Use at least 8 characters.';
    else if (next === current) found.next = 'Choose a password different from your current one.';
    if (confirm !== next) found.confirm = 'The two passwords do not match.';

    setErrors(found);
    return Object.keys(found).length === 0;
  }

  async function submit() {
    setFailure(null);
    setSuccess(false);
    if (!validate()) return;

    try {
      await changePassword.mutateAsync({ currentPassword: current, newPassword: next });
      successFeedback();
      setCurrent('');
      setNext('');
      setConfirm('');
      setErrors({});
      setSuccess(true);
    } catch (error) {
      // A wrong current password comes back as a 401, which deserves plainer wording.
      setFailure(
        isApiError(error) && error.status === 401
          ? 'Your current password is incorrect.'
          : errorMessage(error),
      );
    }
  }

  function toggle(field: keyof typeof visible) {
    setVisible((state) => ({ ...state, [field]: !state[field] }));
  }

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader
        eyebrow="Security"
        title="Change password"
        subtitle="Keep your account yours."
        back
        backFallback="/profile"
      />

      {success ? (
        <View className="mt-5 flex-row items-start rounded-2xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900 dark:bg-emerald-950">
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text className="ml-2 flex-1 text-sm font-medium text-emerald-800 dark:text-emerald-200">
            Password updated. Sessions that are already signed in stay valid, and the new password is
            required the next time you sign in.
          </Text>
        </View>
      ) : null}

      {failure ? (
        <View className="mt-5">
          <FormError message={failure} />
        </View>
      ) : null}

      <Card className="mt-5">
        <PasswordField
          label="Current password"
          value={current}
          onChangeText={setCurrent}
          error={errors.current}
          visible={visible.current}
          onToggle={() => toggle('current')}
          autoComplete="current-password"
        />
        <PasswordField
          label="New password"
          value={next}
          onChangeText={setNext}
          error={errors.next}
          hint="At least 8 characters — the only rule the server enforces."
          visible={visible.next}
          onToggle={() => toggle('next')}
          autoComplete="new-password"
        />
        <PasswordField
          label="Confirm new password"
          value={confirm}
          onChangeText={setConfirm}
          error={errors.confirm}
          visible={visible.confirm}
          onToggle={() => toggle('confirm')}
          autoComplete="new-password"
        />
      </Card>

      <View className="mt-6">
        <Button label="Update password" icon="key" loading={changePassword.isPending} onPress={() => void submit()} />
      </View>
    </Screen>
  );
}
