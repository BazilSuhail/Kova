import Constants from 'expo-constants';
import { Text, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Row } from '@/components/ui/row';
import { Screen } from '@/components/ui/screen';
import { ScreenHeader } from '@/components/ui/screen-header';
import { API_BASE, API_BASE_IS_DEFAULT } from '@/config/env';

function versionLabel(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

/** Pushed from Profile as a modal route. */
export function AboutScreen() {
  const router = useRouter();

  return (
    <Screen edges={['top', 'bottom']} contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader eyebrow="About" title="Kova" subtitle={`Version ${versionLabel()}`} />

      <Card className="mt-5">
        <Text className="text-sm leading-6 text-slate-600 dark:text-slate-400">
          Kova keeps your tasks, your focus sessions and your progress in one calm place. Plan the day,
          capture what comes up, and let the recaps show you what is actually moving.
        </Text>
      </Card>

      <Card padded={false} className="mt-4 overflow-hidden rounded-2xl">
        <Row title="Version" subtitle={versionLabel()} icon="pricetag-outline" />
        <Row
          title="Server"
          subtitle={API_BASE_IS_DEFAULT ? `${API_BASE} (default, from the build)` : API_BASE}
          icon="server-outline"
          last
        />
      </Card>

      <View className="mt-6">
        <Button label="Close" variant="secondary" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}
