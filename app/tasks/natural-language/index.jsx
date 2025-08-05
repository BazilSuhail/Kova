import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function NaturalLanguageTaskScreen() {
  const [showPromptModal, setShowPromptModal] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    setShowPromptModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCreateTask = () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setShowPromptModal(false);

    // Simulate task creation from LLM (3 sec)
    setTimeout(() => {
      const dummyTask = {
        title: 'Buy milk and eggs',
        description: 'Go to the store and get groceries for the weekend meal prep.',
        category: 'Personal',
        priority: 'Medium',
        dueDate: '2025-07-23T18:00:00Z',
        estimatedTime: '30 minutes',
      };
      setTask(dummyTask);
      setLoading(false);
    }, 3000);
  };

  const handleSave = () => {
    console.log('✅ Task Saved:', task);
    // Add success animation or navigation here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <KeyboardAvoidingView
        className="flex-1 bg-gray-50"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* AI Prompt Modal */}
        <Modal visible={showPromptModal} animationType="slide" transparent>
          <View className="flex-1 justify-end bg-black/50">
            <View className="bg-white rounded-t-3xl px-6 py-8 max-h-96">
              {/* Modal Header */}
              <View className="items-center mb-6">
                <View className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg">
                  <Ionicons name="sparkles" size={28} color="white" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">Create with AI</Text>
                <Text className="text-gray-500 text-center text-sm leading-5">
                  Describe your task in natural language and let AI do the rest
                </Text>
              </View>

              {/* Input Section */}
              <View className="mb-6">
                <View className="relative">
                  <TextInput
                    placeholder="e.g., Buy groceries tomorrow at 5pm, high priority"
                    value={prompt}
                    onChangeText={setPrompt}
                    className="bg-gray-50 rounded-2xl px-4 py-4 pr-12 text-gray-800 text-base border border-gray-100 focus:border-indigo-300"
                    multiline
                    maxLength={200}
                    placeholderTextColor="#9CA3AF"
                  />
                  <View className="absolute right-4 top-4">
                    <Ionicons name="chatbubble-ellipses-outline" size={20} color="#9CA3AF" />
                  </View>
                </View>
                <Text className="text-xs text-gray-400 mt-2 text-right">
                  {prompt.length}/200
                </Text>
              </View>

              {/* Action Buttons */}
              <View className="flex-row space-x-3">
                <TouchableOpacity
                  className="flex-1 bg-gray-100 py-4 rounded-2xl items-center"
                  onPress={() => setShowPromptModal(false)}
                >
                  <Text className="text-gray-600 font-semibold">Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${
                    prompt.trim() 
                      ? 'bg-indigo-600 shadow-lg shadow-indigo-200' 
                      : 'bg-gray-200'
                  }`}
                  onPress={handleCreateTask}
                  disabled={!prompt.trim()}
                >
                  <Ionicons 
                    name="rocket-outline" 
                    size={18} 
                    color={prompt.trim() ? "white" : "#9CA3AF"} 
                  />
                  <Text className={`font-semibold ml-2 ${
                    prompt.trim() ? 'text-white' : 'text-gray-400'
                  }`}>
                    Generate Task
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Loading State */}
        {loading && (
          <Animated.View 
            className="flex-1 justify-center items-center px-8"
            style={{ opacity: fadeAnim }}
          >
            <View className="items-center">
              {/* Animated Icon Container */}
              <View className="w-24 h-24 bg-indigo-100 rounded-3xl items-center justify-center mb-6 shadow-sm">
                <Ionicons name="brain-outline" size={40} color="#6366f1" />
              </View>
              
              <Text className="text-xl font-bold text-gray-800 mb-2">AI is thinking...</Text>
              <Text className="text-gray-500 text-center mb-8 leading-6">
                Analyzing your request and creating the perfect task structure
              </Text>
              
              <ActivityIndicator size="large" color="#6366f1" />
              
              {/* Progress Steps */}
              <View className="mt-8 space-y-3 w-full max-w-xs">
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-indigo-500 rounded-full mr-3" />
                  <Text className="text-sm text-gray-600">Processing natural language</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-indigo-300 rounded-full mr-3" />
                  <Text className="text-sm text-gray-500">Extracting task details</Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-gray-300 rounded-full mr-3" />
                  <Text className="text-sm text-gray-400">Generating final task</Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Task Review & Edit Form */}
        {!loading && task && (
          <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
            <View className="px-6 pt-16 pb-8">
              {/* Header */}
              <View className="items-center mb-8">
                <View className="w-12 h-12 bg-green-100 rounded-2xl items-center justify-center mb-4">
                  <Ionicons name="checkmark-circle-outline" size={24} color="#16a34a" />
                </View>
                <Text className="text-2xl font-bold text-gray-900 mb-2">Review Your Task</Text>
                <Text className="text-gray-500 text-center">
                  AI has generated your task. Feel free to make any adjustments.
                </Text>
              </View>

              {/* Form Fields */}
              <View className="space-y-5">
                {/* Title Field */}
                <View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="bookmark-outline" size={16} color="#6366f1" />
                    <Text className="text-gray-700 font-medium ml-2">Title</Text>
                  </View>
                  <TextInput
                    value={task.title}
                    onChangeText={(text) => setTask({ ...task, title: text })}
                    className="bg-white px-4 py-4 rounded-2xl text-base text-gray-900 border border-gray-100 focus:border-indigo-300 shadow-sm"
                    placeholder="Enter task title"
                  />
                </View>

                {/* Description Field */}
                <View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="document-text-outline" size={16} color="#6366f1" />
                    <Text className="text-gray-700 font-medium ml-2">Description</Text>
                  </View>
                  <TextInput
                    value={task.description}
                    onChangeText={(text) => setTask({ ...task, description: text })}
                    className="bg-white px-4 py-4 rounded-2xl text-base text-gray-900 border border-gray-100 focus:border-indigo-300 shadow-sm min-h-24"
                    multiline
                    placeholder="Add more details about your task"
                  />
                </View>

                {/* Category and Priority Row */}
                <View className="flex-row space-x-4">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="folder-outline" size={16} color="#6366f1" />
                      <Text className="text-gray-700 font-medium ml-2">Category</Text>
                    </View>
                    <TextInput
                      value={task.category}
                      onChangeText={(text) => setTask({ ...task, category: text })}
                      className="bg-white px-4 py-4 rounded-2xl text-base text-gray-900 border border-gray-100 focus:border-indigo-300 shadow-sm"
                      placeholder="Category"
                    />
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-center mb-2">
                      <Ionicons name="flag-outline" size={16} color="#6366f1" />
                      <Text className="text-gray-700 font-medium ml-2">Priority</Text>
                    </View>
                    <TextInput
                      value={task.priority}
                      onChangeText={(text) => setTask({ ...task, priority: text })}
                      className="bg-white px-4 py-4 rounded-2xl text-base text-gray-900 border border-gray-100 focus:border-indigo-300 shadow-sm"
                      placeholder="Priority"
                    />
                  </View>
                </View>

                {/* Due Date Field */}
                <View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="calendar-outline" size={16} color="#6366f1" />
                    <Text className="text-gray-700 font-medium ml-2">Due Date</Text>
                  </View>
                  <View className="bg-white px-4 py-4 rounded-2xl border border-gray-100 shadow-sm">
                    <Text className="text-base text-gray-900">
                      {formatDate(task.dueDate)}
                    </Text>
                  </View>
                </View>

                {/* Estimated Time Field */}
                <View>
                  <View className="flex-row items-center mb-2">
                    <Ionicons name="time-outline" size={16} color="#6366f1" />
                    <Text className="text-gray-700 font-medium ml-2">Estimated Time</Text>
                  </View>
                  <TextInput
                    value={task.estimatedTime}
                    onChangeText={(text) => setTask({ ...task, estimatedTime: text })}
                    className="bg-white px-4 py-4 rounded-2xl text-base text-gray-900 border border-gray-100 focus:border-indigo-300 shadow-sm"
                    placeholder="How long will this take?"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View className="mt-8 space-y-4">
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-indigo-600 py-4 rounded-2xl items-center flex-row justify-center shadow-lg shadow-indigo-200"
                  activeOpacity={0.8}
                >
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">Save Task</Text>
                </TouchableOpacity>

                <View className="flex-row space-x-4">
                  <TouchableOpacity
                    onPress={() => setShowPromptModal(true)}
                    className="flex-1 bg-gray-50 py-4 rounded-2xl items-center flex-row justify-center border border-gray-200"
                  >
                    <Ionicons name="refresh-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">Regenerate</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    className="flex-1 bg-gray-50 py-4 rounded-2xl items-center flex-row justify-center border border-gray-200"
                  >
                    <Ionicons name="close-outline" size={18} color="#6B7280" />
                    <Text className="text-gray-600 font-medium ml-2">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* AI Credit Footer */}
              <View className="mt-8 items-center">
                <View className="flex-row items-center bg-indigo-50 px-4 py-3 rounded-full">
                  <Ionicons name="sparkles" size={16} color="#6366f1" />
                  <Text className="text-indigo-600 text-sm font-medium ml-2">
                    Generated by AI
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </>
  );
}