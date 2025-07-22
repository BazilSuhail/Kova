import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import TaskCreationModal from '@/components/tasks/TaskCreationModal';

// Mock Task Data
const tasks = [
  { id: '1', title: 'Finish AI project', category: 'Academics', isCompleted: false },
  { id: '2', title: 'Call dentist', category: 'Health', isCompleted: true },
  { id: '3', title: 'Workout session', category: 'Fitness', isCompleted: false },
  { id: '4', title: 'Grocery shopping', category: 'Personal', isCompleted: false },
];

export default function TasksScreen() {
const [modalVisible, setModalVisible] = useState(false);
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb' }} contentContainerStyle={{ padding: 20, paddingTop: 60 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-extrabold text-gray-900 mb-1">Tasks</Text>
        <Text className="text-gray-500 text-base">Stay on track and get things done</Text>
      </View>

<TaskCreationModal visible={modalVisible} onClose={() => setModalVisible(false)} />

<TouchableOpacity onPress={() => setModalVisible(true)} className="...">
  <Text>Add Task</Text>
</TouchableOpacity>

      {/* Task List */}
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <Link href="/tasks/152" className="flex-row items-center justify-between bg-white rounded-2xl px-5 py-4 mb-4 shadow-sm shadow-gray-200">
            <View className="flex-row items-center flex-1">
              <Ionicons
                name={item.isCompleted ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={item.isCompleted ? '#10b981' : '#9ca3af'}
              />
              <View className="ml-4">
                <Text className={`text-base font-medium ${item.isCompleted ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
                  {item.title}
                </Text>
                <Text className="text-xs text-gray-400 mt-1 capitalize">{item.category}</Text>
              </View>
            </View>

            <TouchableOpacity className="p-2">
              <Ionicons name="ellipsis-horizontal" size={20} color="#9ca3af" />
            </TouchableOpacity>
          </Link>
        )}
      />

      {/* Actions */}
      <View className="flex-row justify-between mt-8">
        <TouchableOpacity  onPress={() => setModalVisible(true)} className="flex-1 flex-row items-center justify-center bg-indigo-600 py-3 rounded-2xl mr-2">
          <Ionicons name="add-circle-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Add Task</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-center bg-white border border-gray-300 py-3 px-5 rounded-2xl">
          <Ionicons name="filter-outline" size={20} color="#4b5563" />
          <Text className="text-gray-700 font-medium ml-2">Filter</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
