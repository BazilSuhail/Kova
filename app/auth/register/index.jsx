import CurvyBackground from '@/components/backgrounds/CurvyBackground';
import { Feather, Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { Link, useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Register() {
  const router = useRouter();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [triggerSignUp, setTriggerSignUp] = useState(false);
  const opacity = useState(new Animated.Value(0))[0];
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (!triggerSignUp) return;

    const registerUser = async () => {
      setIsLoading(true);
      try {
        const res = await axios.post(`${process.env.EXPO_PUBLIC_BACKEND_URL}/auth/signup`, {
          email,
          password,
        });

        if (res.data?.token) {
          Alert.alert('Success', 'Account created successfully');
          router.replace('/auth/login');
        } else {
          Alert.alert('Error', res.data?.message || 'Unable to create account');
        }
      } catch (err) {
        const message = err.response?.data?.message || 'Unable to connect to server';
        Alert.alert('Error', message);
      } finally {
        setIsLoading(false);
        setTriggerSignUp(false);
      }
    };

    registerUser();
  }, [triggerSignUp]);

  const handleSignUp = () => {
    if (!email || !password || !confirmPassword) {
      return Alert.alert('Error', 'All fields required');
    }
    
    if (password !== confirmPassword) {
      return Alert.alert('Error', 'Passwords do not match');
    }
    
    if (password.length < 6) {
      return Alert.alert('Error', 'Password must be at least 6 characters long');
    }
    
    setTriggerSignUp(true);
  };

  const bgColor = colorScheme === 'dark' ? 'bg-gray-950' : 'bg-emerald-50';
  const textColor = colorScheme === 'dark' ? 'text-white' : 'text-emerald-900';
  const subTextColor = colorScheme === 'dark' ? 'text-gray-400' : 'text-emerald-700';
  const inputBgColor = colorScheme === 'dark' ? 'bg-emerald-950/70' : 'bg-white';
  const inputBorderColor = colorScheme === 'dark' ? 'border-emerald-900' : 'border-emerald-300';
  const buttonBg = isLoading ? 'bg-emerald-400' : 'bg-emerald-700';

  return (
    <View style={{
      flex: 1,
      paddingTop: insets.top,
      paddingBottom: insets.bottom,
    }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <Animated.View style={{ flex: 1, opacity }} className={bgColor}>
          <CurvyBackground theme={colorScheme} />
 <View className="absolute top-4 left-6">
                <Image
                  source={require('@/assets/images/icon.png')}
                  style={{ width: 60, height: 60 }}
                  resizeMode="contain"
                />
              </View>
              
              <TouchableOpacity
                onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
                className="absolute top-4 right-6 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700"
              >
                <Ionicons name={colorScheme === 'dark' ? 'sunny' : 'moon'} size={18} color="#059669" />
              </TouchableOpacity>

          <View className="absolute inset-0 px-6 justify-end">
            

            {/* Main content section */}
            <View className="mb-10">
              <Text className={`text-4xl font-bold ${colorScheme === 'dark' ? 'text-emerald-400' : 'text-emerald-600'}`}>
                Create Account
              </Text>
              <Text className={`text-[11px] mt-[10px] ${subTextColor}`}>
                Sign up to start your productivity journey
              </Text>

              <View className='flex-row items-center justify-between mt-[35px] mb-[25px]'>
                <View className='flex-row items-center' style={{ gap: 4 }}>
                  <View className={`${colorScheme === 'dark' ? 'dark:bg-gray-700 bg-emerald-950/70' : 'bg-emerald-200'} w-[65px] rounded-lg h-[3px]`}></View>
                  <View className={`${colorScheme === 'dark' ? 'dark:bg-emerald-700 bg-emerald-500' : 'bg-emerald-500'} w-[5px] rounded-lg h-[5px]`}></View>
                  <View className={`${colorScheme === 'dark' ? 'dark:bg-emerald-700 bg-emerald-500' : 'bg-emerald-500'} w-[5px] rounded-lg h-[5px]`}></View>
                  <View className={`${colorScheme === 'dark' ? 'dark:bg-emerald-700 bg-emerald-500' : 'bg-emerald-500'} w-[5px] rounded-lg h-[5px]`}></View>
                </View>

                <Link
                  href="/auth/login"
                  className={`text-[11px] ${colorScheme === 'dark' ? 'text-gray-400' : 'text-emerald-700'}`}
                >
                  Already have an account?{' '}
                  <Text className={`ml-2 font-semibold ${colorScheme === 'dark' ? 'text-emerald-400' : 'text-emerald-800'}`}>
                    Sign In
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
                  autoCorrect={false}
                />
              </View>

              <View className={`rounded-[40px] border py-2 px-4 flex-row items-center mb-4 ${inputBgColor} ${inputBorderColor} border`}>
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

              <View className={`rounded-[40px] border py-2 px-4 flex-row items-center mb-6 ${inputBgColor} ${inputBorderColor} border`}>
                <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={{ marginRight: 10 }} />
                <TextInput
                  placeholder="Confirm Password"
                  placeholderTextColor="#9ca3af"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry
                  className={`flex-1 ${textColor}`}
                />
              </View>

              <TouchableOpacity
                onPress={handleSignUp}
                disabled={isLoading}
                className={`py-3 ml-auto w-[140px] rounded-[45px] items-center flex-row justify-center ${buttonBg}`}
              >
                {isLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text className="text-white font-[600] text-[16px] mr-3">Sign Up</Text>
                    <Feather name="arrow-right" size={22} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}