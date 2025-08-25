import CustomDatePicker from '@/components/tasks/CustomCalendar';
import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ModernAILoader from '../../../components/tasks/SubTasksLoader';

// Single task with hasSubtasks = false
const initialTask = {
  id: 'task_001',
  title: 'Finish AI Report',
  description: 'Summarize case studies and finalize references for the comprehensive artificial intelligence research project.',
  category: 'Academics',
  dueDate: '2025-07-22T18:00:00Z',
  isCompleted: false,
  priority: 'Low',
  hasSubtasks: false,
  checklist: [
    { id: '1', title: 'Complete draft', done: true },
    { id: '2', title: 'Revise figures and charts', done: false },
    { id: '3', title: 'Finalize references', done: false },
    { id: '4', title: 'Submit PDF', done: false },
  ],
};

const Card = ({ children, style = {} }) => (
  <View className="bg-white dark:bg-gray-800/70 border border-gray-100 dark:border-gray-700 p-5 mb-5 rounded-3xl">
    {children}
  </View>
);

// Enhanced Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityConfig = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return {
          bg: "bg-red-100 dark:bg-red-900/30",
          border: "border-red-200 dark:border-red-700/50",
          text: "text-red-700 dark:text-red-400",
          icon: "alert-triangle",
          iconColor: "#DC2626"
        };
      case "medium":
        return {
          bg: "bg-amber-100 dark:bg-amber-900/30",
          border: "border-amber-200 dark:border-amber-700/50",
          text: "text-amber-700 dark:text-amber-400",
          icon: "trending-up",
          iconColor: "#D97706"
        };
      case "low":
        return {
          bg: "bg-blue-100 dark:bg-blue-900/30",
          border: "border-blue-200 dark:border-blue-700/50",
          text: "text-blue-700 dark:text-blue-400",
          icon: "arrow-down",
          iconColor: "#2563EB"
        };
      default:
        return {
          bg: "bg-gray-100 dark:bg-gray-800/70",
          border: "border-gray-200 dark:border-gray-600/50",
          text: "text-gray-600 dark:text-gray-400",
          icon: "minus",
          iconColor: "#6B7280"
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <View className={`px-4 py-2 rounded-full border ${config.bg} ${config.border} flex-row items-center`}>
      <Feather name={config.icon} size={12} color={config.iconColor} />
      <Text className={`text-xs font-bold uppercase tracking-wider ml-2 ${config.text}`}>
        {priority}
      </Text>
    </View>
  );
};

// Enhanced Progress Bar Component
const ProgressBar = ({ completed, total }) => {
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <View className="bg-emerald-50 mb-5 dark:bg-emerald-900/20 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-800/30">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center mr-3">
            <Ionicons name="analytics" size={18} color="#059669" />
          </View>
          <View>
            <Text className="text-base font-bold text-gray-800 dark:text-white">
              Task Progress
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {progress.toFixed(0)}% completed
            </Text>
          </View>
        </View>
        <View className="bg-emerald-500 px-4 py-2 rounded-full">
          <Text className="text-white font-bold text-sm">
            {completed}/{total}
          </Text>
        </View>
      </View>
      <View className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <View 
          className="h-full bg-emerald-500 rounded-full"
          style={{ width: `${progress}%` }}
        />
      </View>
    </View>
  );
};

