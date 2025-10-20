import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../../global.css';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';
import { BootScreen } from '@/screens/boot-splash';

// Keep the native splash up until the stored session has been resolved.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * The session decides which half of the tree exists at all: the auth stack, the tab
 * shell, or the one-time permissions step that follows a fresh signup.
 *
 * `Stack.Protected` swaps the groups by guard, so no screen has to navigate on sign-in
 * or sign-out and there is never a frame where both are mounted.
 */
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
            <RootNavigator />
          </AuthProvider>
        </QueryProvider>
      </ThemeProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
