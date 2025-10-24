import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../../global.css';
import { palette } from '@/config/theme';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { PushProvider } from '@/providers/push-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

SplashScreen.preventAutoHideAsync().catch(() => {});

function BootScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-brand">
      <Text className="text-4xl font-bold tracking-tight text-on-brand">Kova</Text>
      <Text className="mt-2 text-sm text-on-brand">Plan, focus, reflect</Text>
      <ActivityIndicator style={{ marginTop: 32 }} color={palette.white} />
    </View>
  );
}

function RootNavigator() {
  const { status, showPermissions } = useAuth();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  if (status === 'loading') return <BootScreen />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && !showPermissions}>
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated && showPermissions}>
        <Stack.Screen name="permissions" options={{ animation: 'fade' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <QueryProvider>
          <AuthProvider>
            <PushProvider>
              <RootNavigator />
            </PushProvider>
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
