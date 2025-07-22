import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import CustomCalendar from '@/components/tasks/CustomCalendar'; // adjust the path based on your structure

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
      router.back(); // go back to the previous screen
    }, 2000);
  };

  const handleDateSelect = (date) => {
    setTask({ ...task, dueDate: date.toISOString() });
    setCalendarVisible(false);
  };

  return (
    <View className="p-6 bg-white rounded-t-3xl space-y-4">
      <Text className="text-xl font-bold text-gray-800">Create New Task</Text>

      <TextInput
        placeholder="Title"
        value={task.title}
        onChangeText={(text) => setTask({ ...task, title: text })}
        className="bg-gray-100 p-4 rounded-xl text-gray-800"
      />

      <TextInput
        placeholder="Description"
        value={task.description}
        onChangeText={(text) => setTask({ ...task, description: text })}
        className="bg-gray-100 p-4 rounded-xl text-gray-800"
        multiline
      />

      <TextInput
        placeholder="Category"
        value={task.category}
        onChangeText={(text) => setTask({ ...task, category: text })}
        className="bg-gray-100 p-4 rounded-xl text-gray-800"
      />

      {/* Date Picker */}
      <TouchableOpacity
        onPress={() => setCalendarVisible(true)}
        className="bg-gray-100 p-4 rounded-xl flex-row justify-between items-center"
      >
        <Text className="text-gray-800">
          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Pick Due Date'}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleCreate}
        disabled={!task.title.trim() || !task.description.trim()}
        className={`py-4 rounded-2xl items-center ${
          task.title.trim() && task.description.trim() ? 'bg-green-600' : 'bg-gray-300'
        }`}
      >
        <Text className="text-white text-base font-semibold">
          {loading ? 'Creating...' : 'Create Task'}
        </Text>
      </TouchableOpacity>

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

  return (
    <View className="flex-1 bg-gray-50 p-6 pt-20">
      <View className="items-center">
        <Ionicons name="list-circle-outline" size={64} color="#6366f1" />
        <Text className="text-2xl font-bold text-gray-800 mt-4">Start a New Task</Text>
        <Text className="text-gray-500 mt-2">Let’s organize your goals!</Text>
      </View>

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 justify-end bg-black/30">
          <TaskCreationForm
            onSave={(task) => {
              console.log('✅ New Task:', task);
              setModalVisible(false);
            }}
          />
        </View>
      </Modal>
    </View>
  );
}
