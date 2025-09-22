import logo from '@/assets/images/icon.png'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { useEffect } from 'react'
import { Image, Text, View } from 'react-native'

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const checkAppState = async () => {
      try {
        const justInstalled = await AsyncStorage.getItem('justInstalled');

        // Wait for splash screen
        await new Promise((resolve) => setTimeout(resolve, 3000));

        if (justInstalled === 'true') {
          router.replace('/(tabs)');
          return;
        }

        // Check for auth token
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
    <View className='flex-1 justify-between items-center bg-white'>

      <View className='rounded-full overflow-hidden mt-[3px] w-[110px] h-[110px]'>
        <Image source={logo} className='w-full h-full' />
      </View>

      <View className='mb-[15px]'>
        <Text className='text-rose-300 text-[10px] text-center font-[700]'>Made By</Text>
        <Text className='text-rose-700 font-[700]'>EntityStudio</Text>
      </View>
    </View>
  );
};

export default Index;
