import TaskCreationModal from '@/components/tasks/TaskCreationModal';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useState } from 'react';
import { FlatList, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  runOnJS,
  withSpring,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Mock Task Data
const tasks = [
  { id: '1', title: 'Finish AI project', category: 'Academics', isCompleted: false },
  { id: '2', title: 'Call dentist', category: 'Health', isCompleted: true },
  { id: '3', title: 'Workout session', category: 'Fitness', isCompleted: false },
  { id: '4', title: 'Grocery shopping', category: 'Personal', isCompleted: false },
  { id: '5', title: 'Workout session', category: 'Fitness', isCompleted: false },
  { id: '6', title: 'Grocery shopping', category: 'Personal', isCompleted: false },
  { id: '7', title: 'Workout session', category: 'Fitness', isCompleted: false },
  { id: '8', title: 'Grocery shopping', category: 'Personal', isCompleted: true },
  { id: '9', title: 'Workout session', category: 'Fitness', isCompleted: false },
  { id: '14', title: 'Grocery shopping', category: 'Personal', isCompleted: true },
];

// Custom Swipeable Component using latest Reanimated and Gesture Handler
const SwipeableTaskItem = ({ item, onDelete, children }) => {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newTranslateX = startX.value + event.translationX;
      translateX.value = Math.min(0, newTranslateX);
    })
    .onEnd((event) => {
      const shouldDelete = event.translationX < -100;

      if (shouldDelete) {
        translateX.value = withSpring(-300);
        opacity.value = withSpring(0, undefined, (finished) => {
          if (finished) {
            runOnJS(onDelete)(item);
          }
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const scale = translateX.value < -50 ? 1 : 0;
    return {
      transform: [{ scale: withSpring(scale) }],
    };
  });

  return (
    <View className="relative">
      {/* Delete Button Background */}
      <Animated.View
        style={deleteButtonStyle}
        className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 rounded-r-xl items-center justify-center mb-5 z-0"
      >
        <Ionicons name="trash" size={24} color="white" />
      </Animated.View>

      {/* Main Task Item */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

export default function TasksScreen() {
  const [modalVisible, setModalVisible] = useState(false);
  const [taskList, setTaskList] = useState(tasks);

  // Calculate completion stats
  const completedTasks = taskList.filter(task => task.isCompleted).length;
  const totalTasks = taskList.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  // Handle task deletion
  const handleDeleteTask = (taskToDelete) => {
    setTaskList(prevTasks => prevTasks.filter(task => task.id !== taskToDelete.id));
  };

  // Render individual task with swipe functionality
  const renderTask = ({ item }) => (
    <SwipeableTaskItem
      item={item}
      onDelete={handleDeleteTask}
    >
      <Link href={`/tasks/${item.id}`} className='mb-4'>
        <View className={`flex-row items-center rounded-xl bg-white border-l-4 px-4 py-4 ${item.isCompleted ? 'border-emerald-500 bg-emerald-50' : 'border-gray-300'
          }`}>
          {/* Checkbox */}
          <TouchableOpacity className="mr-4">
            <View
              className={`w-6 h-6 rounded-full items-center justify-center ${item.isCompleted ? 'bg-emerald-500' : 'border-2 border-gray-300'
                }`}
            >
              {item.isCompleted && (
                <Ionicons name="checkmark" size={16} color="white" />
              )}
            </View>
          </TouchableOpacity>

          {/* Task Content - Takes remaining space */}
          <View className="flex-1 min-w-0">
            <Text
              className={`text-base font-medium ${item.isCompleted ? 'text-emerald-700 line-through' : 'text-gray-800'
                }`}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {item.title}
            </Text>
            <View className="flex-row items-center mt-1">
              <View
                className={`w-2 h-2 rounded-full mr-2 ${item.category === 'Academics' ? 'bg-amber-400' :
                  item.category === 'Health' ? 'bg-rose-400' :
                    item.category === 'Fitness' ? 'bg-sky-400' : 'bg-purple-400'
                  }`}
              />
              <Text
                className={`text-xs ${item.isCompleted ? 'text-emerald-600' : 'text-gray-500'
                  } capitalize`}
              >
                {item.category}
              </Text>
            </View>
          </View>

          {/* Menu Button */}
          <TouchableOpacity className="ml-4 p-2">
            <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
          </TouchableOpacity>
        </View>
      </Link>
    </SwipeableTaskItem>
  );

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
      showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 20, paddingTop: 60 }}
        className="flex-1 bg-gray-50"
      >
        {/* Header */}
        <View className="mb-8 ">
          <View className="flex-row items-center mb-2">
            <Ionicons name="leaf" size={28} color="#059669" />
            <Text className="text-3xl font-bold text-gray-900 ml-2">LeafTasks</Text>
          </View>
          <Text className="text-gray-500 text-base">Your personal AI assistant</Text>
        </View>

        {/* Progress Section */}
        <View className="bg-emerald-50 rounded-2xl p-5 mb-6">
          <View className="flex-row justify-between mb-2">
            <Text className="text-emerald-800 font-semibold">Today's Progress</Text>
            <Text className="text-emerald-700 font-bold">{completedTasks}/{totalTasks}</Text>
          </View>
          <View className="h-3 bg-emerald-100 rounded-full overflow-hidden">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </View>
        </View>
 
        {/* Task List Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-800">My Tasks</Text>
        </View>

        {/* Task List */}
        <FlatList
          data={taskList}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={renderTask}
        />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
        className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full items-center justify-center"
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </View>
  );
}