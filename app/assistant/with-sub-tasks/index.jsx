import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Animated, ActivityIndicator } from 'react-native';

const tasksData = [
  {
    id: '1',
    title: 'Apply for Internship',
    category: 'Career',
    priority: 'high',
    dueDate: '2024-08-15',
    subtasks: [
      { id: 'sub1', text: 'Update resume and cover letter', completed: false },
      { id: 'sub2', text: 'Search for internships in preferred companies', completed: true },
      { id: 'sub3', text: 'Submit application and track progress', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Prepare for Final Exams',
    category: 'Academics',
    priority: 'high',
    dueDate: '2024-08-20',
    subtasks: [
      { id: 'sub4', text: 'Revise past papers', completed: true },
      { id: 'sub5', text: 'Attend group study sessions', completed: false },
      { id: 'sub6', text: 'Summarize key topics', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Complete Project Proposal',
    category: 'Work',
    priority: 'medium',
    dueDate: '2024-08-25',
    subtasks: [
      { id: 'sub7', text: 'Research market trends', completed: false },
      { id: 'sub8', text: 'Create project timeline', completed: false },
      { id: 'sub9', text: 'Write executive summary', completed: false },
    ],
  },
];

export default function TasksWithChecklistScreen() {
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingSubtask, setUpdatingSubtask] = useState(null);

  // Simulate loading data
  useEffect(() => {
    const loadTasks = async () => {
      setIsLoading(true);
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      setTasks(tasksData);
      setIsLoading(false);
    };
    loadTasks();
  }, []);

  const toggleExpand = (id) => {
    setExpandedTaskId(expandedTaskId === id ? null : id);
  };

  const toggleSubtask = async (taskId, subtaskId) => {
    setUpdatingSubtask(subtaskId);
    
    // Simulate API update delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId
          ? {
              ...task,
              subtasks: task.subtasks.map(subtask =>
                subtask.id === subtaskId
                  ? { ...subtask, completed: !subtask.completed }
                  : subtask
              ),
            }
          : task
      )
    );
    
    setUpdatingSubtask(null);
  };

  const getProgressPercentage = (subtasks) => {
    const completed = subtasks.filter(subtask => subtask.completed).length;
    return Math.round((completed / subtasks.length) * 100);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'career': return 'briefcase';
      case 'academics': return 'school';
      case 'work': return 'laptop';
      default: return 'list';
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-600 mt-4 text-base">Loading your tasks...</Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-6 pt-14 pb-6 border-b border-gray-100">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-3xl font-bold text-gray-900">My Tasks</Text>
            <Text className="text-gray-500 mt-1">Stay organized and productive</Text>
          </View>
          <View className="bg-blue-50 rounded-full p-3">
            <Ionicons name="checkmark-done" size={24} color="#3b82f6" />
          </View>
        </View>
      </View>

      {/* Tasks List */}
      <View className="px-6 py-4">
        {tasks.map((task) => {
          const progress = getProgressPercentage(task.subtasks);
          const isExpanded = expandedTaskId === task.id;
          
          return (
            <View key={task.id} className="bg-white mb-4 rounded-2xl shadow-sm border border-gray-100">
              <TouchableOpacity
                onPress={() => toggleExpand(task.id)}
                className="p-5"
                activeOpacity={0.7}
              >
                <View className="flex-row items-start justify-between">
                  <View className="flex-1 mr-3">
                    <View className="flex-row items-center mb-2">
                      <View className="bg-blue-50 rounded-full p-2 mr-3">
                        <Ionicons 
                          name={getCategoryIcon(task.category)} 
                          size={16} 
                          color="#3b82f6" 
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-lg font-semibold text-gray-900">{task.title}</Text>
                        <View className="flex-row items-center mt-1">
                          <View className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} mr-2`} />
                          <Text className="text-sm text-gray-600 capitalize">{task.category}</Text>
                          <Text className="text-sm text-gray-400 ml-2">• Due {task.dueDate}</Text>
                        </View>
                      </View>
                    </View>
                    
                    {/* Progress Bar */}
                    <View className="mt-3">
                      <View className="flex-row items-center justify-between mb-2">
                        <Text className="text-xs text-gray-500">Progress</Text>
                        <Text className="text-xs font-medium text-gray-700">{progress}%</Text>
                      </View>
                      <View className="bg-gray-200 rounded-full h-2">
                        <View 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                    </View>
                  </View>
                  
                  <View className="items-center">
                    <View className={`rounded-full p-2 ${isExpanded ? 'bg-blue-50' : 'bg-gray-50'}`}>
                      <Ionicons
                        name={isExpanded ? 'chevron-up' : 'chevron-down'}
                        size={20}
                        color={isExpanded ? '#3b82f6' : '#6b7280'}
                      />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>

              {/* Subtasks */}
              {isExpanded && (
                <View className="px-5 pb-5">
                  <View className="bg-gray-50 rounded-xl p-3">
                    <Text className="text-sm font-medium text-gray-700 mb-3">Checklist</Text>
                    
                    {task.subtasks.map((subtask, index) => (
                      <TouchableOpacity
                        key={subtask.id}
                        onPress={() => toggleSubtask(task.id, subtask.id)}
                        className={`flex-row items-center p-3 mb-2 last:mb-0 rounded-lg transition-all duration-200 ${
                          subtask.completed ? 'bg-green-50 border border-green-200' : 'bg-white border border-gray-200'
                        }`}
                        activeOpacity={0.7}
                      >
                        <View className="mr-3">
                          {updatingSubtask === subtask.id ? (
                            <ActivityIndicator size="small" color="#3b82f6" />
                          ) : (
                            <Ionicons
                              name={subtask.completed ? 'checkmark-circle' : 'ellipse-outline'}
                              size={20}
                              color={subtask.completed ? '#10b981' : '#9ca3af'}
                            />
                          )}
                        </View>
                        
                        <Text className={`flex-1 text-sm ${
                          subtask.completed 
                            ? 'text-green-700 line-through' 
                            : 'text-gray-800'
                        }`}>
                          {subtask.text}
                        </Text>
                        
                        {subtask.completed && (
                          <View className="ml-2">
                            <Ionicons name="checkmark" size={14} color="#10b981" />
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                    
                    {/* Task completion status */}
                    {progress === 100 && (
                      <View className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <View className="flex-row items-center">
                          <Ionicons name="trophy" size={16} color="#10b981" />
                          <Text className="text-green-700 font-medium ml-2 text-sm">
                            Task completed! Great job! 🎉
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                </View>
              )}
            </View>
          );
        })}
        
        {/* Empty state or add new task prompt */}
        <TouchableOpacity className="bg-white border-2 border-dashed border-gray-300 rounded-2xl p-6 items-center justify-center mt-4">
          <View className="bg-gray-100 rounded-full p-3 mb-3">
            <Ionicons name="add" size={24} color="#6b7280" />
          </View>
          <Text className="text-gray-600 font-medium">Add New Task</Text>
          <Text className="text-gray-400 text-sm mt-1">Tap to create a new task with checklist</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}