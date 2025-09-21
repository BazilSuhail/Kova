import SwipeableTaskItem from '@/components/tasks/SwipeableTaskItem';
import TaskCreationModal from '@/components/tasks/TaskCreationModal';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Mock Task Data with dates
const tasks = [
  { id: '1', title: 'Finish AI project presentation', category: 'Work', isCompleted: false, dueDate: '2025-09-04', priority: 'high' },
  { id: '2', title: 'Call dentist for checkup', category: 'Health', isCompleted: true, dueDate: '2025-09-04', priority: 'medium' },
  { id: '3', title: 'Morning workout session', category: 'Fitness', isCompleted: false, dueDate: '2025-09-04', priority: 'low' },
  { id: '4', title: 'Weekly grocery shopping', category: 'Personal', isCompleted: false, dueDate: '2025-09-05', priority: 'medium' },
  { id: '5', title: 'Team meeting preparation', category: 'Work', isCompleted: false, dueDate: '2025-09-04', priority: 'high' },
  { id: '6', title: 'Read productivity book', category: 'Personal', isCompleted: false, dueDate: '2025-09-06', priority: 'low' },
  { id: '7', title: 'Evening yoga class', category: 'Fitness', isCompleted: false, dueDate: '2025-09-04', priority: 'low' },
  { id: '8', title: 'Submit expense report', category: 'Work', isCompleted: true, dueDate: '2025-09-04', priority: 'medium' },
  { id: '9', title: 'Plan weekend trip', category: 'Personal', isCompleted: false, dueDate: '2025-09-07', priority: 'low' },
  { id: '10', title: 'Review project documents', category: 'Work', isCompleted: true, dueDate: '2025-09-04', priority: 'high' },
];

