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
  const [generated, setGenerated] = useState(false);

  const generateSubtasks = () => {
    setLoading(true);
    setGenerated(false);
    setTimeout(() => {
      setSubtasks([
        'Update resume and cover letter',
        'Search for internships in preferred companies',
        'Submit application and track progress',
        'Prepare for initial interview round',
        'Follow up with HR after submission'
      ]);
      setLoading(false);
      setGenerated(true);
    }, 2000);
  };

  const regenerateSubtasks = () => {
    setLoading(true);
    setTimeout(() => {
      setSubtasks([
        'Research company requirements and culture',
        'Tailor resume for each application',
        'Write personalized cover letters',
        'Submit applications before deadlines',
        'Track application status weekly'
      ]);
      setLoading(false);
    }, 1500);
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

  // Custom Loader Component
  const CustomLoader = () => (
    <View className="bg-white rounded-2xl p-8 mb-6 border border-gray-100" style={{ elevation: 2 }}>
      <View className="items-center">
        <View className="w-20 h-20 bg-emerald-100 rounded-full items-center justify-center mb-6 relative">
          <MaterialIcons name="assignment" size={32} color="#059669" />
          <View className="absolute inset-0 items-center justify-center">
            <ActivityIndicator size="small" color="#059669" />
          </View>
        </View>
        
        <Text className="text-xl font-bold text-gray-800 mb-2">Generating Checklist</Text>
        <Text className="text-gray-600 text-center mb-6 leading-5">
          AI is analyzing your task and breaking it down into actionable steps
        </Text>

        {/* Progress Bar */}
        <View className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
          <View 
            className="bg-emerald-500 h-2.5 rounded-full"
            style={{ width: '75%' }}
          />
        </View>
        
        <Text className="text-emerald-600 font-medium">Processing...</Text>
      </View>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white border-b border-gray-100" style={{ elevation: 1 }}>
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
          <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100" style={{ elevation: 1 }}>
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-emerald-500 rounded-xl items-center justify-center mr-4">
                <MaterialIcons name="assignment" size={24} color="white" />
              </View>
              <View>
                <Text className="text-xl font-bold text-gray-900">Task Details</Text>
                <Text className="text-gray-500 text-sm">Define your main task</Text>
              </View>
            </View>

            <View className="mb-5">
              <Text className="text-sm font-medium text-gray-700 mb-2 flex flex-row items-center">
                <Ionicons name="text-outline" size={14} color="#059669" className="mr-1" />
                Task Title
              </Text>
              <TextInput
                value={task.title}
                onChangeText={(text) => setTask({ ...task, title: text })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 font-medium"
                placeholder="Enter task title"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2 flex flex-row items-center">
                <Ionicons name="document-text-outline" size={14} color="#059669" className="mr-1" />
                Description
              </Text>
              <TextInput
                value={task.description}
                onChangeText={(text) => setTask({ ...task, description: text })}
                className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-base text-gray-900 min-h-[90px]"
                multiline
                textAlignVertical="top"
                placeholder="Describe your task in detail"
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </View>

          {/* Generate/Regenerate Button */}
          <TouchableOpacity
            onPress={generated ? regenerateSubtasks : generateSubtasks}
            disabled={loading}
            className={`rounded-xl py-4 px-6 flex-row items-center justify-center mb-6 ${
              loading ? 'bg-emerald-400' : generated ? 'bg-amber-500' : 'bg-emerald-600'
            }`}
          >
            {loading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Ionicons 
                name={generated ? "refresh" : "sparkles"} 
                size={20} 
                color="white" 
              />
            )}
            <Text className="text-white font-semibold text-base ml-2">
              {loading 
                ? 'Generating...' 
                : generated 
                  ? 'Regenerate Subtasks' 
                  : 'Generate AI Subtasks'}
            </Text>
          </TouchableOpacity>

          {/* Loading State - Custom Loader */}
          {loading && <CustomLoader />}

          {/* Subtasks */}
          {subtasks.length > 0 && (
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100" style={{ elevation: 1 }}>
              <View className="flex-row items-center justify-between mb-5">
                <View className="flex-row items-center">
                  <View className="w-12 h-12 bg-emerald-500 rounded-xl items-center justify-center mr-4">
                    <Ionicons name="checkmark-circle" size={24} color="white" />
                  </View>
                  <View>
                    <Text className="text-xl font-bold text-gray-900">Subtasks</Text>
                    <Text className="text-gray-500 text-sm">{subtasks.length} items generated</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={addNewSubtask}
                  className="w-10 h-10 bg-emerald-100 rounded-full items-center justify-center"
                >
                  <Ionicons name="add" size={20} color="#059669" />
                </TouchableOpacity>
              </View>

              <View style={{ gap: 12 }}>
                {subtasks.map((item, index) => (
                  <View key={index} className="flex-row items-start bg-gray-50 rounded-xl border border-gray-200 p-3">
                    <View className="w-8 h-8 bg-emerald-500 rounded-full items-center justify-center mt-0.5 mr-3">
                      <Text className="text-xs font-bold text-white">{index + 1}</Text>
                    </View>
                    <View className="flex-1">
                      <TextInput
                        value={item}
                        onChangeText={(text) => updateSubtask(text, index)}
                        className="py-1 text-base text-gray-800 w-full"
                        placeholder="Enter subtask"
                        placeholderTextColor="#9CA3AF"
                        multiline
                      />
                    </View>
                    <TouchableOpacity
                      onPress={() => removeSubtask(index)}
                      className="w-8 h-8 items-center justify-center ml-2"
                    >
                      <Ionicons name="close-circle" size={20} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Stats Card */}
          {generated && (
            <View className="bg-emerald-500 rounded-2xl p-6 mb-6" style={{ elevation: 1 }}>
              <View className="flex-row items-center mb-4">
                <Ionicons name="analytics" size={24} color="white" />
                <Text className="text-white text-xl font-bold ml-3">Checklist Insights</Text>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <View className="bg-white rounded-xl p-4 flex-1">
                  <Text className="text-white text-2xl font-bold text-center">5</Text>
                  <Text className="text-emerald-100 text-center text-sm">Steps</Text>
                </View>
                <View className="bg-white bg-opacity-20 rounded-xl p-4 flex-1">
                  <Text className="text-white text-2xl font-bold text-center">3</Text>
                  <Text className="text-emerald-100 text-center text-sm">Estimated Days</Text>
                </View>
                <View className="bg-white bg-opacity-20 rounded-xl p-4 flex-1">
                  <Text className="text-white text-2xl font-bold text-center">85%</Text>
                  <Text className="text-emerald-100 text-center text-sm">Completeness</Text>
                </View>
              </View>
            </View>
          )}

          {/* Tips Card */}
          {generated && (
            <View className="bg-white rounded-2xl p-6 mb-6 border border-gray-100" style={{ elevation: 1 }}>
              <View className="flex-row items-center mb-3">
                <View className="w-10 h-10 bg-amber-100 rounded-full items-center justify-center mr-3">
                  <Ionicons name="bulb-outline" size={20} color="#f59e0b" />
                </View>
                <Text className="text-lg font-semibold text-gray-900">Pro Tips</Text>
              </View>
              <View className="bg-amber-50 rounded-xl p-4 border border-amber-100">
                <Text className="text-amber-800">
                  <Text className="font-semibold">Tip:</Text> Break down complex subtasks into smaller steps for better progress tracking.
                </Text>
              </View>
            </View>
          )}

          {/* Save Button */}
          {subtasks.length > 0 && (
            <TouchableOpacity
              onPress={saveChecklist}
              className="bg-emerald-600 rounded-xl py-4 px-6 flex-row items-center justify-center mb-8"
              style={{ elevation: 3 }}
            >
              <MaterialIcons name="save" size={22} color="white" />
              <Text className="text-white font-bold text-lg ml-2">Save Checklist</Text>
              <Ionicons name="arrow-forward" size={20} color="white" className="ml-2" />
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}