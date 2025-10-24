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

export default function AboutScreen() {
  const router = useRouter();

  return (
    <Screen edges={['top', 'bottom']} contentContainerStyle={{ paddingBottom: 32 }}>
      <ScreenHeader
        icon="information-circle-outline"
        eyebrow="About"
        title="Kova"
        subtitle={`Version ${versionLabel()}`}
      />

      <Card className="mt-5">
        <Text className="text-sm leading-6 text-muted">
          Kova keeps your tasks, your day plans and your progress in one calm place. Capture what
          comes up by sentence, voice or photo, plan the day around a few focus tasks, and let the
          recaps and trends show you what is actually moving.
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
