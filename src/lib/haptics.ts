import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

const supported = Platform.OS !== 'web';

async function run(feedback: () => Promise<void>): Promise<void> {
  if (!supported) return;
  try {
    await feedback();
  } catch {}
}

export function tapFeedback(): void {
  void run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

export function selectFeedback(): void {
  void run(() => Haptics.selectionAsync());
}

export function successFeedback(): void {
  void run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

export function warnFeedback(): void {
  void run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}
