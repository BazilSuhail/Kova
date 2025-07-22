import {View, Modal, Text, TouchableOpacity,  } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

export default function TaskCreationModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 justify-end bg-black/30">
        <View className="bg-white rounded-t-3xl p-6 space-y-4">
          <Text className="text-xl font-bold text-gray-800 mb-2">Create a Task</Text>

          <Link href="/tasks/natural-language" asChild>
            <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-gray-50">
              <Ionicons name="chatbubbles-outline" size={22} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-800">Natural Language k</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/tasks/new/manual" asChild>
            <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-gray-50">
              <Ionicons name="create-outline" size={22} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-800">Traditional Form</Text>
            </TouchableOpacity>
          </Link>

          <Link href="/tasks/voice-input" asChild>
            <TouchableOpacity className="flex-row items-center p-4 rounded-xl bg-gray-50">
              <Ionicons name="mic-outline" size={22} color="#6366f1" />
              <Text className="ml-3 text-base text-gray-800">Voice Input</Text>
            </TouchableOpacity>
          </Link>

          <TouchableOpacity onPress={onClose} className="mt-6">
            <Text className="text-center text-sm text-gray-500">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
