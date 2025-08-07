import CustomCalendar from '@/components/tasks/CustomCalendar';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { BackHandler, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Custom Header Component
const CustomHeader = () => (
  <View className="px-6 pt-3 pb-4 border-b border-gray-100">
    <Text className="text-xl font-semibold text-gray-900">Create New Task</Text>
    <Text className="text-sm text-gray-500 mt-1">Fill out the details for your new task</Text>
  </View>
);

// Task Creation Form Component
const TaskCreationForm = ({ onSave }) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    category: '',
    dueDate: '',
  });

  const [loading, setLoading] = useState(false);
  const [calendarVisible, setCalendarVisible] = useState(false);

  const handleCreate = () => {
    if (!task.title.trim() || !task.description.trim()) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSave(task);
    }, 1500);
  };

  const handleDateSelect = (date) => {
    setTask({ ...task, dueDate: date.toISOString() });
    setCalendarVisible(false);
  };

  const isFormValid = task.title.trim() && task.description.trim();

  return (
    <View className="px-6 pt-6 pb-6 flex-1">
      {/* Form Fields */}
      <View className="flex-1 space-y-4" style={{gap:16}}>
        {/* Title Input */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Task Title</Text>
          <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
            <Ionicons name="create-outline" size={20} color="#6b7280" />
            <TextInput
              placeholder="Enter task title..."
              value={task.title}
              onChangeText={(text) => setTask({ ...task, title: text })}
              className="flex-1 ml-3 text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Description Input */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
          <View className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
            <TextInput
              placeholder="Describe your task in detail..."
              value={task.description}
              onChangeText={(text) => setTask({ ...task, description: text })}
              className="text-gray-900 text-base min-h-[80px]"
              multiline
              textAlignVertical="top"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Category Input */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Category</Text>
          <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200 px-4 py-3">
            <Ionicons name="folder-outline" size={20} color="#6b7280" />
            <TextInput
              placeholder="Work, Personal, Study..."
              value={task.category}
              onChangeText={(text) => setTask({ ...task, category: text })}
              className="flex-1 ml-3 text-gray-900 text-base"
              placeholderTextColor="#9ca3af"
            />
          </View>
        </View>

        {/* Due Date Picker */}
        <View>
          <Text className="text-sm font-medium text-gray-700 mb-2">Due Date</Text>
          <TouchableOpacity
            onPress={() => setCalendarVisible(true)}
            className="flex-row items-center justify-between bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 active:bg-gray-100"
          >
            <View className="flex-row items-center">
              <Ionicons name="calendar-outline" size={20} color="#6b7280" />
              <Text className={`ml-3 text-base ${task.dueDate ? 'text-gray-900' : 'text-gray-500'}`}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString('en-US', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'Select due date'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Action Buttons */}
      <View className="pt-4 space-y-3">
        {/* Create Button */}
        <TouchableOpacity
          onPress={handleCreate}
          disabled={!isFormValid || loading}
          className={`py-4 px-6 rounded-xl items-center flex-row justify-center ${
            isFormValid && !loading 
              ? 'bg-indigo-600 active:bg-indigo-700' 
              : 'bg-gray-200'
          }`}
        >
          {loading ? (
            <View className="flex-row items-center">
              <View className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              <Text className="text-white text-base font-semibold">Creating...</Text>
            </View>
          ) : (
            <>
              <Ionicons 
                name="checkmark-circle" 
                size={20} 
                color={isFormValid ? "#ffffff" : "#9ca3af"} 
              />
              <Text className={`ml-2 text-base font-semibold ${
                isFormValid ? 'text-white' : 'text-gray-500'
              }`}>
                Create Task
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Cancel Button */}
        <TouchableOpacity 
          onPress={() => router.back()}
          className="py-3.5 px-6 bg-white border border-gray-300 rounded-xl active:bg-gray-50 items-center"
        >
          <Text className="text-base font-medium text-gray-700">Cancel</Text>
        </TouchableOpacity>
      </View>

      {/* Calendar Modal */}
      <CustomCalendar
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        onDateChange={handleDateSelect}
        selectedDate={task.dueDate ? new Date(task.dueDate) : new Date()}
      />
    </View>
  );
};

export default function TaskFormPage() {
  const [modalVisible, setModalVisible] = useState(true);

  // Handle system back button and modal close
  useEffect(() => {
    if (!modalVisible) return;

    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      setModalVisible(false);
      router.back();
      return true;
    });

    return () => backHandler.remove();
  }, [modalVisible]);

  const handleClose = () => {
    setModalVisible(false);
    router.back();
  };

  const handleSave = (task) => {
    console.log('✅ New Task Created:', task);
    setModalVisible(false);
    router.back();
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Background Content */}
      <View className="flex-1 items-center justify-center px-6">
        <View className="items-center">
          <View className="w-20 h-20 bg-indigo-100 rounded-full items-center justify-center mb-4">
            <Ionicons name="add-circle-outline" size={40} color="#6366f1" />
          </View>
          <Text className="text-2xl font-bold text-gray-900 mb-2">Create New Task</Text>
          <Text className="text-gray-500 text-center max-w-xs">
            Organize your goals and stay productive with structured task management
          </Text>
        </View>
      </View>

      {/* Bottom Sheet Modal */}
      <BottomSheet 
        visible={modalVisible}
        onClose={handleClose}
        header={<CustomHeader />}
        heightRatio={0.85}
      >
        <TaskCreationForm onSave={handleSave} />
      </BottomSheet>
    </View>
  );
}