import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import '../../global.css';
import { TabBar } from '@/components/tab-bar';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TabBar />
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
