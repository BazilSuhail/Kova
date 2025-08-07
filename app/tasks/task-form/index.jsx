import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import CustomDatePicker from '../../../components/tasks/CustomCalendar';

// Category color helper function
const getCategoryColor = (category) => {
  const colors = {
    'Work': { bg: 'bg-blue-100', text: 'text-blue-700' },
    'Personal': { bg: 'bg-green-100', text: 'text-green-700' },
    'Study': { bg: 'bg-purple-100', text: 'text-purple-700' },
    'Health': { bg: 'bg-red-100', text: 'text-red-700' },
    'Finance': { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    'default': { bg: 'bg-gray-100', text: 'text-gray-700' }
  };
  return colors[category] || colors.default;
};

// Format date helper function
const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export default function TaskFormPage() {
  const [task, setTask] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    dueDate: '',
    estimatedTime: ''
  });

  const [loading, setLoading] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  // Handle system back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      router.back();
      return true;
    });

    return () => backHandler.remove();
  }, []);

  const handleSave = () => {
    if (!task.title.trim()) {
      alert('Please enter a task title');
      return;
    }

    setLoading(true);

    // Simulate save operation
    setTimeout(() => {
      console.log('✅ Task Saved:', {
        title: task.title,
        description: task.description,
        category: task.category,
        priority: task.priority,
        dueDate: task.dueDate,
        estimatedTime: task.estimatedTime,
        createdAt: new Date().toISOString()
      });

      setLoading(false);
      alert('Task saved successfully!');
      router.back();
    }, 1000);
  };

  const handleCancel = () => {
    router.back();
  };

  const handleDateSelect = (date) => {
    setTask({ ...task, dueDate: date.toISOString() });
    setCalendarVisible(false);
  };

  const isFormValid = task.title.trim();

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View className="px-6 pt-16 pb-8">
          {/* Header */}
          <View
            className="bg-emerald-50 rounded-2xl p-6 border border-emerald-100"
            style={{ marginBottom: 32 }}
          >
            <View className="flex-row items-center">
              <View className="w-16 h-16 bg-emerald-100 rounded-2xl items-center justify-center" style={{ marginRight: 16 }}>
                <Ionicons name="add-circle" size={32} color="#059669" />
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800">Create New Task</Text>
                <Text className="text-gray-500 text-[12px]">
                  Fill out the details to create your new task.
                </Text>
              </View>
            </View>
          </View>

          {/* Form Fields */}
          <View>
            {/* Title Field */}
            <View style={{ marginBottom: 24 }}>
              <View className="flex-row justify-between items-center" style={{ marginBottom: 12 }}>
                <View className="flex-row items-center">
                  <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                    <Ionicons name="bookmark" size={14} color="#059669" />
                  </View>
                  <Text className="text-gray-800 font-semibold">Title</Text>
                  <Text className="text-red-400 ml-1">*</Text>
                </View>
              </View>

              <TextInput
                value={task.title}
                onChangeText={(text) => setTask({ ...task, title: text })}
                className="bg-white px-4 py-2 rounded-[8px] text-base text-gray-800 border border-gray-200 focus:border-emerald-300"
                placeholder="Enter task title"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Description Field */}
            <View style={{ marginBottom: 24 }}>
              <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                  <Ionicons name="document-text" size={14} color="#059669" />
                </View>
                <Text className="text-gray-800 font-semibold">Description</Text>
              </View>
              <TextInput
                value={task.description}
                onChangeText={(text) => setTask({ ...task, description: text })}
                className="bg-white px-4 py-2 rounded-[8px] text-base text-gray-800 border border-gray-200 focus:border-emerald-300 min-h-[100px]"
                multiline
                placeholder="Add more details about your task"
                placeholderTextColor="#9CA3AF"
                textAlignVertical="top"
              />
            </View>

            {/* Category and Priority Row */}
            <View className="flex-row" style={{ marginBottom: 24 }}>
              {/* Category */}
              <View className="flex-1" style={{ marginRight: 16 }}>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                    <Ionicons name="folder" size={14} color="#059669" />
                  </View>
                  <Text className="text-gray-800 font-semibold">Category</Text>
                </View>
                <View className="relative">
                  <TextInput
                    value={task.category}
                    onChangeText={(text) => setTask({ ...task, category: text })}
                    className="bg-white px-4 py-2 pr-10 rounded-xl text-base text-gray-800 border border-gray-200 focus:border-emerald-300"
                    placeholder="Work, Personal ..."
                    placeholderTextColor="#9CA3AF"
                  />
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
                  <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                    <Ionicons name="flag" size={14} color="#059669" />
                  </View>
                  <Text className="text-gray-800 font-semibold">Priority</Text>
                </View>
                <View className="relative">
                  <TextInput
                    value={task.priority}
                    onChangeText={(text) => setTask({ ...task, priority: text })}
                    className="bg-white px-4 py-2 pr-10 rounded-xl text-base text-gray-800 border border-gray-200 focus:border-emerald-300"
                    placeholder="High, Medium ..."
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            {/* Due Date and Estimated Time Row */}
            <View className="flex-row" style={{ marginBottom: 32 }}>
              {/* Due Date Field */}
              <View className="flex-1" style={{ marginRight: 16 }}>
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                    <Ionicons name="calendar" size={14} color="#059669" />
                  </View>
                  <Text className="text-gray-800 font-semibold">Due Date</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setCalendarVisible(true)}
                  className="bg-white px-4 py-2 rounded-[8px] border border-gray-200 flex-row items-center justify-between"
                >
                  <Text className={`text-base ${task.dueDate ? 'text-gray-800' : 'text-gray-400'}`}>
                    {task.dueDate ? formatDate(task.dueDate) : 'Select due date'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              {/* Estimated Time Field */}
              <View className="flex-1">
                <View className="flex-row items-center" style={{ marginBottom: 12 }}>
                  <View className="w-6 h-6 bg-emerald-100 rounded-lg items-center justify-center" style={{ marginRight: 12 }}>
                    <Ionicons name="time" size={14} color="#059669" />
                  </View>
                  <Text className="text-gray-800 font-semibold">Estimated Time</Text>
                </View>
                <TextInput
                  value={task.estimatedTime}
                  onChangeText={(text) => setTask({ ...task, estimatedTime: text })}
                  className="bg-white px-4 py-2 rounded-[8px] text-base text-gray-800 border border-gray-200 focus:border-emerald-300"
                  placeholder="2 hrs, 30 mins..."
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>
          </View>

<View className="h-[2px] bg-gray-200 w-full rounded-xl"></View>

          {/* Action Buttons Row */}
<View className="flex-row justify-between" style={{ marginTop: 32 }}>
  {/* Save Button */}
  <TouchableOpacity
    onPress={handleSave}
    disabled={!isFormValid || loading}
    className={`flex-1 py-2 rounded-[8px] items-center flex-row justify-center mr-2 ${isFormValid && !loading
      ? 'bg-emerald-600'
      : 'bg-gray-300'
      }`}
    activeOpacity={0.8}
  >
    {loading ? (
      <View className="flex-row items-center">
        <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
        <Text className="text-white text-base font-semibold">Saving...</Text>
      </View>
    ) : (
      <>
        <Ionicons
          name="checkmark-circle"
          size={20}
          color={isFormValid ? "#ffffff" : "#9ca3af"}
        />
        <Text className={`ml-2 text-base font-semibold ${isFormValid ? 'text-white' : 'text-gray-500'
          }`}>
          Save
        </Text>
      </>
    )}
  </TouchableOpacity>

  {/* Cancel Button */}
  <TouchableOpacity
    onPress={handleCancel}
    className="flex-1 bg-white py-2 rounded-[8px] items-center flex-row justify-center border border-gray-200 ml-2"
  >
    <Ionicons name="close" size={18} color="#6B7280" />
    <Text className="text-gray-700 font-medium ml-2">Cancel</Text>
  </TouchableOpacity>
</View>

        </View>
      </ScrollView>

      <CustomDatePicker
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onDateSelect={handleDateSelect}
        initialDate={task.dueDate ? new Date(task.dueDate) : new Date()}
      />
    </View>
  );
}