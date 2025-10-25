import { router, type Href } from 'expo-router';

import { IconButton } from './app-bar';

type Props = {
  fallback?: Href;
  className?: string;
  onPress?: () => void;
};

export function BackButton({ fallback = '/', className, onPress }: Props) {
  const handlePress =
    onPress ??
    (() => {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace(fallback);
      }
    });

  return (
    <IconButton
      icon="arrow-back"
      onPress={handlePress}
      accessibilityLabel="Back"
      size={24}
      className={className}
    />
  );
}
