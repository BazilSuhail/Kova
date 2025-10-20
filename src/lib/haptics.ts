import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Small, fire-and-forget haptics.
 *
 * Every call is guarded and swallowed: the web has no taptic engine, a device can have
 * haptics switched off, and a feedback pulse must never be the reason an action fails.
 */
const supported = Platform.OS !== 'web';

async function run(feedback: () => Promise<void>): Promise<void> {
  if (!supported) return;
  try {
    await feedback();
  } catch {
    // Haptics are decoration. Ignore a device that refuses them.
  }
}

/** A tab press or a chip tap. */
export function tapFeedback(): void {
  void run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
}

/** A heavier confirmation, such as opening a sheet. */
export function pressFeedback(): void {
  void run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
}

/** A selection change: steppers, mood picks, segmented controls. */
export function selectFeedback(): void {
  void run(() => Haptics.selectionAsync());
}

/** Something completed: a task ticked, a save landed. */
export function successFeedback(): void {
  void run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
}

/** Something was removed or is about to be. */
export function warnFeedback(): void {
  void run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
}

/** A call failed. */
export function errorFeedback(): void {
  void run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
}
