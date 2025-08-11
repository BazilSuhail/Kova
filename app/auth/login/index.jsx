import { useState } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { Link } from "expo-router";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    // Your login logic here
    Alert.alert("Success", `Logged in as ${email}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-emerald-600 mb-8 text-center">Welcome Back</Text>

      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-2">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-700 font-medium mb-2">Password</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="••••••••"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <TouchableOpacity
        className="bg-emerald-500 p-4 rounded-xl items-center"
        activeOpacity={0.8}
        onPress={handleLogin}
      >
        <Text className="text-white font-semibold text-lg">Login</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Don't have an account? </Text>
        <Link href="/signup" asChild>
          <TouchableOpacity>
            <Text className="text-emerald-600 font-semibold">Sign Up</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
