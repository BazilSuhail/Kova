import CurvyBackground from '@/components/backgrounds/CurvyBackground';
import { Feather, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Image, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function Login() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [triggerLogin, setTriggerLogin] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!triggerLogin) return;

    const loginUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/login`, {
          email,
          password,
        });

        if (res.data?.token) {
          Alert.alert('Success', 'Logged in successfully');
          router.replace('/Home'); // Use Expo Router replace
        } else {
          Alert.alert('Error', res.data?.message || 'Invalid credentials');
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Unable to connect to server';
        Alert.alert('Error', message);
      } finally {
        setIsLoading(false);
        setTriggerLogin(false);
      }
    };

    loginUser();
  }, [triggerLogin]);

  const bgColor = colorScheme === 'dark' ? 'bg-gray-950' : 'bg-emerald-50';
  const textColor = colorScheme === 'dark' ? 'text-white' : 'text-emerald-900';
  const subTextColor = colorScheme === 'dark' ? 'text-gray-400' : 'text-emerald-700';
  const inputBgColor = colorScheme === 'dark' ? 'bg-emerald-950/70' : 'bg-white';
  const inputBorderColor = colorScheme === 'dark' ? 'border-emerald-900' : 'border-emerald-300';
  const buttonBg = isLoading ? 'bg-emerald-400' : 'bg-emerald-700';

  return (
    <Animated.View style={{ flex: 1, opacity }} className={bgColor}>
  <CurvyBackground theme={colorScheme} />


      <View className="absolute inset-0 px-6 justify-end">
        <View className="absolute top-14 left-6">
          <Image
            source={require('@/assets/images/icon.png')}
            style={{ width: 60, height: 60 }}
            resizeMode="contain"
          />
        </View>

        <View className="mb-10">
          <Text className={`text-4xl font-bold ${colorScheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
            Welcome Back
          </Text>
          <Text className={`text-[11px] mt-[10px] ${subTextColor}`}>
            Sign in to continue your productivity journey
          </Text>

          <View className='flex-row items-center justify-between mt-[35px] mb-[25px]'>
            <View className='flex-row items-center' style={{ gap: 4 }}>
              <View className={`${colorScheme === 'dark' ? 'dark:bg-gray-700 bg-emerald-950/70' : 'bg-emerald-200'} w-[65px] rounded-lg h-[3px]`}></View>
              <View className={`${colorScheme === 'dark' ? 'dark:bg-emerald-700 bg-emerald-500' : 'bg-emerald-500'} w-[5px] rounded-lg h-[5px]`}></View>
              <View className={`${colorScheme === 'dark' ? 'dark:bg-emerald-700 bg-emerald-500' : 'bg-emerald-500'} w-[5px] rounded-lg h-[5px]`}></View>
              <View className={`${colorScheme === 'dark' ? 'dark:bg-emerald-700 bg-emerald-500' : 'bg-emerald-500'} w-[5px] rounded-lg h-[5px]`}></View>
            </View>

            <Link
              href="/SignUp"
              className={`text-[11px] ${colorScheme === 'dark' ? 'text-gray-400' : 'text-emerald-700'}`}
            >
              Don't have an account?{' '}
              <Text className={`ml-2 font-semibold ${colorScheme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>
                Sign Up
              </Text>
            </Link>
          </View>

          <View className={`rounded-[40px] border py-2 px-4 flex-row items-center mb-4 ${inputBgColor} ${inputBorderColor} border`}>
            <Ionicons name="mail-outline" size={20} color="#6b7280" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Email"
              placeholderTextColor="#9ca3af"
              value={email}
              onChangeText={setEmail}
              className={`flex-1 ${textColor}`}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View className={`rounded-[40px] border py-2 px-4 flex-row items-center mb-6 ${inputBgColor} ${inputBorderColor} border`}>
            <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={{ marginRight: 10 }} />
            <TextInput
              placeholder="Password"
              placeholderTextColor="#9ca3af"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className={`flex-1 ${textColor}`}
            />
          </View>

          <TouchableOpacity
            onPress={() => {
              if (!email || !password) return Alert.alert('Error', 'All fields required');
              setTriggerLogin(true);
            }}
            disabled={isLoading}
            className={`py-3 ml-auto w-[140px] rounded-[45px] items-center flex-row justify-center ${buttonBg}`}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-white font-[600] text-[16px] mr-3">Sign In</Text>
                <Feather name="arrow-right" size={22} color="#fff" />
              </>
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
          className="absolute top-14 right-6 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700"
        >
          <Ionicons name={colorScheme === 'dark' ? 'sunny' : 'moon'} size={18} color="#059669" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
