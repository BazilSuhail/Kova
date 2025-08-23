import CustomDatePicker from '@/components/tasks/CustomCalendar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from 'nativewind';

// Mock task data
const initialTask = {
  id: 'task_001',
  title: 'Finish AI Report',
  description: 'Summarize case studies and finalize references for the comprehensive artificial intelligence research project.',
  category: 'Academics',
  dueDate: '2025-07-22T18:00:00Z',
  isCompleted: false,
  priority: 'High',
  checklist: [
    { id: '1', title: 'Complete draft', done: true },
    { id: '2', title: 'Revise figures and charts', done: false },
    { id: '3', title: 'Finalize references', done: false },
    { id: '4', title: 'Submit PDF', done: false },
  ],
};

const Card = ({ children, style = {} }) => (
  <View className="bg-white dark:bg-gray-800 rounded-2xl p-5 mb-4 shadow-sm dark:shadow-gray-900/20 border border-gray-100 dark:border-gray-700">
    {children}
  </View>
);

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700";
      case "medium":
        return "bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700";
      case "low":
        return "bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700";
      default:
        return "bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600";
    }
  };

  const getTextClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-700 dark:text-red-400";
      case "medium":
        return "text-yellow-700 dark:text-yellow-400";
      case "low":
        return "text-blue-700 dark:text-blue-400";
      default:
        return "text-gray-500 dark:text-gray-400";
    }
  };

  return (
    <View className={`px-3 py-1.5 rounded-full self-start ${getPriorityClasses(priority)}`}>
      <Text className={`text-[10px] font-semibold uppercase tracking-[0.5px] ${getTextClasses(priority)}`}>
        {priority} Priority
      </Text>
    </View>
  );
};

// Progress Bar Component
const ProgressBar = ({ completed, total }) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View>
      <View className="flex-row justify-between items-center mb-2">
        <Text className="text-sm font-medium text-gray-600 dark:text-gray-300">
          Progress
        </Text>
        <Text className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
          {completed}/{total} completed
        </Text>
      </View>
      <View className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <View 
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
};

