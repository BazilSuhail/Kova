import { useState, useRef, useEffect } from "react";
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { Link } from "expo-router";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);

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

  useEffect(() => {
    // Calculate password strength
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(strength);
  }, [password]);

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return 'bg-red-500';
    if (passwordStrength < 75) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return 'Weak';
    if (passwordStrength < 50) return 'Fair';
    if (passwordStrength < 75) return 'Good';
    return 'Strong';
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert("Missing Information", "Please fill in all fields to continue.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match. Please try again.");
      return;
    }

    if (passwordStrength < 50) {
      Alert.alert("Weak Password", "Please choose a stronger password with at least 8 characters, including uppercase, lowercase, and numbers.");
      return;
    }

    if (!acceptTerms) {
      Alert.alert("Terms Required", "Please accept the Terms of Service and Privacy Policy to continue.");
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert("Welcome! 🎉", `Account successfully created for ${name}. Please check your email to verify your account.`);
    }, 2000);
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
          className="flex-1 px-6 pt-8 pb-8"
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          {/* Header Section */}
          <View className="items-center mb-8">
            {/* App Icon */}
            <View className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-3xl items-center justify-center mb-6 shadow-lg shadow-emerald-200">
              <Ionicons name="person-add-outline" size={32} color="white" />
            </View>

            <Text className="text-4xl font-bold text-gray-800 mb-3">Create Account</Text>
            <Text className="text-gray-500 text-center text-lg leading-6 max-w-sm">
              Join us today and start your amazing journey
            </Text>
          </View>

          {/* Form Section */}
          <View className="flex-1">
            {/* Full Name Input */}
            <View className="mb-5">
              <Text className="text-gray-700 font-semibold mb-3 text-base">Full Name</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="person-outline" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="bg-white border border-gray-200 rounded-2xl pl-12 pr-4 py-4 text-base text-gray-800 shadow-sm"
                  placeholder="John Doe"
                  placeholderTextColor="#9CA3AF"
                  autoComplete="name"
                  value={name}
                  onChangeText={setName}
                  style={{ fontSize: 16 }}
                />
              </View>
            </View>

            {/* Email Input */}
            <View className="mb-5">
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
            <View className="mb-4">
              <Text className="text-gray-700 font-semibold mb-3 text-base">Password</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="lock-closed-outline" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="bg-white border border-gray-200 rounded-2xl pl-12 pr-14 py-4 text-base text-gray-800 shadow-sm"
                  placeholder="Create a strong password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showPassword}
                  autoComplete="new-password"
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

              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <View className="mt-3">
                  <View className="flex-row justify-between items-center mb-2">
                    <Text className="text-sm text-gray-600">Password Strength</Text>
                    <Text className={`text-sm font-medium ${passwordStrength < 50 ? 'text-red-600' :
                        passwordStrength < 75 ? 'text-yellow-600' : 'text-emerald-600'
                      }`}>
                      {getPasswordStrengthText()}
                    </Text>
                  </View>
                  <View className="w-full bg-gray-200 rounded-full h-2">
                    <View
                      className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                      style={{ width: `${passwordStrength}%` }}
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Confirm Password Input */}
            <View className="mb-6">
              <Text className="text-gray-700 font-semibold mb-3 text-base">Confirm Password</Text>
              <View className="relative">
                <View className="absolute left-4 top-4 z-10">
                  <Ionicons name="checkmark-circle-outline" size={20} color="#6B7280" />
                </View>
                <TextInput
                  className="bg-white border border-gray-200 rounded-2xl pl-12 pr-14 py-4 text-base text-gray-800 shadow-sm"
                  placeholder="Confirm your password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  style={{ fontSize: 16 }}
                />
                <TouchableOpacity
                  className="absolute right-4 top-4"
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color="#6B7280"
                  />
                </TouchableOpacity>
              </View>

              {/* Password Match Indicator */}
              {confirmPassword.length > 0 && (
                <View className="mt-2 flex-row items-center">
                  <Ionicons
                    name={password === confirmPassword ? "checkmark-circle" : "close-circle"}
                    size={16}
                    color={password === confirmPassword ? "#10b981" : "#ef4444"}
                  />
                  <Text className={`text-sm ml-2 ${password === confirmPassword ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                    {password === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                  </Text>
                </View>
              )}
            </View>

            {/* Terms and Conditions */}
            <TouchableOpacity
              className="flex-row items-start mb-8"
              onPress={() => setAcceptTerms(!acceptTerms)}
              activeOpacity={0.7}
            >
              <View className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 items-center justify-center ${acceptTerms ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'
                }`}>
                {acceptTerms && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <View className="flex-1">
                <Text className="text-gray-600 text-sm leading-5">
                  I agree to the{' '}
                  <Text className="text-emerald-600 font-semibold">Terms of Service</Text>
                  {' '}and{' '}
                  <Text className="text-emerald-600 font-semibold">Privacy Policy</Text>
                </Text>
              </View>
            </TouchableOpacity>

            {/* Signup Button */}
            <TouchableOpacity
              className={`p-4 rounded-2xl items-center justify-center shadow-lg shadow-emerald-200 ${isLoading ? 'bg-emerald-400' : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                }`}
              activeOpacity={0.9}
              onPress={handleSignup}
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
                    <Text className="text-white font-bold text-lg">Creating Account...</Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="person-add" size={20} color="white" />
                    <Text className="text-white font-bold text-lg ml-2">Create Account</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            {/* Divider */}
            <View className="flex-row items-center my-6">
              <View className="flex-1 h-px bg-gray-200" />
              <Text className="text-gray-500 mx-4 font-medium">or sign up with</Text>
              <View className="flex-1 h-px bg-gray-200" />
            </View>

            {/* Social Signup Options */}
            <View className="flex-row space-x-4 mb-6">
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

          {/* Login Section */}
          <View className="items-center pt-6 border-t border-gray-100">
            <View className="flex-row items-center">
              <Text className="text-gray-500 text-base">Already have an account? </Text>
              <Link href="/login" asChild>
                <TouchableOpacity activeOpacity={0.7}>
                  <Text className="text-emerald-600 font-bold text-base">Sign In</Text>
                </TouchableOpacity>
              </Link>
            </View>

            <View className="mt-4 flex-row items-center">
              <Ionicons name="shield-checkmark-outline" size={16} color="#10b981" />
              <Text className="text-gray-500 text-sm ml-2">We protect your privacy and data</Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}