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

  const saveChecklist = () => {
    console.log('Checklist:', { task, subtasks });
    router.push('/assistant/with-sub-tasks');
  };

  return (
    <ScrollView className="flex-1 bg-white p-6 pt-14">
      <Text className="text-2xl font-bold text-gray-900 mb-6">Checklist Generator</Text>

      <View className="mb-6">
        <Text className="text-gray-600 mb-1">Title</Text>
        <TextInput
          value={task.title}
          onChangeText={(text) => setTask({ ...task, title: text })}
          className="bg-gray-100 p-4 rounded-xl text-base text-gray-900"
        />
      </View>

      <View className="mb-6">
        <Text className="text-gray-600 mb-1">Description</Text>
        <TextInput
          value={task.description}
          onChangeText={(text) => setTask({ ...task, description: text })}
          className="bg-gray-100 p-4 rounded-xl text-base text-gray-900"
          multiline
        />
      </View>

      <TouchableOpacity
        onPress={generateSubtasks}
        disabled={loading}
        className="bg-indigo-600 py-3 rounded-2xl items-center mb-6"
      >
        <Text className="text-white font-semibold">
          {loading ? 'Generating...' : 'Generate Subtasks'}
        </Text>
      </TouchableOpacity>

      {loading && (
        <View className="items-center mb-6">
          <ActivityIndicator size="large" color="#6366f1" />
          <Text className="mt-2 text-gray-500">Creating subtasks...</Text>
        </View>
      )}

      {subtasks.length > 0 && (
        <View className="space-y-4">
          {subtasks.map((item, index) => (
            <TextInput
              key={index}
              value={item}
              onChangeText={(text) => updateSubtask(text, index)}
              className="bg-white border border-gray-300 rounded-xl p-4 text-base text-gray-800"
            />
          ))}

          <TouchableOpacity
            onPress={saveChecklist}
            className="bg-green-600 py-3 rounded-2xl items-center mt-4"
          >
            <Text className="text-white font-semibold">Save Checklist</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}
