import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function AIAssistantScreen() {
   
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 15 }}>
        {/* App Label */}
        <View className="mb-6">
          <Text className="text-white bg-indigo-600 px-4 py-2 rounded-full text-sm font-bold self-start">
            Alva
          </Text>
        </View>

        {/* Hero Title */}
        <View className="mb-8">
          <Text className="text-4xl font-extrabold text-gray-900 leading-tight">
            Revolution AI helped with{' '}
            <Text className="text-green-500">Eva</Text>
            {' '}Smart AI Assistant{' '}
            <Text className="text-indigo-600">With superb Tech</Text>
          </Text>
        </View>

        {/* Prompt Section Title */}
        <Text className="text-lg text-gray-600 mb-6 font-medium">What can I do for you?</Text>

        {/* Option Cards */}
        <View className="space-y-4 mb-8">
          <Link href="/assistant/create-sub-tasks" asChild>
            <TouchableOpacity className="flex-row items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100" activeOpacity={0.7}>
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-indigo-50 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="list-outline" size={24} color="#6366f1" />
                </View>
                <Text className="text-base font-semibold text-gray-800 flex-1">
                  Checklist Generator from Goal Input
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link>

          <Link href="/assistant/image-to-tasks" asChild>
            <TouchableOpacity className="flex-row items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100" activeOpacity={0.7}>
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-green-50 rounded-xl items-center justify-center mr-4">
                  <Ionicons name="camera-outline" size={24} color="#10b981" />
                </View>
                <Text className="text-base font-semibold text-gray-800 flex-1">
                  Quick Add from Camera or gallery
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link> 

          <TouchableOpacity className="flex-row items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100" activeOpacity={0.7}>
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-purple-50 rounded-xl items-center justify-center mr-4">
                <Ionicons name="document-text-outline" size={24} color="#8b5cf6" />
              </View>
              <Text className="text-base font-semibold text-gray-800 flex-1">
                Auto Notes Summarizer
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center justify-between bg-white px-5 py-4 rounded-2xl shadow-sm border border-gray-100" activeOpacity={0.7}>
            <View className="flex-row items-center flex-1">
              <View className="w-12 h-12 bg-orange-50 rounded-xl items-center justify-center mr-4">
                <Ionicons name="bulb-outline" size={24} color="#f59e0b" />
              </View>
              <Text className="text-base font-semibold text-gray-800 flex-1">
                Smart Task Suggestions
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Auth Buttons */}
        <View className="flex-row space-x-3">
          <TouchableOpacity
            className="flex-1 py-4 rounded-2xl border-2 border-gray-200 items-center bg-white"
            activeOpacity={0.8}
          >
            <Text className="text-gray-700 font-semibold text-base">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="flex-1 py-4 rounded-2xl bg-indigo-600 items-center shadow-lg"
            activeOpacity={0.8}
          >
            <Text className="text-white font-semibold text-base">Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}