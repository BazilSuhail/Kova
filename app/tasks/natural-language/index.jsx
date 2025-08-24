import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import { LinearGradient } from 'expo-linear-gradient';
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
import { useColorScheme } from 'nativewind';

// Custom Header for BottomSheet
const PromptModalHeader = () => (
  <View className="px-6 pt-3 pb-4 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700">
    <View className="flex-row items-center">
      {/* Gradient Icon with LinearGradient */}
      <View className="w-10 h-10 rounded-lg items-center justify-center mr-3 relative overflow-hidden">
        <LinearGradient
          colors={['#10b981', '#059669']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="absolute inset-0 rounded-full"
        />
        <Ionicons name="sparkles" size={16} color="white" />
      </View>

      <View className="flex-1">
        <Text className="text-lg font-semibold text-gray-800 dark:text-white">Create with AI</Text>
        <Text className="text-[11px] text-gray-500 dark:text-gray-400" style={{ marginTop: 1 }}>
          Describe your task in natural language
        </Text>
      </View>
    </View>
  </View>
);

export default function NaturalLanguageTaskScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  
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
      minute: '2-digit',
    });
  };

  // Map category to accent color
  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'academics':
        return { 
          bg: isDark ? 'bg-amber-900/30' : 'bg-amber-100', 
          text: isDark ? 'text-amber-400' : 'text-amber-600' 
        };
      case 'health':
        return { 
          bg: isDark ? 'bg-rose-900/30' : 'bg-rose-100', 
          text: isDark ? 'text-rose-400' : 'text-rose-600' 
        };
      case 'fitness':
        return { 
          bg: isDark ? 'bg-sky-900/30' : 'bg-sky-100', 
          text: isDark ? 'text-sky-400' : 'text-sky-600' 
        };
      case 'personal':
        return { 
          bg: isDark ? 'bg-purple-900/30' : 'bg-purple-100', 
          text: isDark ? 'text-purple-400' : 'text-purple-600' 
        };
      default:
        return { 
          bg: isDark ? 'bg-gray-700' : 'bg-gray-100', 
          text: isDark ? 'text-gray-300' : 'text-gray-600' 
        };
    }
  };

  return (
    <>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor={isDark ? "#030712" : "#FFFFFF"} 
      />
      <View className="flex-1 bg-gray-50 dark:bg-gray-950">
        {/* AI Prompt BottomSheet */}
        <BottomSheet
          visible={showPromptModal}
          onClose={handleCloseModal}
          header={<PromptModalHeader isDark={isDark} />}
          heightRatio={0.55}
      draggableAreaColor={colorScheme === 'dark' ? '#1f2937' : 'white'}  // gray-800 / white
      dragHandleColor={colorScheme === 'dark' ? '#4b5563' : '#ccc'}       // gray-600 / gray
      statusBarColor={colorScheme === 'dark' ? '#00000099' : '#00000066'} // Darker for dark mode
      statusBarStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        >
          <View className="px-6 pt-6 pb-8 flex-1 bg-white dark:bg-gray-800">
            {/* Input Section */}
            <View className="flex-1">
              <View className="relative" style={{ marginBottom: 24 }}>
                <TextInput
                  placeholder="e.g., Buy groceries tomorrow at 5pm, high priority"
                  value={prompt}
                  onChangeText={setPrompt}
                  className="bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-4 pr-12 text-gray-800 dark:text-white text-base border border-gray-100 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500 min-h-[120px]"
                  multiline
                  maxLength={200}
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  textAlignVertical="top"
                />
                <View className="absolute right-4 top-4">
                  <Ionicons 
                    name="chatbubble-ellipses-outline" 
                    size={20} 
                    color={isDark ? "#9CA3AF" : "#6B7280"} 
                  />
                </View>
              </View>

              <View className="flex-row justify-between items-center" style={{ marginBottom: 24 }}>
                <Text className="text-xs text-gray-400 dark:text-gray-500">
                  {prompt.length}/200 characters
                </Text>
                <View className="flex-row items-center">
                  <Ionicons 
                    name="bulb-outline" 
                    size={14} 
                    color={isDark ? "#F59E0B" : "#F59E0B"} 
                  />
                  <Text className="text-xs text-amber-600 dark:text-amber-400 ml-1">
                    Be specific for better results
                  </Text>
                </View>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row" style={{ marginTop: 12 }}>
              <TouchableOpacity
                className="flex-1 bg-gray-50 dark:bg-gray-800 py-4 rounded-2xl items-center border border-gray-200 dark:border-gray-700"
                onPress={handleCloseModal}
                style={{ marginRight: 12 }}
              >
                <Text className="text-gray-600 dark:text-gray-300 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateTask}
                disabled={!prompt.trim()}
                className={`
                  flex-1 flex-row items-center justify-center py-4 rounded-2xl 
                  ${!prompt.trim() 
                    ? 'bg-gray-200 dark:bg-gray-700' 
                    : ''}
                  ml-3
                  overflow-hidden
                `}
              >
                {prompt.trim() && (
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    className="absolute inset-0 rounded-2xl"
                  />
                )}

                <Ionicons
                  name="sparkles"
                  size={18}
                  color={prompt.trim() ? 'white' : (isDark ? '#9CA3AF' : '#6B7280')}
                  className="z-10"
                />
                <Text
                  className={`
                    ml-2 font-semibold z-10
                    ${prompt.trim() ? 'text-white' : (isDark ? 'text-gray-400' : 'text-gray-500')}
                  `}
                >
                  Generate Task
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BottomSheet>

        {/* Loading State */}
        {loading && (
          <Animated.View
            className="flex-1 justify-center items-center px-8 bg-white dark:bg-gray-900"
            style={{ opacity: fadeAnim }}
          >
            <View className="items-center">
              <View
                className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl items-center justify-center border border-emerald-100 dark:border-emerald-800"
                style={{ marginBottom: 24 }}
              >
                <MaterialCommunityIcons 
                  name="brain" 
                  size={40} 
                  color={isDark ? "#34D399" : "#059669"} 
                />
              </View>
              <Text className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                AI is thinking...
              </Text>
              <Text
                className="text-gray-500 dark:text-gray-400 text-center mb-8 leading-6 max-w-xs"
                style={{ marginBottom: 32 }}
              >
                Analyzing your request and creating the perfect task structure
              </Text>
              <ActivityIndicator size="large" color={isDark ? "#34D399" : "#059669"} />

              {/* Progress Steps */}
              <View className="w-full max-w-xs" style={{ marginTop: 32 }}>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-2 h-2 bg-emerald-500 rounded-full" style={{ marginRight: 12 }} />
                  <Text className="text-sm text-gray-600 dark:text-gray-300">
                    Processing natural language
                  </Text>
                </View>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-2 h-2 bg-emerald-300 dark:bg-emerald-600 rounded-full" style={{ marginRight: 12 }} />
                  <Text className="text-sm text-gray-500 dark:text-gray-400">
                    Extracting task details
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <View className="w-2 h-2 bg-gray-300 dark:bg-gray-600 rounded-full" style={{ marginRight: 12 }} />
                  <Text className="text-sm text-gray-400 dark:text-gray-500">
                    Generating final task
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Task Review & Edit Form */}
        {!loading && (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 40 }}
          >
            <View className="px-6 pt-16 pb-8">
              {/* Header */}
              <View
                className="bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl p-6 border border-emerald-100 dark:border-emerald-800"
                style={{ marginBottom: 32 }}
              >
                <View className="flex-row items-center">
                  <View className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl items-center justify-center" style={{ marginRight: 16 }}>
                    <Ionicons 
                      name="checkmark-circle" 
                      size={32} 
                      color={isDark ? "#34D399" : "#059669"} 
                    />
                  </View>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800 dark:text-white">
                      Review Your Task
                    </Text>
                    <Text className="text-gray-500 dark:text-gray-400 text-[12px]">
                      AI has generated your task. Feel free to make any adjustments.
                    </Text>
                  </View>
                </View>
              </View>

              {/* Form Fields */}
              <View>
                <View style={{ marginBottom: 24 }}>
                  <View className="flex-row justify-between items-center" style={{ marginBottom: 12 }}>
                    <View className="flex-row items-center">
                      <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                        <Ionicons 
                          name="bookmark" 
                          size={14} 
                          color={isDark ? "#34D399" : "#059669"} 
                        />
                      </View>
                      <Text className="text-gray-800 dark:text-white font-semibold">Title</Text>
                      <Text className="text-red-400 ml-1">*</Text>
                    </View>

                    <View className="items-center">
                      <View className="flex-row items-center bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-full border border-emerald-100 dark:border-emerald-800">
                        <Ionicons 
                          name="sparkles" 
                          size={14} 
                          color={isDark ? "#34D399" : "#059669"} 
                        />
                        <Text className="text-emerald-700 dark:text-emerald-400 text-sm font-medium ml-2">
                          Generated by AI
                        </Text>
                      </View>
                    </View>
                  </View>

                  <TextInput
                    value={task.title}
                    onChangeText={(text) => setTask({ ...task, title: text })}
                    className="bg-white dark:bg-gray-800 px-4 py-4 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500"
                    placeholder="Enter task title"
                    placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </View>

                {/* Description Field */}
                <View style={{ marginBottom: 24 }}>
                  <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                    <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons 
                        name="document-text" 
                        size={14} 
                        color={isDark ? "#34D399" : "#059669"} 
                      />
                    </View>
                    <Text className="text-gray-800 dark:text-white font-semibold">Description</Text>
                  </View>
                  <TextInput
                    value={task.description}
                    onChangeText={(text) => setTask({ ...task, description: text })}
                    className="bg-white dark:bg-gray-800 px-4 py-4 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500 min-h-[100px]"
                    multiline
                    placeholder="Add more details about your task"
                    placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                    textAlignVertical="top"
                  />
                </View>

                {/* Category and Priority Row */}
                <View className="flex-row" style={{ marginBottom: 24 }}>
                  {/* Category */}
                  <View className="flex-1" style={{ marginRight: 16 }}>
                    <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                      <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                        <Ionicons 
                          name="folder" 
                          size={14} 
                          color={isDark ? "#34D399" : "#059669"} 
                        />
                      </View>
                      <Text className="text-gray-800 dark:text-white font-semibold">Category</Text>
                    </View>
                    <View className="relative">
                      <TextInput
                        value={task.category}
                        onChangeText={(text) => setTask({ ...task, category: text })}
                        className="bg-white dark:bg-gray-800 px-4 py-4 pr-10 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500"
                        placeholder="Select category"
                        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                      />
                      <View className="absolute right-3 top-1/2 -mt-2">
                        <Ionicons 
                          name="chevron-down" 
                          size={16} 
                          color={isDark ? "#9CA3AF" : "#6B7280"} 
                        />
                      </View>
                    </View>
                    {/* Category Accent Pill */}
                    {task.category ? (
                      <View
                        className={`mt-2 px-3 py-1 rounded-full ${getCategoryColor(task.category).bg}`}
                      >
                        <Text
                          className={`text-sm font-medium ${getCategoryColor(task.category).text}`}
                        >
                          {task.category}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Priority */}
                  <View className="flex-1">
                    <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                      <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                        <Ionicons 
                          name="flag" 
                          size={14} 
                          color={isDark ? "#34D399" : "#059669"} 
                        />
                      </View>
                      <Text className="text-gray-800 dark:text-white font-semibold">Priority</Text>
                    </View>
                    <View className="relative">
                      <TextInput
                        value={task.priority}
                        onChangeText={(text) => setTask({ ...task, priority: text })}
                        className="bg-white dark:bg-gray-800 px-4 py-4 pr-10 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500"
                        placeholder="Set priority"
                        placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                      />
                      <View className="absolute right-3 top-1/2 -mt-2">
                        <Ionicons 
                          name="chevron-down" 
                          size={16} 
                          color={isDark ? "#9CA3AF" : "#6B7280"} 
                        />
                      </View>
                    </View>
                  </View>
                </View>

                {/* Due Date Field */}
                <View style={{ marginBottom: 24 }}>
                  <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                    <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons 
                        name="calendar" 
                        size={14} 
                        color={isDark ? "#34D399" : "#059669"} 
                      />
                    </View>
                    <Text className="text-gray-800 dark:text-white font-semibold">Due Date</Text>
                  </View>
                  <TouchableOpacity
                    className="bg-white dark:bg-gray-800 px-4 py-4 rounded-xl border border-gray-200 dark:border-gray-700 flex-row items-center justify-between"
                  >
                    <Text
                      className={`text-base ${task.dueDate 
                        ? 'text-gray-800 dark:text-white' 
                        : (isDark ? 'text-gray-500' : 'text-gray-400')
                      }`}
                    >
                      {task.dueDate ? formatDate(task.dueDate) : 'Select due date'}
                    </Text>
                    <Ionicons 
                      name="calendar-outline" 
                      size={20} 
                      color={isDark ? "#9CA3AF" : "#6B7280"} 
                    />
                  </TouchableOpacity>
                </View>

                {/* Estimated Time Field */}
                <View style={{ marginBottom: 32 }}>
                  <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                    <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                      <Ionicons 
                        name="time" 
                        size={14} 
                        color={isDark ? "#34D399" : "#059669"} 
                      />
                    </View>
                    <Text className="text-gray-800 dark:text-white font-semibold">Estimated Time</Text>
                  </View>
                  <TextInput
                    value={task.estimatedTime}
                    onChangeText={(text) => setTask({ ...task, estimatedTime: text })}
                    className="bg-white dark:bg-gray-800 px-4 py-4 rounded-xl text-base text-gray-800 dark:text-white border border-gray-200 dark:border-gray-700 focus:border-emerald-300 dark:focus:border-emerald-500"
                    placeholder="How long will this take?"
                    placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  />
                </View>
              </View>

              {/* Action Buttons */}
              <View style={{ marginTop: 32 }}>
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-emerald-600 py-4 rounded-xl items-center flex-row justify-center"
                  activeOpacity={0.8}
                  style={{ marginBottom: 16 }}
                >
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text className="text-white text-base font-semibold ml-2">Save Task</Text>
                </TouchableOpacity>

                <View className="flex-row">
                  <TouchableOpacity
                    onPress={handleRegenerate}
                    className="flex-1 bg-white dark:bg-gray-800 py-4 rounded-xl items-center flex-row justify-center border border-gray-200 dark:border-gray-700"
                    style={{ marginRight: 12 }}
                  >
                    <Ionicons 
                      name="refresh" 
                      size={18} 
                      color={isDark ? "#9CA3AF" : "#6B7280"} 
                    />
                    <Text className="text-gray-700 dark:text-gray-300 font-medium ml-2">
                      Regenerate
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleCancel}
                    className="flex-1 bg-white dark:bg-gray-800 py-4 rounded-xl items-center flex-row justify-center border border-gray-200 dark:border-gray-700"
                    style={{ marginLeft: 12 }}
                  >
                    <Ionicons 
                      name="close" 
                      size={18} 
                      color={isDark ? "#9CA3AF" : "#6B7280"} 
                    />
                    <Text className="text-gray-700 dark:text-gray-300 font-medium ml-2">
                      Cancel
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}