import TaskProgressChart from "@/components/charts/TaskProgressChart";
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const dummyTasks = [
  {
    id: 1,
    title: "Finish project report",
    createdAt: "2025-08-29T10:15:00Z",
    dueDate: "2025-08-30",
    isCompleted: true,
  },
  {
    id: 2,
    title: "Team meeting",
    createdAt: "2025-08-29T12:30:00Z",
    dueDate: "2025-08-29",
    isCompleted: false,
  },
  {
    id: 3,
    title: "Code review",
    createdAt: "2025-08-30T09:00:00Z",
    dueDate: "2025-08-30",
    isCompleted: true,
  },
  {
    id: 4,
    title: "Fix UI bugs",
    createdAt: "2025-08-31T14:20:00Z",
    dueDate: "2025-09-01",
    isCompleted: false,
  },
  {
    id: 5,
    title: "Write unit tests",
    createdAt: "2025-09-01T11:45:00Z",
    dueDate: "2025-09-01",
    isCompleted: true,
  },
  {
    id: 6,
    title: "Deploy app update",
    createdAt: "2025-09-02T08:00:00Z",
    dueDate: "2025-09-02",
    isCompleted: true,
  },
  {
    id: 7,
    title: "Plan sprint tasks",
    createdAt: "2025-09-03T10:30:00Z",
    dueDate: "2025-09-03",
    isCompleted: false,
  },
];