// AI Subtasks Generator Component
const AISubtasksGenerator = ({ onGenerate }) => {
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      onGenerate([
        { id: 'ai-1', title: 'Research key topics', done: false },
        { id: 'ai-2', title: 'Create outline structure', done: false },
        { id: 'ai-3', title: 'Write content sections', done: false },
        { id: 'ai-4', title: 'Review and edit', done: false },
      ]);
      setLoading(false);
    }, 2000);
  };

  return (
    <View className="mb-5">
      {!loading ? (
        <ModernAILoader/>
      ) : (
        <TouchableOpacity 
          onPress={handleGenerate}
          className="flex-row items-center justify-center py-5 bg-emerald-500 rounded-2xl"
        >
          <MaterialIcons name="auto-awesome" size={24} color="white" />
          <Text className="ml-3 text-white font-bold text-lg">
            Generate AI Subtasks
          </Text>
        </TouchableOpacity>
      )}
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
    setHasChanged(false);
    Alert.alert('✅ Success', 'Task updated successfully!');
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

  const handleGenerateSubtasks = (newSubtasks) => {
    setChecklist(newSubtasks);
    setTask({
      ...task,
      hasSubtasks: true,
      checklist: newSubtasks
    });
    setHasChanged(true);
  };


  const handleDelete = ()=> console.log("sd")

  return (
    <ScrollView
      className="flex-1 bg-gray-50 dark:bg-gray-950"
      contentContainerStyle={{ 
        paddingBottom: insets.bottom + 40, 
        paddingHorizontal: 15, 
        paddingTop: insets.top + 20 
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Enhanced Header */}
      <View className="mb-5">
        {/* Title Section */}
        <View className="bg-white dark:bg-gray-800/70 rounded-3xl p-6 border border-emerald-100 dark:border-emerald-800/30">
          <View className="flex-row justify-between items-start mb-4">
            {isEditing ? (
              <View className="flex-1 mr-4">
                <TextInput
                  className="text-2xl font-bold text-gray-900 dark:text-white px-4 py-3 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/20"
                  value={editData.title}
                  onChangeText={(text) => {
                    setEditData({ ...editData, title: text });
                    setHasChanged(true);
                  }}
                  placeholder="Task title"
                  placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
                  multiline
                />
              </View>
            ) : (
              <View className="flex-1">
                <View className="flex-row items-center mb-2">
                  <View className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl items-center justify-center mr-4">
                    <Ionicons name="document-text" size={24} color="#059669" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-2xl font-bold text-gray-900 dark:text-white leading-8">
                      {task.title}
                    </Text>
                    <Text className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                      Active Task
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <Pressable className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 items-center justify-center border border-emerald-200 dark:border-emerald-700/50">
              <Ionicons 
                name="bookmark" 
                size={20} 
                color={isDark ? "#34D399" : "#059669"} 
              />
            </Pressable>
          </View>

          {/* Category and Priority */}
          <View className="flex-row items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700/50">
            <View className="flex-row items-center" style={{gap:8}}>
              <View className="bg-emerald-500 px-4 py-2 rounded-full flex-row items-center">
                <Ionicons name="folder" size={14} color="white" />
                <Text className="text-white text-sm font-bold ml-2">
                  {task.category}
                </Text>
              </View>
              <PriorityBadge priority={task.priority} />
            </View>
          </View>
        </View>
      </View>

      {/* Progress Card */}
      <ProgressBar completed={completedItems} total={checklist.length} />

      {/* Description Card */}
      <Card>
        <View className="flex-row items-center mb-4">
          <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl items-center justify-center mr-3">
            <Ionicons name="document-text-outline" size={20} color="#059669" />
          </View>
          <Text className="text-lg font-bold text-gray-900 dark:text-white">
            Description
          </Text>
        </View>

        {isEditing ? (
          <TextInput
            className="text-base text-gray-700 dark:text-gray-300 border-2 border-emerald-300 dark:border-emerald-600 rounded-xl p-4 min-h-[100px] bg-emerald-50/50 dark:bg-emerald-900/10"
            style={{ lineHeight: 24 }}
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
          <Text className="text-base text-gray-600 dark:text-gray-300 leading-6 mb-4">
            {task.description}
          </Text>
        )}

        <View className="flex-row items-center justify-between pt-4 border-t border-emerald-100/50 dark:border-emerald-800/30">
          <View className="flex-row items-center">
            <View className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg items-center justify-center mr-3">
              <Ionicons name="calendar" size={16} color="#059669" />
            </View>
            {isEditing ? (
              <Pressable onPress={() => setShowDatePicker(true)}>
                <View className="bg-emerald-500 px-4 py-2 rounded-full">
                  <Text className="text-white font-bold text-sm">
                    Due: {formatDate(editData.dueDate)}
                  </Text>
                </View>
              </Pressable>
            ) : (
              <Text className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                Due: {formatDate(task.dueDate)}
              </Text>
            )}
          </View>
          
          <View className="flex-row items-center">
            <Ionicons name="time-outline" size={16} color={isDark ? "#34D399" : "#059669"} />
            <Text className="ml-2 text-sm text-gray-500 dark:text-gray-400">
              3 days left
            </Text>
          </View>
        </View>
      </Card>

      {/* AI Subtasks Generator */}
      {!task.hasSubtasks && (
        <AISubtasksGenerator onGenerate={handleGenerateSubtasks} />
      )}

      {/* Enhanced Checklist Card */}
      {task.hasSubtasks && (
        <Card>
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl items-center justify-center mr-3">
                <Ionicons name="list" size={20} color="#059669" />
              </View>
              <View>
                <Text className="text-lg font-bold text-gray-900 dark:text-white">
                  Subtasks
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {completedItems} of {checklist.length} completed
                </Text>
              </View>
            </View>
            <View className="bg-emerald-500 px-4 py-2 rounded-full">
              <Text className="text-white font-bold text-sm">
                {Math.round((completedItems / checklist.length) * 100)}%
              </Text>
            </View>
          </View>

          {checklist.map((item, index) => (
            <Pressable
              key={item.id}
              onPress={() => toggleChecklistItem(item.id)}
              className={`flex-row items-center p-4 rounded-2xl mb-3 border ${
                item.done 
                  ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700" 
                  : "bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700"
              }`}
            >
              <View className={`w-6 h-6 rounded-full items-center justify-center mr-4 border-2 ${
                item.done 
                  ? "bg-emerald-500 border-transparent" 
                  : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800/70"
              }`}>
                {item.done && <Ionicons name="checkmark" size={14} color="white" />}
              </View>
              <Text className={`flex-1 text-base font-medium ${
                item.done 
                  ? "text-emerald-700 dark:text-emerald-400 line-through" 
                  : "text-gray-700 dark:text-gray-300"
              }`}>
                {item.title}
              </Text>
              {item.done && (
                <View className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900/30 rounded-full items-center justify-center">
                  <Ionicons name="checkmark-circle" size={16} color="#059669" />
                </View>
              )}
            </Pressable>
          ))}
        </Card>
      )}

      {/* Enhanced Status Toggle */}
      <View className="bg-white dark:bg-gray-800/70 rounded-3xl p-6 mb-5 border border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center flex-1">
            <View className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl items-center justify-center mr-4">
              <Ionicons 
                name={completed ? "checkmark-circle" : "checkmark-circle-outline"} 
                size={24} 
                color={completed ? "#059669" : (isDark ? "#34D399" : "#059669")} 
              />
            </View>
            <View className="flex-1">
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                Task Completion
              </Text>
              <Text className="text-sm text-gray-500 dark:text-gray-400">
                {completed ? "✅ Task completed" : "Mark when finished"}
              </Text>
            </View>
          </View>
          <Switch
            value={completed}
            onValueChange={(value) => {
              setCompleted(value);
              setHasChanged(true);
            }}
            trackColor={{ 
              false: isDark ? "#374151" : "#E5E7EB", 
              true: "#059669" 
            }}
            thumbColor={completed ? "#FFFFFF" : "#F3F4F6"}
            style={{ transform: [{ scaleX: 1.2 }, { scaleY: 1.2 }] }}
          />
        </View>
      </View>

      {/* Enhanced Action Buttons */}
      <View style={{gap:8}}>
        {hasChanged && (
          <Pressable
            onPress={handleUpdateTask}
            className="bg-emerald-500 py-5 rounded-2xl"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="save" size={24} color="white" />
              <Text className="ml-3 text-white font-bold text-lg">
                {isEditing ? "Save Changes" : "Update Task"}
              </Text>
            </View>
          </Pressable>
        )}

        <View className="flex-row" style={{gap:8}}>
          <Pressable
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
            className="flex-1 bg-white dark:bg-gray-800/70 py-4 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700/50"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons
                name={isEditing ? "close" : "create"}
                size={20}
                color={isDark ? "#34D399" : "#059669"}
              />
              <Text className="ml-2 font-bold text-base text-emerald-600 dark:text-emerald-400">
                {isEditing ? "Cancel" : "Edit"}
              </Text>
            </View>
          </Pressable>

          <Pressable className="flex-1 bg-white dark:bg-gray-800/70 py-4 rounded-2xl border-2 border-red-200 dark:border-red-700/50">
            <View className="flex-row items-center justify-center">
              <Ionicons name="trash" size={20} color={isDark ? "#F87171" : "#EF4444"} />
              <Text className="ml-2 font-bold text-base text-red-500 dark:text-red-400">
                Delete
              </Text>
            </View>
          </Pressable>
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