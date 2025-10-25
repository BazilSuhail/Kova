import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import * as SystemUI from 'expo-system-ui';
import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider as NavigationThemeProvider,
} from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../../global.css';
import { useIsDark, useThemeColors } from '@/config/theme';
import { BrandMark } from '@/components/ui/brand-mark';
import { DialogProvider } from '@/components/ui/dialog';
import { FloatingShapes } from '@/components/ui/floating-shapes';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { PushProvider } from '@/providers/push-provider';
import { QueryProvider } from '@/providers/query-provider';
import { ThemeProvider } from '@/providers/theme-provider';

SplashScreen.preventAutoHideAsync().catch(() => {});

function BootScreen() {
  const colors = useThemeColors();
  return (
    <View className="flex-1 items-center justify-center bg-background">
      <FloatingShapes />
      <BrandMark size={72} />
      <Text className="mt-4 text-3xl font-bold tracking-tight text-heading">Kova</Text>
      <Text className="mt-1 text-sm text-muted">Plan, focus, reflect</Text>
      <ActivityIndicator style={{ marginTop: 32 }} color={colors.brandInk} />
    </View>
  );
}

function RootNavigator() {
  const { status, showPermissions } = useAuth();
  const isAuthenticated = status === 'authenticated';
  const isDark = useIsDark();
  const colors = useThemeColors();
  const base = isDark ? DarkTheme : DefaultTheme;
  // Navigator scene/card backgrounds follow our tokens so transitions never flash light grey in dark mode.
  const navTheme = {
    ...base,
    colors: {
      ...base.colors,
      primary: colors.brand,
      background: colors.background,
      card: colors.surface,
      text: colors.heading,
      border: colors.border,
    },
  };

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  if (status === 'loading') return <BootScreen />;

  return (
    <NavigationThemeProvider value={navTheme}>
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
    </NavigationThemeProvider>
  );
}

function SystemBars() {
  const isDark = useIsDark();
  const { background } = useThemeColors();

  useEffect(() => {
    // Root view + Android nav bar background follow the theme so edges never flash the wrong color.
    SystemUI.setBackgroundColorAsync(background).catch(() => {});
  }, [background]);

  return <StatusBar style={isDark ? 'light' : 'dark'} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <SystemBars />
          <QueryProvider>
            <AuthProvider>
              <PushProvider>
                <DialogProvider>
                  <RootNavigator />
                </DialogProvider>
              </PushProvider>
            </AuthProvider>
          </QueryProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
