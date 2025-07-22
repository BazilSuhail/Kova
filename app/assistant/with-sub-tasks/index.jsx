import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

const tasksData = [
  {
    id: '1',
    title: 'Apply for Internship',
    category: 'Career',
    subtasks: [
      'Update resume and cover letter',
      'Search for internships in preferred companies',
      'Submit application and track progress',
    ],
  },
  {
    id: '2',
    title: 'Prepare for Final Exams',
    category: 'Academics',
    subtasks: [
      'Revise past papers',
      'Attend group study sessions',
      'Summarize key topics',
    ],
  },
];

export default function TasksWithChecklistScreen() {
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  return (
    <ScrollView className="flex-1 bg-white p-6 pt-14">
      <Text className="text-2xl font-bold text-gray-900 mb-6">My Tasks with Checklists</Text>

      {tasksData.map((task) => (
        <View key={task.id} className="bg-gray-50 mb-4 rounded-2xl shadow-sm">
          <TouchableOpacity
            onPress={() => toggleExpand(task.id)}
            className="flex-row justify-between items-center px-5 py-4"
          >
            <View>
              <Text className="text-base font-semibold text-gray-800">{task.title}</Text>
              <Text className="text-sm text-gray-500 capitalize mt-1">{task.category}</Text>
            </View>
            <Ionicons
              name={expandedTaskId === task.id ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6b7280"
            />
          </TouchableOpacity>

          {expandedTaskId === task.id && (
            <View className="px-5 pb-4 space-y-2">
              {task.subtasks.map((subtask, index) => (
                <View
                  key={index}
                  className="flex-row items-start p-3 bg-white border border-gray-200 rounded-xl"
                >
                  <Ionicons name="ellipse-outline" size={16} color="#9ca3af" className="mt-1" />
                  <Text className="ml-3 text-gray-800 text-sm flex-1">{subtask}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
}