const dashboardData = {
  tasks: [
    { id: '1', title: 'Submit final project report', category: 'Academics', completed: false, priority: 'high', dueTime: '2:00 PM' },
    { id: '2', title: 'Morning yoga session', category: 'Health', completed: true, priority: 'medium', dueTime: '7:00 AM' },
    { id: '3', title: 'Team standup meeting', category: 'Work', completed: false, priority: 'high', dueTime: '10:30 AM' },
    { id: '4', title: 'Read 20 pages of "Atomic Habits"', category: 'Personal', completed: true, priority: 'low', dueTime: '9:00 PM' },
    { id: '5', title: 'Cardio workout at gym', category: 'Fitness', completed: false, priority: 'medium', dueTime: '6:00 PM' },
  ],
  todayStats: {
    completed: 7,
    pending: 3,
    totalTime: '4h 20m',
    streak: 12,
    focus: 85,
    productivity: 92
  },
  quickActions: [
    { id: 'add', title: 'Add Task', icon: 'add-circle-outline', color: '#10b981', bgColor: 'bg-emerald-100 dark:bg-emerald-900/30' },
    { id: 'voice', title: 'Voice Note', icon: 'mic-outline', color: '#3b82f6', bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
    { id: 'focus', title: 'Focus Mode', icon: 'timer-outline', color: '#f59e0b', bgColor: 'bg-amber-100 dark:bg-amber-900/30' },
    { id: 'ai', title: 'Ask AI', icon: 'chatbubble-outline', color: '#8b5cf6', bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
  ],
  recentActivity: [
    { time: '2 minutes ago', action: 'Completed "Morning yoga session"', type: 'completed' },
    { time: '15 minutes ago', action: 'Added new task "Team standup"', type: 'added' },
    { time: '1 hour ago', action: 'Started focus session', type: 'focus' },
    { time: '2 hours ago', action: 'Updated project deadline', type: 'updated' },
  ],
  insights: [
    { title: 'Peak Productivity', value: '10:00 AM', icon: 'trending-up', color: '#10b981' },
    { title: 'Most Active Day', value: 'Wednesday', icon: 'calendar-month', color: '#3b82f6' },
    { title: 'Avg Session', value: '45 min', icon: 'access-time', color: '#f59e0b' },
  ]
};

// Welcome Section Component
const WelcomeSection = ({ colorScheme, setColorScheme }) => {
  const currentHour = new Date().getHours();
  let greeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) greeting = 'Good Afternoon';
  else if (currentHour >= 17) greeting = 'Good Evening';

  return (
    <View className="mb-6 mt-5">
      <View className="flex-row justify-between items-center mb-4">
        <View>
          <Text className="text-3xl font-bold text-gray-900 dark:text-white">
            {greeting}! 👋
          </Text>
          <Text className="text-gray-600 dark:text-gray-400 mt-1">
            Let's make today productive
          </Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-3">
            <Ionicons name="notifications-outline" size={20} color={colorScheme === 'dark' ? '#9ca3af' : '#6b7280'} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
          >
            <Ionicons
              name={colorScheme === 'dark' ? "sunny" : "moon"}
              size={18}
              color="#059669"
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Statistics Component
const StatisticsOverview = ({ stats }) => {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 mb-6 border border-gray-100 dark:border-gray-700">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Today's Overview
        </Text>
        <View className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
          <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            {stats.completed}% Done
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <View className="items-center">
          <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {stats.completed}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Completed
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl font-bold text-orange-500">
            {stats.pending}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Pending
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl font-bold text-blue-600">
            {stats.total}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total
          </Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl font-bold text-purple-600">
            {stats.projects}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Projects
          </Text>
        </View>
      </View>
    </View>
  );
};

// Task Item Component
function TaskItem({ task, isFirst, isLast, onPress, isSelected, colorScheme }) {
  const getCategoryColor = (category) => {
    const colors = {
      'academics': '#f59e0b',
      'health': '#fb7185',
      'fitness': '#38bdf8',
      'personal': '#a78bfa',
      'work': '#64748b'
    };
    return colors[category.toLowerCase()] || '#64748b';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'high': '#ef4444',
      'medium': '#f59e0b',
      'low': '#10b981'
    };
    return colors[priority] || '#64748b';
  };

  const roundedStyle = {
    borderTopLeftRadius: isFirst ? 16 : 0,
    borderTopRightRadius: isFirst ? 16 : 0,
    borderBottomLeftRadius: isLast ? 16 : 0,
    borderBottomRightRadius: isLast ? 16 : 0,
  };

  return (
    <Pressable
      onPress={onPress}
      className={`px-4 py-4 ${task.completed
        ? 'bg-emerald-50 dark:bg-emerald-900/20'
        : 'bg-white dark:bg-gray-800'
        } ${isSelected ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
      style={[
        roundedStyle,
        !isLast && { borderBottomWidth: 1, borderBottomColor: colorScheme === 'dark' ? '#374151' : '#f1f5f9' }
      ]}
    >
      <View className="flex-row items-center">
        <TouchableOpacity
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${task.completed
            ? 'bg-emerald-600 border-emerald-600'
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'
            }`}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <Text
              className={`text-base font-semibold ${task.completed
                ? 'text-emerald-700 dark:text-emerald-400 line-through opacity-70'
                : 'text-gray-900 dark:text-white'
                }`}
            >
              {task.title}
            </Text>
            <Text className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {task.dueTime}
            </Text>
          </View>

          <View className="flex-row items-center justify-between">
            <View
              className="px-3 py-1.5 rounded-full mr-3"
              style={{ backgroundColor: `${getCategoryColor(task.category)}20` }}
            >
              <Text
                className="text-xs font-semibold"
                style={{ color: getCategoryColor(task.category) }}
              >
                {task.category}
              </Text>
            </View>

            <View className="flex-row items-center">
              <View
                className="w-2 h-2 rounded-full mr-2"
                style={{ backgroundColor: getPriorityColor(task.priority) }}
              />
              <Text className="text-xs font-medium text-gray-600 dark:text-gray-400 capitalize">
                {task.priority} priority
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

// Quick Actions Component
const QuickActions = ({ isDark }) => {
  const actions = [
    { id: 'voice', icon: 'mic-outline', label: 'Voice Task', color: '#3b82f6', bg: '#dbeafe' },
    { id: 'scan', icon: 'scan-outline', label: 'Scan Text', color: '#8b5cf6', bg: '#f3e8ff' },
    { id: 'schedule', icon: 'calendar-outline', label: 'Schedule', color: '#f59e0b', bg: '#fef3c7' },
    { id: 'ai', icon: 'sparkles-outline', label: 'AI Help', color: '#10b981', bg: '#d1fae5' }
  ];

  return (
    <View className="mb-6 flex-row justify-between">
      {actions.map((action) => (
        <View
          key={action.id}
          className="items-center"
          style={{gap:4}}
        >
          <View
            className="h-20 w-20 rounded-2xl items-center justify-center mb-2"
            style={{ backgroundColor: isDark ? action.color + '20' : action.bg }}
          >
            <Ionicons name={action.icon} size={25} color={action.color} />
          </View>
          <Text className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            {action.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

// AI Insights Component
const AIInsights = ({ insights }) => {
  return (
    <View className="mb-6">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-900 dark:text-white">
          AI Insights
        </Text>
        <TouchableOpacity>
          <Text className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
            View All
          </Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-between items-center">
        {insights.map((insight, index) => (
          <View
            key={index}
            className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
            style={{ marginRight: index < insights.length - 1 ? 8 : 0 }}
          >
            <View className="items-center">
              <View
                className="w-12 h-12 rounded-2xl items-center justify-center mb-4"
                style={{ backgroundColor: `${insight.color}20` }}
              >
                <MaterialIcons name={insight.icon} size={20} style={{ color: insight.color }} />
              </View>
              <Text className="text-[14px] font-bold text-gray-900 dark:text-white mb-2">
                {insight.value}
              </Text>
              <Text className="text-[10px] text-gray-600 dark:text-gray-400 text-center">
                {insight.title}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

// Animated Section Wrapper
const AnimatedSection = ({ children, delay }) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 500,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View
      style={{
        opacity,
        transform: [{ translateY }],
      }}
    >
      {children}
    </Animated.View>
  );
};

// Main Screen Component
export default function ModernHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [selectedTask, setSelectedTask] = useState(null);

  // Mock data - replace with real data
  const dashboardData = {
    todayStats: {
      completed: 65,
      pending: 12,
      total: 77,
      projects: 5
    },
    tasks: [
      { id: 1, title: 'Complete project proposal', completed: false, dueTime: '10:00 AM', category: 'work', priority: 'high' },
      { id: 2, title: 'Gym session', completed: true, dueTime: '6:00 PM', category: 'fitness', priority: 'medium' },
      { id: 3, title: 'Read 30 pages', completed: false, dueTime: '9:00 PM', category: 'personal', priority: 'low' },
    ],
    insights: [
      { title: 'Productivity', value: '87%', icon: 'show-chart', color: '#10b981' },
      { title: 'Focus Time', value: '4.2h', icon: 'timer', color: '#3b82f6' },
      { title: 'Tasks Done', value: '18/24', icon: 'check-circle', color: '#8b5cf6' },
    ]
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{  
          paddingBottom: insets.bottom + 80,
          paddingHorizontal: 15 
        }}
      >
        <AnimatedSection delay={0}>
          <WelcomeSection  
            colorScheme={colorScheme}
            setColorScheme={setColorScheme}
          />
        </AnimatedSection>

        <AnimatedSection delay={200}>
          <StatisticsOverview stats={dashboardData.todayStats} />
        </AnimatedSection>

        
 <AnimatedSection delay={250}>
   <TaskProgressChart tasks={dummyTasks} title="Weekly Task Progress" isDark={colorScheme} />
        </AnimatedSection>

        <AnimatedSection delay={400}>
          <AIInsights insights={dashboardData.insights} />
        </AnimatedSection>

        <AnimatedSection delay={600}>
          <QuickActions isDark={colorScheme} />
        </AnimatedSection>

        <AnimatedSection delay={800}>
          <View className="mb-6">
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-xl font-bold text-gray-900 dark:text-white">
                Today's Tasks
              </Text>
              <TouchableOpacity>
                <Text className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  View All
                </Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700">
              {dashboardData.tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isFirst={index === 0}
                  isLast={index === dashboardData.tasks.length - 1}
                  onPress={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  isSelected={selectedTask?.id === task.id}
                  colorScheme={colorScheme}
                />
              ))}
            </View>
          </View>
        </AnimatedSection>
      </ScrollView>
    </View>
  );
}