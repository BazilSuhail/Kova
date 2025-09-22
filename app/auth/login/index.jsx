import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { useColorScheme } from 'nativewind';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function SignInScreen({ navigation }) {
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
        const res = await axios.post(`${process.env.BACKEND_URL}/auth/login`, {
          email,
          password,
        });

        if (res.data?.token) {
          Alert.alert('Success', 'Logged in successfully');
          navigation.replace('Home');
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

  return (
    <Animated.View
      style={{ flex: 1, opacity }}
      className="bg-gray-50 dark:bg-gray-950 justify-center px-6"
    >
      {/* Header */}
      <View className="mb-10">
        <Text className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
          Welcome Back
        </Text>
        <Text className="text-gray-500 dark:text-gray-400">
          Sign in to continue your productivity journey
        </Text>
      </View>

      {/* Email */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-4 p-4 flex-row items-center">
        <Ionicons name="mail-outline" size={20} color="#6b7280" style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Email"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          className="flex-1 text-gray-900 dark:text-white"
          keyboardType="email-address"
          autoCapitalize="none"
        />
      </View>

      {/* Password */}
      <View className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 mb-6 p-4 flex-row items-center">
        <Ionicons name="lock-closed-outline" size={20} color="#6b7280" style={{ marginRight: 10 }} />
        <TextInput
          placeholder="Password"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          className="flex-1 text-gray-900 dark:text-white"
        />
      </View>

      {/* Sign In Button */}
      <TouchableOpacity
        onPress={() => {
          if (!email || !password) return Alert.alert('Error', 'All fields required');
          setTriggerLogin(true);
        }}
        disabled={isLoading}
        className={`py-4 rounded-2xl items-center flex-row justify-center ${isLoading ? 'bg-emerald-400' : 'bg-emerald-600'}`}
      >
        {isLoading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Ionicons name="log-in-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text className="text-white font-semibold text-lg">Sign In</Text>
          </>
        )}
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')} className="mt-6">
        <Text className="text-center text-gray-600 dark:text-gray-400">
          Don’t have an account?{' '}
          <Text className="text-emerald-600 dark:text-emerald-400 font-semibold">Sign Up</Text>
        </Text>
      </TouchableOpacity>

      {/* Theme Toggle */}
      <TouchableOpacity
        onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
        className="absolute top-14 right-6 bg-white dark:bg-gray-800 p-3 rounded-2xl border border-gray-200 dark:border-gray-700"
      >
        <Ionicons name={colorScheme === 'dark' ? 'sunny' : 'moon'} size={18} color="#059669" />
      </TouchableOpacity>
    </Animated.View>
  );
}
