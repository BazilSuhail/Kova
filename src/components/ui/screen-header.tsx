import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import type { Href } from 'expo-router';

import { BackButton } from './back-button';

type Props = {
  /** Small violet label above the title, e.g. the section name. */
  eyebrow?: string;
  title: string;
  subtitle?: string;
  /** Rendered on the right, vertically aligned with the top of the block. */
  right?: ReactNode;
  /**
   * Show a back control above the title. The tab stacks hide their native headers, so every
   * pushed screen asks for one here instead of drawing its own.
   */
  back?: boolean;
  /** Where a cold deep link lands when there is no history to pop. */
  backFallback?: Href;
};

export function ScreenHeader({ eyebrow, title, subtitle, right, back = false, backFallback }: Props) {
  return (
    <View className="flex-row items-start justify-between">
      <View className="flex-1 pr-3">
        {back ? (
          <View className="mb-3">
            <BackButton fallback={backFallback} />
          </View>
        ) : null}
        {eyebrow ? (
          <Text className="text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">
            {eyebrow}
          </Text>
        ) : null}
        <Text className={`text-3xl font-bold text-slate-900 dark:text-slate-100 ${eyebrow ? 'mt-2' : ''}`}>
          {title}
        </Text>
        {subtitle ? (
          <Text className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</Text>
        ) : null}
      </View>
      {right}
    </View>
  );
}
