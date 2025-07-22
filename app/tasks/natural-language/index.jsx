import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function NaturalLanguageTaskScreen() {
  const [showPromptModal, setShowPromptModal] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);

  useEffect(() => {
    // Automatically open prompt modal
    setShowPromptModal(true);
  }, []);

  const handleCreateTask = () => {
    setLoading(true);
    setShowPromptModal(false);

    // Simulate task creation from LLM (3 sec)
    setTimeout(() => {
      const dummyTask = {
        title: 'Buy milk and eggs',
        description: 'Go to the store and get groceries.',
        category: 'Personal',
        dueDate: '2025-07-23T18:00:00Z',
      };
      setTask(dummyTask);
      setLoading(false);
    }, 3000);
  };

  const handleSave = () => {
    console.log('✅ Task Saved:', task);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f9fafb' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Modal Prompt for Natural Language */}
      <Modal visible={showPromptModal} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/30">
          <View className="bg-white rounded-t-3xl p-6 space-y-4">
            <Text className="text-xl font-bold text-gray-800">Create a Task with AI</Text>
            <TextInput
              placeholder="e.g. Buy milk and eggs tomorrow at 5pm"
              value={prompt}
              onChangeText={setPrompt}
              className="bg-gray-100 rounded-xl p-4 text-gray-800 text-base"
              multiline
            />
            <TouchableOpacity
              className="bg-indigo-600 py-3 rounded-2xl items-center"
              onPress={handleCreateTask}
              disabled={!prompt.trim()}
            >
              <Text className="text-white font-semibold">Create Task</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Loader */}
      {loading && (
        <View className="flex-1 justify-center items-center">
          <Ionicons name="cloud-upload-outline" size={40} color="#6366f1" />
          <Text className="mt-4 text-lg font-semibold text-gray-700">Creating Task...</Text>
          <ActivityIndicator size="large" color="#6366f1" className="mt-4" />
        </View>
      )}

      {/* Task Detail Form */}
      {!loading && task && (
        <View className="flex-1 p-6">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Review & Edit Task</Text>

          <Text className="text-gray-600 mb-1">Title</Text>
          <TextInput
            value={task.title}
            onChangeText={(text) => setTask({ ...task, title: text })}
            className="bg-white p-4 rounded-xl mb-4 text-base text-gray-900 shadow-sm shadow-gray-200"
          />

          <Text className="text-gray-600 mb-1">Description</Text>
          <TextInput
            value={task.description}
            onChangeText={(text) => setTask({ ...task, description: text })}
            className="bg-white p-4 rounded-xl mb-4 text-base text-gray-900 shadow-sm shadow-gray-200"
            multiline
          />

          <Text className="text-gray-600 mb-1">Category</Text>
          <TextInput
            value={task.category}
            onChangeText={(text) => setTask({ ...task, category: text })}
            className="bg-white p-4 rounded-xl mb-4 text-base text-gray-900 shadow-sm shadow-gray-200"
          />

          <Text className="text-gray-600 mb-1">Due Date</Text>
          <TextInput
            value={task.dueDate}
            onChangeText={(text) => setTask({ ...task, dueDate: text })}
            className="bg-white p-4 rounded-xl mb-6 text-base text-gray-900 shadow-sm shadow-gray-200"
          />

          <TouchableOpacity
            onPress={handleSave}
            className="bg-green-600 py-4 rounded-2xl items-center"
          >
            <Text className="text-white text-base font-semibold">Save Task</Text>
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
