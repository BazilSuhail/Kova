import logo from '@/assets/images/icon.png';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Image, StatusBar, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Index = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const checkAppState = async () => {
      try {
        const justInstalled = await AsyncStorage.getItem('justInstalled');
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (justInstalled === 'true') {
          router.replace('/(tabs)');
          return;
        }

        const token = await AsyncStorage.getItem('token');
        if (token) {
          router.replace('/(tabs)');
        } else {
          router.replace('/auth/login');
        }
      } catch (error) {
        router.replace('/auth/login');
      }
    };

    checkAppState();
  }, [router]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: '#047857', // Emerald-600
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <StatusBar backgroundColor="#047857" barStyle="light-content" />

      {/* Logo */}
      <View className="rounded-full overflow-hidden w-[110px] h-[110px] mb-10">
        <Image source={logo} className="w-full h-full" />
      </View>

      {/* Footer */}
      <View style={{ position: 'absolute', bottom: insets.bottom + 12, alignItems: 'center' }}>
        <Text className="text-emerald-300 text-[10px] font-[700] text-center">Made By</Text>
        <Text className="text-emerald-200 font-[700]">EntityStudio</Text>
      </View>
    </View>
  );
};

export default Index;