export default function TaskDetailsScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [task, setTask] = useState(initialTask);
  const [completed, setCompleted] = useState(task.isCompleted);
  const [checklist, setChecklist] = useState(task.checklist);
  const [hasChanged, setHasChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    dueDate: new Date(task.dueDate),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  const toggleChecklistItem = (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    setHasChanged(true);
  };

  const handleUpdateTask = () => {
    const updatedTask = {
      ...task,
      title: editData.title,
      description: editData.description,
      dueDate: editData.dueDate.toISOString(),
      isCompleted: completed,
      checklist: checklist,
    };

    setTask(updatedTask);
    console.log('Updated task:', updatedTask);
    setIsEditing(false);
    setHasChanged(false);
    Alert.alert('Success', 'Task updated successfully!');
  };

  const handleDateSelect = (selectedDate) => {
    setEditData({ ...editData, dueDate: selectedDate });
    setHasChanged(true);
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const completedItems = checklist.filter(item => item.done).length;

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerStyle={{ 
        paddingBottom: insets.bottom + 40, 
        paddingHorizontal: 20, 
        paddingTop: insets.top + 20 
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-6">
        <View className="flex-row justify-between items-start mb-3" style={{ gap: 12 }}>
          {isEditing ? (
            <TextInput
              className="flex-1 mr-4 px-4 py-3 text-lg font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-400 dark:border-emerald-600 rounded-lg bg-white dark:bg-gray-800"
              value={editData.title}
              onChangeText={(text) => {
                setEditData({ ...editData, title: text });
                setHasChanged(true);
              }}
              placeholder="Task title"
              placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
              multiline
            />
          ) : (
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900 dark:text-white leading-7">
                {task.title}
              </Text>
            </View>
          )}

          <TouchableOpacity className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 items-center justify-center shadow-sm dark:shadow-gray-900/20 border border-gray-200 dark:border-gray-700">
            <Ionicons 
              name="bookmark-outline" 
              size={20} 
              color={isDark ? "#34D399" : "#059669"} 
            />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center border-t border-gray-200 dark:border-gray-700 pt-4">
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <View className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1.5 rounded-full">
              <Text className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold">
                {task.category}
              </Text>
            </View>
            <PriorityBadge priority={task.priority} />
          </View>
        </View>
      </View>

      {/* Progress Card */}
      <Card>
        <ProgressBar completed={completedItems} total={checklist.length} />
      </Card>

      {/* Description Card */}
      <Card>
        <View className="flex-row items-center mb-3">
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={isDark ? "#34D399" : "#059669"} 
          />
          <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
            Description
          </Text>
        </View>

        {isEditing ? (
          <TextInput
            className="text-sm text-gray-700 dark:text-gray-300 border border-emerald-400 dark:border-emerald-600 rounded-lg p-3 min-h-[80px] bg-white dark:bg-gray-800"
            style={{ lineHeight: 20 }}
            multiline
            value={editData.description}
            onChangeText={(text) => {
              setEditData({ ...editData, description: text });
              setHasChanged(true);
            }}
            placeholder="Add a description..."
            placeholderTextColor={isDark ? "#4B5563" : "#9CA3AF"}
          />
        ) : (
          <Text className="text-sm text-gray-600 dark:text-gray-300" style={{ lineHeight: 20 }}>
            {task.description}
          </Text>
        )}

        <View className="flex-row items-center mt-4 pt-4 border-t border-emerald-100 dark:border-emerald-900/30">
          <Ionicons 
            name="calendar-outline" 
            size={16} 
            color={isDark ? "#34D399" : "#059669"} 
          />
          {isEditing ? (
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text className="ml-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-400 dark:border-emerald-600 rounded-md px-2 py-1">
                Due: {formatDate(editData.dueDate)}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">
              Due: {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
      </Card>

      {/* Checklist Card */}
      <Card>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons 
              name="list-outline" 
              size={20} 
              color={isDark ? "#34D399" : "#059669"} 
            />
            <Text className="ml-2 text-base font-semibold text-gray-900 dark:text-white">
              Checklist
            </Text>
          </View>
          <Text className="text-xs text-emerald-600 dark:text-emerald-400">
            {completedItems} of {checklist.length}
          </Text>
        </View>

        {checklist.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleChecklistItem(item.id)}
            className={`flex-row items-center px-3 py-3 rounded-xl ${
              item.done 
                ? "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800" 
                : "border-transparent"
            }`}
            style={{ marginBottom: index < checklist.length - 1 ? 8 : 0 }}
          >
            <View className={`w-5 h-5 rounded-full items-center justify-center mr-3 border-2 ${
              item.done 
                ? "bg-emerald-500 border-emerald-500" 
                : "border-gray-300 dark:border-gray-600"
            }`}>
              {item.done && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text className={`flex-1 text-sm ${
              item.done 
                ? "text-emerald-600 dark:text-emerald-400 line-through" 
                : "text-gray-700 dark:text-gray-300"
            }`}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>

      {/* Status Toggle Card */}
      <View className="px-4 py-3 mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800 flex-row items-center justify-between bg-emerald-50 dark:bg-emerald-900/20">
        <View className="flex-row items-center">
          <Ionicons 
            name="checkmark-circle-outline" 
            size={20} 
            color={isDark ? "#34D399" : "#059669"} 
          />
          <Text className="ml-2 text-base font-medium text-emerald-700 dark:text-emerald-400">
            Mark as Completed
          </Text>
        </View>
        <Switch
          value={completed}
          onValueChange={(value) => {
            setCompleted(value);
            setHasChanged(!hasChanged);
          }}
          trackColor={{ false: isDark ? "#1F2937" : "#d1fae5", true: "#059669" }}
          thumbColor={completed ? "white" : (isDark ? "#34D399" : "#059669")}
        />
      </View>

      {/* Action Buttons */}
      <View className="mt-2">
        {hasChanged && (
          <TouchableOpacity
            onPress={handleUpdateTask}
            className="flex-row items-center justify-center bg-emerald-500 py-4 rounded-2xl mb-3 shadow-sm dark:shadow-emerald-900/30"
          >
            <Ionicons name="save-outline" size={20} color="white" />
            <Text className="ml-2 text-white font-semibold text-base">
              {isEditing ? "Save Changes" : "Update Task"}
            </Text>
          </TouchableOpacity>
        )}

        <View className="flex-row" style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={() => {
              if (isEditing) {
                setEditData({
                  title: task.title,
                  description: task.description,
                  dueDate: new Date(task.dueDate),
                });
                setHasChanged(false);
              }
              setIsEditing(!isEditing);
            }}
            className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border ${
              isEditing
                ? "bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-700"
                : "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
            }`}
          >
            <Ionicons
              name={isEditing ? "close-outline" : "create-outline"}
              size={20}
              color={isDark ? "#34D399" : "#059669"}
            />
            <Text className="ml-2 font-semibold text-base dark:text-emerald-400 text-emerald-600">
              {isEditing ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-red-50 dark:bg-red-900/20 py-4 rounded-2xl border border-red-200 dark:border-red-800">
            <Ionicons name="trash-outline" size={20} color={isDark ? "#F87171" : "#dc2626"} />
            <Text className="ml-2 font-semibold text-base text-red-600 dark:text-red-400">
              Delete
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Custom Date Picker Modal */}
      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        initialDate={editData.dueDate}
      />
    </ScrollView>
  );
}