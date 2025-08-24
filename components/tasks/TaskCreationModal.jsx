// TaskCreationModal.js
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import TaskFormPage from './TaskFormPage';

const CustomHeader = ({ title, subtitle }) => (
  <View className="px-6 pt-3 pb-4 border-b border-gray-200 dark:border-gray-700">
    <Text className="text-lg font-semibold text-gray-800 dark:text-gray-200">{title}</Text>
    {subtitle ? (
      <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subtitle}</Text>
    ) : null}
  </View>
);

export default function TaskCreationModal({ visible, onClose }) {
  const { colorScheme } = useColorScheme();
  const [showForm, setShowForm] = useState(false);

  return (
    <BottomSheet
      visible={visible}
      onClose={() => {
        setShowForm(false); // reset when closing
        onClose();
      }}
      header={
        showForm ?
          <View></View>
          : (
            <CustomHeader
              title="Create a Task"
              subtitle="Choose how you'd like to create your task"
            />
          )

      }
      heightRatio={showForm ? 0.75 : 0.55}
      draggableAreaColor={colorScheme === 'dark' ? '#1f2937' : 'white'}
      dragHandleColor={colorScheme === 'dark' ? '#4b5563' : '#ccc'}
      statusBarColor={colorScheme === 'dark' ? '#070A10' : '#00000066'}
      statusBarStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
    >
      {showForm ? (
        <TaskFormPage onBack={() => setShowForm(false)} />
      ) : (
        <View className="dark:bg-gray-800 px-6 pt-4 pb-6 flex-1">
          {/* Options list */}
          <View className="flex-1">
            <Link href="/tasks/natural-language" asChild>
              <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 mb-3">
                <View className="w-10 h-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-full items-center justify-center mr-4">
                  <Ionicons name="chatbubbles-outline" size={20} color={colorScheme === 'dark' ? "#818cf8" : "#6366f1"} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800 dark:text-gray-200">Natural Language</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Describe your task in plain English</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </Link>

            <TouchableOpacity
              onPress={() => setShowForm(true)}
              className="flex-row items-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 mb-3"
            >
              <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mr-4">
                <Ionicons name="create-outline" size={20} color={colorScheme === 'dark' ? "#34d399" : "#059669"} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800 dark:text-gray-200">Traditional Form</Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Fill out structured task details</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>

            <Link href="/tasks/voice-input" asChild>
              <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800">
                <View className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-full items-center justify-center mr-4">
                  <Ionicons name="mic-outline" size={20} color={colorScheme === 'dark' ? "#f87171" : "#e11d48"} />
                </View>
                <View className="flex-1">
                  <Text className="text-base font-medium text-gray-800 dark:text-gray-200">Voice Input</Text>
                  <Text className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Speak your task aloud</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
              </TouchableOpacity>
            </Link>
          </View>

          {/* Cancel */}
          <TouchableOpacity
            onPress={onClose}
            className="mt-6 py-3.5 px-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
          >
            <Text className="text-center text-base font-medium text-gray-700 dark:text-gray-300">Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </BottomSheet>
  );
}