// Filter Component
const TaskFilter = ({ activeFilter, onFilterChange, taskCounts, isDark }) => {
  const filters = [
    { id: 'all', label: 'All Tasks', count: taskCounts.all, icon: 'list-outline' },
    { id: 'today', label: 'Today', count: taskCounts.today, icon: 'today-outline' }
  ];

  return (
    <View className="flex-row mb-6 bg-white dark:bg-gray-800 rounded-2xl p-2 border-[2px] border-gray-100 dark:border-gray-700">
      {filters.map((filter) => (
        <TouchableOpacity
          key={filter.id}
          onPress={() => onFilterChange(filter.id)}
          className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-xl ${activeFilter === filter.id
            ? 'bg-emerald-500'
            : 'bg-transparent'
            }`}
        >
          <Ionicons
            name={filter.icon}
            size={18}
            color={activeFilter === filter.id ? '#ffffff' : (isDark ? '#9ca3af' : '#6b7280')}
            style={{ marginRight: 6 }}
          />
          <Text className={`font-medium ${activeFilter === filter.id
            ? 'text-white'
            : 'text-gray-600 dark:text-gray-400'
            }`}>
            {filter.label}
          </Text>
          <View className={`ml-2 px-2 py-0.5 rounded-full ${activeFilter === filter.id
            ? 'bg-emerald-400'
            : 'bg-gray-100 dark:bg-gray-700'
            }`}>
            <Text className={`text-xs font-semibold ${activeFilter === filter.id
              ? 'text-white'
              : 'text-gray-600 dark:text-gray-400'
              }`}>
              {filter.count}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

// Welcome Section Component
const ProgressCard = ({ completedTasks, totalTasks,greeting = 'Good Afternoon' }) => {
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const currentHour = new Date().getHours(); 
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good Afternoon';
  else if (currentHour >= 17) greeting = 'Good Evening';

  return (
    <View className="mb-6">
      {/* Progress Card */}
      <View className="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-5 border border-emerald-200 dark:border-emerald-800">
        <View className="flex-row justify-between items-center mb-3">
          <View className="flex-row items-center">
            <View className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 items-center justify-center mr-3">
              <Ionicons name="checkmark-circle" size={20} color="#059669" />
            </View>
            <View>
              <Text className="text-emerald-800 dark:text-emerald-400 font-semibold">Today's Progress</Text>
              <Text className="text-emerald-600 dark:text-emerald-500 text-sm">Keep it up!</Text>
            </View>
          </View>
          <Text className="text-emerald-700 dark:text-emerald-400 font-bold text-lg">
            {completedTasks}/{totalTasks}
          </Text>
        </View>

        <View className="h-3 bg-emerald-100 dark:bg-emerald-800 rounded-full overflow-hidden">
          <View
            className="h-full bg-emerald-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </View>
        <Text className="text-emerald-700 dark:text-emerald-400 text-xs mt-2 font-medium">
          {Math.round(progress)}% complete
        </Text>
      </View>
    </View>
  );
};


// Priority Icon Component
const PriorityIcon = ({ priority }) => {
  const config = {
    high: { icon: 'flag', color: '#ef4444' },
    medium: { icon: 'flag-outline', color: '#f59e0b' },
    low: { icon: 'flag-outline', color: '#6b7280' }
  };

  const { icon, color } = config[priority] || config.low;

  return <Ionicons name={icon} size={12} color={color} />;
};

export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [modalVisible, setModalVisible] = useState(false);
  const [taskList, setTaskList] = useState(tasks);
  const [activeFilter, setActiveFilter] = useState('all');

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];

  // Filter tasks based on active filter
  const getFilteredTasks = () => {
    if (activeFilter === 'today') {
      return taskList.filter(task => task.dueDate === today);
    }
    return taskList;
  };

  const filteredTasks = getFilteredTasks();

  // Calculate stats
  const completedTasks = filteredTasks.filter(task => task.isCompleted).length;
  const totalTasks = filteredTasks.length;

  const taskCounts = {
    all: taskList.length,
    today: taskList.filter(task => task.dueDate === today).length
  };

  // Handle task deletion
  const handleDeleteTask = (taskToDelete) => {
    setTaskList(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
  };

  // Category colors mapping
  const getCategoryColor = (category) => {
    const colors = {
      'Work': '#3b82f6',
      'Health': '#ef4444',
      'Fitness': '#06b6d4',
      'Personal': '#8b5cf6'
    };
    return colors[category] || '#6b7280';
  };

  // Render task with swipe functionality
  const renderSwipeableTask = (item) => (
    <SwipeableTaskItem
      key={item.id}
      item={item}
      onDelete={handleDeleteTask}
    >
      <Link href={`/tasks/${item.id}`} className="mb-3">
        <View className="bg-white dark:bg-gray-900 w-full rounded-2xl px-4 py-4 border border-gray-100 dark:border-gray-700">
          <View className="flex-row items-center">
            {/* Checkbox */}
            <TouchableOpacity className="mr-4">
              <View
                className={`w-6 h-6 rounded-full items-center justify-center ${item.isCompleted
                  ? 'bg-emerald-500'
                  : 'border-2 border-gray-300 dark:border-gray-600'
                  }`}
              >
                {item.isCompleted && (
                  <Ionicons name="checkmark" size={16} color="white" />
                )}
              </View>
            </TouchableOpacity>

            {/* Task Content */}
            <View className="flex-1">
              <View className="flex-row items-center mb-2">
                <Text
                  className={`text-base font-medium flex-1 ${item.isCompleted
                    ? 'text-gray-500 dark:text-gray-400 line-through'
                    : 'text-gray-900 dark:text-white'
                    }`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {item.title}
                </Text>
                <View className="ml-2">
                  <PriorityIcon priority={item.priority} />
                </View>
              </View>

              <View className="flex-row items-center">
                <View
                  className="w-2 h-2 rounded-full mr-2"
                  style={{ backgroundColor: getCategoryColor(item.category) }}
                />
                <Text className="text-xs text-gray-500 dark:text-gray-400 capitalize mr-3">
                  {item.category}
                </Text>
                {item.dueDate === today && (
                  <View className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                    <Text className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                      Today
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Menu Button */}
            <TouchableOpacity className="ml-4 p-2">
              <Ionicons
                name="ellipsis-horizontal"
                size={20}
                color={isDark ? '#6b7280' : '#9ca3af'}
              />
            </TouchableOpacity>
          </View>
        </View>
      </Link>
    </SwipeableTaskItem>
  );

  // Render simple task (when modal is open)
  const renderSimpleTask = (item) => (
    <View key={item.id} className="mb-3">
      <View className="bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 border border-gray-100 dark:border-gray-700">
        <View className="flex-row items-center">
          <View className="mr-4">
            <View
              className={`w-6 h-6 rounded-full items-center justify-center ${item.isCompleted
                ? 'bg-emerald-500'
                : 'border-2 border-gray-300 dark:border-gray-600'
                }`}
            >
              {item.isCompleted && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </View>

          <View className="flex-1">
            <View className="flex-row items-center mb-2">
              <Text
                className={`text-base font-medium flex-1 ${item.isCompleted
                  ? 'text-gray-500 dark:text-gray-400 line-through'
                  : 'text-gray-900 dark:text-white'
                  }`}
                numberOfLines={1}
              >
                {item.title}
              </Text>
              <View className="ml-2">
                <PriorityIcon priority={item.priority} />
              </View>
            </View>

            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getCategoryColor(item.category) }}
              />
              <Text className="text-xs text-gray-500 dark:text-gray-400 capitalize mr-3">
                {item.category}
              </Text>
              {item.dueDate === today && (
                <View className="bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded-full">
                  <Text className="text-orange-600 dark:text-orange-400 text-xs font-medium">
                    Today
                  </Text>
                </View>
              )}
            </View>
          </View>

          <View className="ml-4 p-2">
            <Ionicons
              name="ellipsis-horizontal"
              size={20}
              color={isDark ? '#6b7280' : '#9ca3af'}
            />
          </View>
        </View>
      </View>
    </View>
  );

  const displayTasks = filteredTasks.slice(0, 10);

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: insets.bottom + 40,
          paddingHorizontal: 15
        }}
        scrollEnabled={!modalVisible}
      >

        <View className="flex-row justify-between items-center my-5">
          <View>
            <Text className="text-3xl font-bold text-emerald-700 dark:text-white">
              My Tasks
            </Text>
            <Text className="text-emerald-700 text-[12px] dark:text-gray-400 mt-1">
              Manage your tasks efficiently
            </Text>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-3">
              <Ionicons name="notifications-outline" size={20} color={isDark ? '#9ca3af' : '#6b7280'} />
            </TouchableOpacity> 
          </View>
        </View>


        {/* Welcome Section */}
        <ProgressCard
          completedTasks={completedTasks}
          totalTasks={totalTasks} 
        />

        {/* Task Filter */}
        <TaskFilter
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          taskCounts={taskCounts}
          isDark={isDark}
        />

        {/* Task List Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900 dark:text-white">
            {activeFilter === 'today' ? "Today's Tasks" : 'My Tasks'}
          </Text>
          {filteredTasks.length > 10 && (
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Showing {displayTasks.length} of {filteredTasks.length}
            </Text>
          )}
        </View>

        {/* Task List */}
        {displayTasks.length > 0 ? (
          modalVisible ? (
            displayTasks.map(item => renderSimpleTask(item))
          ) : (
            displayTasks.map(item => renderSwipeableTask(item))
          )
        ) : (
          <View className="items-center py-12">
            <View className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center mb-4">
              <Ionicons name="checkmark-circle-outline" size={40} color={isDark ? '#6b7280' : '#9ca3af'} />
            </View>
            <Text className="text-gray-500 dark:text-gray-400 text-lg font-medium mb-2">
              {activeFilter === 'today' ? 'No tasks for today!' : 'No tasks yet'}
            </Text>
            <Text className="text-gray-400 dark:text-gray-500 text-center">
              {activeFilter === 'today'
                ? 'Enjoy your free time or create a new task'
                : 'Create your first task to get started'
              }
            </Text>
          </View>
        )}

        {/* View All Button */}
        {!modalVisible && filteredTasks.length > 10 && (
          <TouchableOpacity className="mt-4 py-4 bg-white dark:bg-gray-800 rounded-2xl items-center border border-gray-200 dark:border-gray-700">
            <Text className="text-gray-600 dark:text-gray-400 font-medium">
              View All Tasks ({filteredTasks.length})
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* Floating Action Button */}
      <View className={`absolute right-5`} style={{ bottom: insets.bottom + 45 }}>
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          className="w-14 h-14 bg-emerald-500 rounded-full items-center justify-center"
          style={{
            elevation: 0,
            shadowOpacity: 0,
          }}
        >
          <Ionicons name="add" size={28} color="white" />
        </TouchableOpacity>
      </View>

      <TaskCreationModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      />
    </View>
  );
}