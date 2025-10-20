import { useEffect } from 'react';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import '../../global.css';
import { TabBar } from '@/components/tab-bar';
import { AuthProvider, useAuth } from '@/providers/auth-provider';
import { QueryProvider } from '@/providers/query-provider';
import { AuthFlow } from '@/screens/auth/auth-flow';
import { PermissionsScreen } from '@/screens/auth/permissions';
import { BootScreen } from '@/screens/boot-splash';

// Keep the native splash up until the stored session has been resolved.
SplashScreen.preventAutoHideAsync().catch(() => {});

/**
 * The whole shell, decided by the session:
 * boot → auth flow → one-time permissions step → tabs.
 */
function RootNavigator() {
  const { status, showPermissions } = useAuth();

  useEffect(() => {
    if (status !== 'loading') {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [status]);

  if (status === 'loading') return <BootScreen />;
  if (status === 'unauthenticated') return <AuthFlow />;
  if (showPermissions) return <PermissionsScreen />;
  return <TabBar />;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </QueryProvider>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
