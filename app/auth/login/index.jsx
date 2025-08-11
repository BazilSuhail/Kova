import { Ionicons } from '@expo/vector-icons';
import { Link } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      })
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Information", "Please fill in all fields to continue.");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Welcome Back! 🎉", `Successfully logged in as ${email}`);
    }, 1500);
  };

  return (

    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          className="flex-1 px-6 pt-12 pb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Header Section */}
          <View className="items-center mb-12">
            {/* App Icon */}
            <View className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-emerald-200">
              <Ionicons name="lock-closed-outline" size={32} color="white" />
            </View>

            <Text className="text-4xl font-bold text-gray-800 mb-3">Welcome Back</Text>
            <Text className="text-gray-500 text-center text-lg leading-6 max-w-sm">
              Sign in to your account to continue your journey
            </Text>
          </View>

          {/* Form Section */}
          <View className="flex-1 justify-center">
            {/* Email Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-3 text-base">Email Address</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="mail-outline" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-base text-gray-800 shadow-sm"
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  value={email}
                  onChangeText={setEmail}
                  style={{ fontSize: 16 }}
                />
              </View>
            </View>

            {/* Password Input */}
            <View className="mb-8">
              <Text className="text-gray-700 font-semibold mb-3 text-base">Password</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="bg-white border border-gray-200 rounded-2xl pl-12 pr-14 py-4 text-base text-gray-800 shadow-sm"
                  placeholder="Enter your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoComplete="password"
                  value={password}
                  onChangeText={setPassword}
                  style={{ fontSize: 16 }}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowPassword(!showPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity
              className="items-end mb-8"
              activeOpacity={0.7}
            >
              <Text className="text-emerald-600 font-semibold">Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              className={`p-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200 ${isLoading ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}
              activeOpacity={0.9}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <View className="flex-row items-center">
                {isLoading ? (
                  <>
                    <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                      style={{
                        transform: [{ rotate: '360deg' }]
                      }}
                    />
                    <Text className="text-white font-bold text-lg">Signing In...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="log-in-outline" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Sign In</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-8">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-gray-500 mx-4 font-medium">or continue with</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Login Options */}
            <View className="flex-row space-x-4 mb-8">
              <TouchableOpacity
                className="flex-1 bg-white border border-gray-200 p-4 rounded-2xl items-center justify-center shadow-sm"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                  <Text className="text-gray-700 font-semibold ml-2">Google</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-1 bg-white border border-gray-200 p-4 rounded-2xl items-center justify-center shadow-sm"
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons name="logo-apple" size={20} color="#000000" />
                  <Text className="text-gray-700 font-semibold ml-2">Apple</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Section */}
          <View className="items-center pt-6 border-t border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-base">Don't have an account? </Text>
              <Link href="/signup" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-emerald-600 font-bold text-base">Sign Up</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View className="mt-4 flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={16} color="#10b981" />
              <Text className="text-gray-500 text-sm ml-2">Your data is safe and secure</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}