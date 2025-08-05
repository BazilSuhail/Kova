import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function ChecklistGeneratorScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subtasks, setSubtasks] = useState([]);
  const [task, setTask] = useState({
    title: 'Apply for Internship',
    description: 'Complete all necessary steps to apply for a summer internship.',
  });

  const generateSubtasks = () => {
    setLoading(true);
    setTimeout(() => {
      setSubtasks([
        'Update resume and cover letter',
        'Search for internships in preferred companies',
        'Submit application and track progress',
      ]);
      setLoading(false);
    }, 2000);
  };

  const updateSubtask = (text, index) => {
    const updated = [...subtasks];
    updated[index] = text;
    setSubtasks(updated);
  };

  const addNewSubtask = () => {
    setSubtasks([...subtasks, '']);
  };

  const removeSubtask = (index) => {
    const updated = subtasks.filter((_, i) => i !== index);
    setSubtasks(updated);
  };

  const saveChecklist = () => {
    console.log('Checklist:', { task, subtasks });
    router.push('/assistant/with-sub-tasks');
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white shadow-sm border-b border-gray-100">
        <View className="flex-row items-center justify-between px-6 pt-14 pb-4">
          <TouchableOpacity 
            onPress={() => router.back()}
            className="w-10 h-10 bg-gray-100 rounded-full items-center justify-center"
          >
            <Ionicons name="arrow-back" size={20} color="#374151" />
          </TouchableOpacity>
          <Text className="text-xl font-bold text-gray-900">Checklist Generator</Text>
          <View className="w-10" />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-6 py-6">
          {/* Task Details Card */}
          <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-4">
              <View className="w-10 h-10 bg-indigo-100 rounded-full items-center justify-center mr-3">
                <MaterialIcons name="assignment" size={20} color="#6366f1" />
              </View>
              <Text className="text-lg font-semibold text-gray-900">Task Details</Text>
            </View>

            <View className="mb-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">Title</Text>
              <TextInput
                value={task.title}
                onChangeText={(text) => setTask({ ...task, title: text })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 font-medium"
                placeholder="Enter task title"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">Description</Text>
              <TextInput
                value={task.description}
                onChangeText={(text) => setTask({ ...task, description: text })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 min-h-[80px]"
                multiline
                textAlignVertical="top"
                placeholder="Describe your task in detail"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            onPress={generateSubtasks}
            disabled={loading}
            className={`${
              loading ? 'bg-indigo-400' : 'bg-indigo-600'
            } rounded-xl py-4 px-6 flex-row items-center justify-center mb-6 shadow-sm`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons name="sparkles" size={20} color="white" />
            )}
            <Text className="text-white font-semibold text-base ml-2">
              {loading ? 'Generating Subtasks...' : 'Generate AI Subtasks'}
            </Text>
          </TouchableOpacity>

          {/* Loading State */}
          {loading && (
            <View className="bg-white rounded-2xl p-8 mb-6 items-center shadow-sm border border-gray-100">
              <View className="w-16 h-16 bg-indigo-100 rounded-full items-center justify-center mb-4">
                <ActivityIndicator size="large" color="#6366f1" />
              </View>
              <Text className="text-gray-600 font-medium mb-1">Creating your subtasks</Text>
              <Text className="text-gray-500 text-sm text-center">
                AI is analyzing your task and breaking it down into actionable steps
              </Text>
            </View>
          )}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <View className="w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="checkmark-circle" size={20} color="#10b981" />
                  </View>
                  <Text className="text-lg font-semibold text-gray-900">Subtasks</Text>
                </View>
                <TouchableOpacity
                  onPress={addNewSubtask}
                  className="w-8 h-8 bg-indigo-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={16} color="#6366f1" />
                </TouchableOpacity>
              </View>

              {subtasks.map((item, index) => (
                <View key={index} className="mb-3 last:mb-0">
                  <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                    <View className="w-12 items-center justify-center">
                      <View className="w-6 h-6 bg-gray-300 rounded-full items-center justify-center">
                        <Text className="text-xs font-bold text-gray-600">{index + 1}</Text>
                      </View>
                    </View>
                    <TextInput
                      value={item}
                      onChangeText={(text) => updateSubtask(text, index)}
                      className="flex-1 py-3 pr-3 text-base text-gray-800"
                      placeholder="Enter subtask"
                      placeholderTextColor="#9CA3AF"
                      multiline
                    />
                    <TouchableOpacity
                      onPress={() => removeSubtask(index)}
                      className="w-12 items-center justify-center"
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* Save Button */}
          {subtasks.length > 0 && (
            <TouchableOpacity
              onPress={saveChecklist}
              className="bg-green-600 rounded-xl py-4 px-6 flex-row items-center justify-center shadow-sm mb-8"
            >
              <MaterialIcons name="save" size={20} color="white" />
              <Text className="text-white font-semibold text-base ml-2">Save Checklist</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}