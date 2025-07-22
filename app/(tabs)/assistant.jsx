import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function AIAssistantScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 24 }}>
        {/* App Label */}
        <View className="mb-4">
          <Text className="text-white bg-indigo-600 px-3 py-1 rounded-full text-sm w-fit font-bold">Alva</Text>
        </View>

        {/* Hero Title */}
        <View className="mb-8">
          <Text className="text-4xl font-extrabold text-gray-900 leading-snug">
            Revolution AI{''}helped with <Text className="text-green-600">Eva</Text>
            {''}Smart AI Assistant{''}With superb <Text className="text-indigo-600">Tech</Text>
          </Text>
        </View>

        {/* Prompt Section Title */}
        <Text className="text-base text-gray-500 mb-4">What can I do for you?</Text>

        {/* Option Cards */}
        <View className="space-y-4">
         <Link href="/assistant/create-sub-tasks">
          <View className="flex-row items-center bg-gray-100 px-4 py-4 rounded-2xl shadow-sm">
            <Ionicons name="list-outline" size={20} color="#4b5563" />
            <Text className="ml-3 text-base font-medium text-gray-800">
              Checklist Generator from Goal Input
            </Text>
          </View>
          </Link>

          <TouchableOpacity className="flex-row items-center bg-gray-100 px-4 py-4 rounded-2xl shadow-sm">
            <Ionicons name="camera-outline" size={20} color="#4b5563" />
            <Text className="ml-3 text-base font-medium text-gray-800">
              Quick Add from Camera or Scans
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center bg-gray-100 px-4 py-4 rounded-2xl shadow-sm">
            <Ionicons name="document-text-outline" size={20} color="#4b5563" />
            <Text className="ml-3 text-base font-medium text-gray-800">
              Auto Notes Summarizer
            </Text>
          </TouchableOpacity>
        </View>

        {/* Auth Buttons */}
        <View className="flex-row justify-between mt-10">
          <TouchableOpacity className="flex-1 py-3 rounded-2xl border border-gray-300 items-center mr-2">
            <Text className="text-gray-700 font-medium">Login</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 py-3 rounded-2xl bg-indigo-600 items-center ml-2">
            <Text className="text-white font-semibold">Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
