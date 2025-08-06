import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import { Link } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

// Updated Custom Header with Title + Subtitle
const CustomHeader = () => (
  <View className="px-6 pt-3 pb-4 border-b border-gray-200">
    <Text className="text-lg font-semibold text-gray-800">Create a Task</Text>
    <Text className="text-xs text-gray-500 mt-1">Choose how you'd like to create your task</Text>
  </View>
);

export default function TaskCreationModal({ visible, onClose }) {
  return (
    <BottomSheet 
      visible={visible}
      onClose={onClose}
      header={<CustomHeader />}
      heightRatio={0.55}
    > 
      <View className="px-6 pt-4 pb-6 flex-1">
        {/* Task Options - Manual margin instead of space-y */}
        <View className="flex-1">
          <Link href="/tasks/natural-language" asChild>
            <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-indigo-50 border border-indigo-100 active:opacity-90 mb-3">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="chatbubbles-outline" size={20} color="#6366f1" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">Natural Language</Text>
                <Text className="text-xs text-gray-500 mt-0.5">Describe your task in plain English</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </Link>

          <Link href="/tasks/task-form" asChild>
            <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-emerald-50 border border-emerald-100 active:opacity-90 mb-3">
              <View className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="create-outline" size={20} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">Traditional Form</Text>
                <Text className="text-xs text-gray-500 mt-0.5">Fill out structured task details</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </Link>

          <Link href="/tasks/voice-input" asChild>
            <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-rose-50 border border-rose-100 active:opacity-90">
              <View className="w-10 h-10 bg-rose-100 rounded-full items-center justify-center mr-4">
                <Ionicons name="mic-outline" size={20} color="#e11d48" />
              </View>
              <View className="flex-1">
                <Text className="text-base font-medium text-gray-800">Voice Input</Text>
                <Text className="text-xs text-gray-500 mt-0.5">Speak your task aloud</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#9ca3af" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Cancel Button */}
        <TouchableOpacity 
          onPress={onClose} 
          className="mt-6 py-3.5 px-6 bg-white border border-gray-200 rounded-xl active:bg-gray-50"
        >
          <Text className="text-center text-base font-medium text-gray-700">Cancel</Text>
        </TouchableOpacity>
      </View>  
    </BottomSheet>
  );
}