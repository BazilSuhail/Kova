import { useState } from "react";
import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { Link } from "expo-router";

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = () => {
    if (!name || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    // Your signup logic here
    Alert.alert("Success", `Account created for ${name}`);
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <Text className="text-3xl font-bold text-emerald-600 mb-8 text-center">Create Account</Text>

      <View className="mb-4">
        <Text className="text-gray-700 font-medium mb-2">Full Name</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base"
          placeholder="John Doe"
          value={name}
          onChangeText={setName}
        />
      </View>

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
        onPress={handleSignup}
      >
        <Text className="text-white font-semibold text-lg">Sign Up</Text>
      </TouchableOpacity>

      <View className="flex-row justify-center mt-6">
        <Text className="text-gray-600">Already have an account? </Text>
        <Link href="/login" asChild>
          <TouchableOpacity>
            <Text className="text-emerald-600 font-semibold">Login</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </SafeAreaView>
  );
}
