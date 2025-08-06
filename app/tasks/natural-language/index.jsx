import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  BackHandler,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Custom Header for BottomSheet
const PromptModalHeader = () => (
  <View className="px-6 pt-3 pb-4 border-b border-gray-100">
    <View className="flex-row items-center">
      <View className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg items-center justify-center mr-3">
        <Ionicons name="sparkles" size={16} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-900">Create with AI</Text>
        <Text className="text-sm text-gray-500">Describe your task in natural language</Text>
      </View>
    </View>
  </View>
);

export default function NaturalLanguageTaskScreen() {
  const [showPromptModal, setShowPromptModal] = useState(true);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [task, setTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    dueDate: '',
    estimatedTime: '',
  });
  const [fadeAnim] = useState(new Animated.Value(0));

  // Handle hardware back button
  useEffect(() => {
    const backAction = () => {
      if (showPromptModal || loading) {
        router.back();
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  }, [showPromptModal, loading]);

  useEffect(() => {
    setShowPromptModal(true);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleCloseModal = useCallback(() => {
    router.back();
  }, []);

  const handleCreateTask = useCallback(() => {
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
        dueDate: '2025-08-10T18:00:00Z',
        estimatedTime: '30 minutes',
      };
      setTask(dummyTask);
      setLoading(false);
    }, 3000);
  }, [prompt]);

  const handleSave = useCallback(() => {
    console.log('✅ Task Saved:', task);
    router.back();
  }, [task]);

  const handleRegenerate = useCallback(() => {
    setTask({
      title: '',
      description: '',
      category: '',
      priority: '',
      dueDate: '',
      estimatedTime: '',
    });
    setPrompt('');
    setShowPromptModal(true);
  }, []);

  const handleCancel = useCallback(() => {
    router.back();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return '';
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View className="flex-1 bg-white">
        {/* AI Prompt BottomSheet */}
        <BottomSheet 
          visible={showPromptModal}
          onClose={handleCloseModal}
          header={<PromptModalHeader />}
          heightRatio={0.6}
        >
          <View className="px-6 pt-6 pb-8 flex-1">
            {/* Input Section */}
            <View className="flex-1">
              <View className="relative mb-6">
                <TextInput
                  placeholder="e.g., Buy groceries tomorrow at 5pm, high priority"
                  value={prompt}
                  onChangeText={setPrompt}
                  className="bg-gray-50 rounded-2xl px-4 py-4 pr-12 text-gray-800 text-base border border-gray-100 focus:border-indigo-300 min-h-[120px]"
                  multiline
                  maxLength={200}
                  placeholderTextColor="#9CA3AF"
                  textAlignVertical="top"
                />
                <View className="absolute right-4 top-4">
                  <Ionicons name="chatbubble-ellipses-outline" size={20} color="#9CA3AF" />
                </View>
              </View>
              
              <View className="flex-row justify-between items-center mb-6">
                <Text className="text-xs text-gray-400">
                  {prompt.length}/200 characters
                </Text>
                <View className="flex-row items-center">
                  <Ionicons name="bulb-outline" size={14} color="#F59E0B" />
                  <Text className="text-xs text-amber-600 ml-1">Be specific for better results</Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row space-x-3">
              <TouchableOpacity
                className="flex-1 bg-gray-50 py-4 rounded-2xl items-center border border-gray-200"
                onPress={handleCloseModal}
              >
                <Text className="text-gray-600 font-semibold">Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                className={`flex-1 py-4 rounded-2xl items-center flex-row justify-center ${
                  prompt.trim() 
                    ? 'bg-indigo-600' 
                    : 'bg-gray-200'
                }`}
                onPress={handleCreateTask}
                disabled={!prompt.trim()}
              >
                <Ionicons 
                  name="sparkles" 
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
        </BottomSheet>

        {/* Loading State */}
        {loading && (
          <Animated.View 
            className="flex-1 justify-center items-center px-8 bg-white"
            style={{ opacity: fadeAnim }}
          >
            <View className="items-center">
              {/* Animated Icon Container */}
              <View className="w-24 h-24 bg-indigo-50 rounded-3xl items-center justify-center mb-6 border border-indigo-100">
                <Ionicons name="brain-outline" size={40} color="#6366f1" />
              </View>
              
              <Text className="text-2xl font-bold text-gray-900 mb-2">AI is thinking...</Text>
              <Text className="text-gray-500 text-center mb-8 leading-6 max-w-xs">
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
        {!loading && (
          <ScrollView 
            className="flex-1 bg-gray-50" 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="px-6 pt-16 pb-8">
              {/* Header */}
              <View className="bg-green-50 rounded-2xl p-6 mb-8 border border-green-100">
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-green-100 rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="checkmark-circle" size={32} color="#16a34a" />
                  </View>
                  <View className="flex-col flex-1">
                    <Text className="text-2xl font-bold text-gray-900 mb-2">Review Your Task</Text>
                    <Text className="text-gray-600">
                      AI has generated your task. Feel free to make any adjustments.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Form Fields */}
              <View className="space-y-6">
                {/* Title Field */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-6 h-6 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="bookmark" size={14} color="#6366f1" />
                    </View>
                    <Text className="text-gray-700 font-semibold">Title</Text>
                    <Text className="text-red-400 ml-1">*</Text>
                  </View>
                  <TextInput
                    value={task.title}
                    onChangeText={(text) => setTask({ ...task, title: text })}
                    className="bg-white px-4 py-4 rounded-xl text-base text-gray-900 border border-gray-200 focus:border-indigo-300"
                    placeholder="Enter task title"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>

                {/* Description Field */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-6 h-6 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="document-text" size={14} color="#6366f1" />
                    </View>
                    <Text className="text-gray-700 font-semibold">Description</Text>
                  </View>
                  <TextInput
                    value={task.description}
                    onChangeText={(text) => setTask({ ...task, description: text })}
                    className="bg-white px-4 py-4 rounded-xl text-base text-gray-900 border border-gray-200 focus:border-indigo-300 min-h-[100px]"
                    multiline
                    placeholder="Add more details about your task"
                    placeholderTextColor="#9CA3AF"
                    textAlignVertical="top"
                  />
                </View>

                {/* Category and Priority Row */}
                <View className="flex-row space-x-4">
                  <View className="flex-1">
                    <View className="flex-row items-center mb-3">
                      <View className="w-6 h-6 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                        <Ionicons name="folder" size={14} color="#6366f1" />
                      </View>
                      <Text className="text-gray-700 font-semibold">Category</Text>
                    </View>
                    <View className="relative">
                      <TextInput
                        value={task.category}
                        onChangeText={(text) => setTask({ ...task, category: text })}
                        className="bg-white px-4 py-4 pr-10 rounded-xl text-base text-gray-900 border border-gray-200 focus:border-indigo-300"
                        placeholder="Select category"
                        placeholderTextColor="#9CA3AF"
                      />
                      <View className="absolute right-3 top-1/2 -mt-2">
                        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                      </View>
                    </View>
                  </View>
                  
                  <View className="flex-1">
                    <View className="flex-row items-center mb-3">
                      <View className="w-6 h-6 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                        <Ionicons name="flag" size={14} color="#6366f1" />
                      </View>
                      <Text className="text-gray-700 font-semibold">Priority</Text>
                    </View>
                    <View className="relative">
                      <TextInput
                        value={task.priority}
                        onChangeText={(text) => setTask({ ...task, priority: text })}
                        className="bg-white px-4 py-4 pr-10 rounded-xl text-base text-gray-900 border border-gray-200 focus:border-indigo-300"
                        placeholder="Set priority"
                        placeholderTextColor="#9CA3AF"
                      />
                      <View className="absolute right-3 top-1/2 -mt-2">
                        <Ionicons name="chevron-down" size={16} color="#9CA3AF" />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Due Date Field */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-6 h-6 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="calendar" size={14} color="#6366f1" />
                    </View>
                    <Text className="text-gray-700 font-semibold">Due Date</Text>
                  </View>
                  <TouchableOpacity className="bg-white px-4 py-4 rounded-xl border border-gray-200 flex-row items-center justify-between">
                    <Text className={`text-base ${task.dueDate ? 'text-gray-900' : 'text-gray-400'}`}>
                      {task.dueDate ? formatDate(task.dueDate) : 'Select due date'}
                    </Text>
                    <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                  </TouchableOpacity>
                </View>

                {/* Estimated Time Field */}
                <View>
                  <View className="flex-row items-center mb-3">
                    <View className="w-6 h-6 bg-indigo-100 rounded-lg items-center justify-center mr-3">
                      <Ionicons name="time" size={14} color="#6366f1" />
                    </View>
                    <Text className="text-gray-700 font-semibold">Estimated Time</Text>
                  </View>
                  <TextInput
                    value={task.estimatedTime}
                    onChangeText={(text) => setTask({ ...task, estimatedTime: text })}
                    className="bg-white px-4 py-4 rounded-xl text-base text-gray-900 border border-gray-200 focus:border-indigo-300"
                    placeholder="How long will this take?"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View className="mt-8 space-y-4">
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-indigo-600 py-4 rounded-xl items-center flex-row justify-center"
                  activeOpacity={0.8}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">Save Task</Text>
                </TouchableOpacity>

                <View className="flex-row space-x-3">
                  <TouchableOpacity
                    onPress={handleRegenerate}
                    className="flex-1 bg-white py-4 rounded-xl items-center flex-row justify-center border border-gray-200"
                  >
                    <Ionicons name="refresh" size={18} color="#6B7280" />
                    <Text className="text-gray-700 font-medium ml-2">Regenerate</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="flex-1 bg-white py-4 rounded-xl items-center flex-row justify-center border border-gray-200"
                  >
                    <Ionicons name="close" size={18} color="#6B7280" />
                    <Text className="text-gray-700 font-medium ml-2">Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* AI Credit Footer */}
              <View className="mt-8 items-center">
                <View className="flex-row items-center bg-indigo-50 px-4 py-3 rounded-full border border-indigo-100">
                  <Ionicons name="sparkles" size={16} color="#6366f1" />
                  <Text className="text-indigo-700 text-sm font-medium ml-2">
                    Generated by AI
                  </Text>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}