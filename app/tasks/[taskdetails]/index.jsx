import CustomDatePicker from '@/components/tasks/CustomCalendar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
  <View style={{
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    ...style
  }}>
    {children}
  </View>
);

// Priority Badge Component
const PriorityBadge = ({ priority }) => {
  const getPriorityClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-100 border border-red-300";
      case "medium":
        return "bg-yellow-100 border border-yellow-300";
      case "low":
        return "bg-blue-100 border border-blue-300";
      default:
        return "bg-gray-100 border border-gray-300";
    }
  };

  const getTextClasses = (priority) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "text-red-700";
      case "medium":
        return "text-yellow-700";
      case "low":
        return "text-blue-700";
      default:
        return "text-gray-500";
    }
  };

  return (
    <View
      className={`px-3 py-1.5 rounded-full self-start ${getPriorityClasses(priority)}`}
    >
      <Text
        className={`text-[10px] font-semibold uppercase tracking-[0.5px] ${getTextClasses(priority)}`}
      >
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
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8
      }}>
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B7280' }}>
          Progress
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: '#059669' }}>
          {completed}/{total} completed
        </Text>
      </View>
      <View style={{
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        overflow: 'hidden'
      }}>
        <View style={{
          height: '100%',
          width: `${progress}%`,
          backgroundColor: '#059669',
          borderRadius: 4
        }} />
      </View>
    </View>
  );
};

export default function TaskDetailsScreen() {
  const insets = useSafeAreaInsets()
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
      className="flex-1 bg-gray-50"
      contentContainerStyle={{ paddingBottom: insets.bottom + 40, paddingHorizontal: 20, paddingTop: insets.top + 20 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View className="mb-6">
        <View
          className="flex-row justify-between items-start mb-3"
          style={{ gap: 12 }}
        >
          {isEditing ? (
            <TextInput
              className="flex-1 mr-4 px-4 py-3 text-[15px] rounded-[10px] font-bold text-emerald-700 border border-emerald-400"
              value={editData.title}
              onChangeText={(text) => {
                setEditData({ ...editData, title: text });
                setHasChanged(true);
              }}
              placeholder="Task title"
              multiline
            />
          ) : (
            <View className="flex-1">
              <Text className="text-[20px] font-bold text-gray-900 leading-9">
                {task.title}
              </Text>
            </View>
          )}

          <TouchableOpacity
            className="w-10 h-10 rounded-full bg-white items-center justify-center"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 4,
              elevation: 2,
            }}
          >
            <Ionicons name="bookmark-outline" size={20} color="#059669" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center border-t-[2px] border-gray-200 pt-6">
          <View className="flex-row items-center" style={{ gap: 12 }}>
            <View className="bg-emerald-100 px-3 py-1.5 rounded-full">
              <Text className="text-emerald-600 text-sm font-semibold">
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
          <Ionicons name="document-text-outline" size={20} color="#059669" />
          <Text className="ml-2 text-base font-semibold text-gray-900">Description</Text>
        </View>

        {isEditing ? (
          <TextInput
            className="text-sm text-gray-500 border border-emerald-400 rounded-lg p-3 min-h-[80px]"
            style={{ lineHeight: 20 }}
            multiline
            value={editData.description}
            onChangeText={(text) => {
              setEditData({ ...editData, description: text });
              setHasChanged(true);
            }}
            placeholder="Add a description..."
          />
        ) : (
          <Text className="text-sm text-gray-500" style={{ lineHeight: 20 }}>
            {task.description}
          </Text>
        )}

        <View className="flex-row items-center mt-4 pt-4 border-t border-emerald-50">
          <Ionicons name="calendar-outline" size={16} color="#059669" />
          {isEditing ? (
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text className="ml-1.5 text-xs font-medium text-emerald-600 bg-emerald-100  border border-emerald-400 rounded-md p-2">
                Due: {formatDate(editData.dueDate)}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="ml-1.5 text-xs text-emerald-600">
              Due: {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
      </Card>

      {/* Checklist Card */}
      <Card>
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <Ionicons name="list-outline" size={20} color="#059669" />
            <Text className="ml-2 text-base font-semibold text-gray-900">Checklist</Text>
          </View>
          <Text className="text-xs text-emerald-600">
            {completedItems} of {checklist.length}
          </Text>
        </View>

        {checklist.map((item, index) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleChecklistItem(item.id)}
            className={`flex-row items-center px-3 py-3 rounded-xl border ${item.done ? "bg-emerald-50 border-emerald-200" : "border-transparent"
              }`}
            style={{ marginBottom: index < checklist.length - 1 ? 8 : 0 }}
          >
            <View
              className={`w-5 h-5 rounded-full items-center justify-center mr-3 border-2 ${item.done ? "bg-emerald-600 border-emerald-600" : "border-gray-300"
                }`}
            >
              {item.done && <Ionicons name="checkmark" size={12} color="white" />}
            </View>
            <Text
              className={`flex-1 text-sm ${item.done ? "text-emerald-600 line-through" : "text-gray-700"
                }`}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </Card>

      {/* Status Toggle Card */}
      <View className="px-3 py-2 mb-4 rounded-[15px] border-[1px] border-emerald-200 flex-row items-center justify-between bg-emerald-50">
        <View className="flex-row items-center">
          <Ionicons name="checkmark-circle-outline" size={20} color="#059669" />
          <Text className="ml-2 text-base font-medium text-emerald-700">Mark as Completed</Text>
        </View>
        <Switch
          value={completed}
          onValueChange={(value) => {
            setCompleted(value);
                setHasChanged(!hasChanged);
          }}
          trackColor={{ false: "#d1fae5", true: "#059669" }}
          thumbColor={completed ? "white" : "#059669"}
        />
      </View>

      {/* Action Buttons */}
      <View className="mt-2">
        {hasChanged && (
          <TouchableOpacity
            onPress={handleUpdateTask}
            className="flex-row items-center justify-center bg-emerald-600 py-4 rounded-2xl mb-3"
            style={{
              shadowColor: "#059669",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 4,
            }}
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
            className={`flex-1 flex-row items-center justify-center py-4 rounded-2xl border ${isEditing
              ? "bg-emerald-100 border-emerald-200"
              : "bg-emerald-50 border-emerald-200"
              }`}
          >
            <Ionicons
              name={isEditing ? "close-outline" : "create-outline"}
              size={20}
              color="#059669"
            />
            <Text className="ml-2 text-emerald-600 font-semibold text-base">
              {isEditing ? "Cancel" : "Edit"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-1 flex-row items-center justify-center bg-red-50 py-4 rounded-2xl border border-red-200">
            <Ionicons name="trash-outline" size={20} color="#dc2626" />
            <Text className="ml-2 text-red-600 font-semibold text-base">Delete</Text>
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