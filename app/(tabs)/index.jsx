import { Feather, Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useColorScheme } from 'nativewind';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Dimensions,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width } = Dimensions.get("window");

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
            {stats.completed}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Pending
          </Text>
        </View>
        
        <View className="items-center">
          <Text className="text-2xl font-bold text-blue-600">
            {stats.completed}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total
          </Text>
        </View>
        
        <View className="items-center">
          <Text className="text-2xl font-bold text-purple-600">
            {stats.length}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Projects
          </Text>
        </View>
      </View>
    </View>
  );
};

// Enhanced Header Component
const HomeHeader = ({ currentTime, getGreeting, colorScheme, setColorScheme }) => {
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <View className="px-6 mb-8">
      <View className="flex-row justify-between items-start">
        <View className="flex-1">
          <Text className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {getGreeting()}
          </Text>
          <View className="flex-row items-center">
            <Feather name="clock" size={14} className="text-gray-500 dark:text-gray-400 mr-2" />
            <Text className="text-sm text-gray-600 dark:text-gray-400">
              {formatTime(currentTime)} • Your AI is ready to help
            </Text>
          </View>
        </View>
        
        <View className="flex-row items-center">
          <TouchableOpacity 
            onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-3 shadow-sm"
          >
            <Ionicons 
              name={colorScheme === 'dark' ? "sunny" : "moon"} 
              size={18} 
              className="text-emerald-600 dark:text-emerald-400"
            />
          </TouchableOpacity>
          
          <TouchableOpacity>
            <LinearGradient
              colors={['#10b981', '#059669']}
              className="w-12 h-12 rounded-2xl items-center justify-center shadow-sm"
            >
              <Ionicons name="person" size={22} color="white" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

// Enhanced Stats Card Component
function StatsCard({ number, label, icon, color, style }) {
  const getColorConfig = (color) => {
    switch (color) {
      case 'emerald':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          iconBg: '#10b981',
          textColor: 'text-emerald-700 dark:text-emerald-400',
          numberColor: 'text-emerald-600 dark:text-emerald-400'
        };
      case 'amber':
        return {
          bg: 'bg-amber-100 dark:bg-amber-900/30',
          iconBg: '#f59e0b',
          textColor: 'text-amber-700 dark:text-amber-400',
          numberColor: 'text-amber-600 dark:text-amber-400'
        };
      case 'rose':
        return {
          bg: 'bg-rose-100 dark:bg-rose-900/30',
          iconBg: '#fb7185',
          textColor: 'text-rose-700 dark:text-rose-400',
          numberColor: 'text-rose-600 dark:text-rose-400'
        };
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          iconBg: '#64748b',
          textColor: 'text-gray-700 dark:text-gray-400',
          numberColor: 'text-gray-600 dark:text-gray-300'
        };
    }
  };

  const colorConfig = getColorConfig(color);

  return (
    <View 
      className={`${colorConfig.bg} rounded-2xl p-4 border border-white/50 dark:border-gray-700/50`}
      style={style}
    >
      <View className="flex-row items-center justify-between mb-2">
        <Text className={`text-2xl font-bold ${colorConfig.numberColor}`}>
          {number}
        </Text>
        <View 
          className="w-10 h-10 rounded-2xl items-center justify-center"
          style={{ backgroundColor: colorConfig.iconBg }}
        >
          <Ionicons name={icon} size={18} color="white" />
        </View>
      </View>
      <Text className="text-sm font-medium text-gray-600 dark:text-gray-400">
        {label}
      </Text>
    </View>
  );
}

// Enhanced Task Item Component
function TaskItem({ colorScheme,task, isFirst, isLast, onPress, isSelected }) {
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
      className={`px-5 py-4 ${
        task.completed 
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
          className={`w-6 h-6 rounded-full border-2 items-center justify-center mr-4 ${
            task.completed 
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
              className={`text-base font-semibold ${
                task.completed 
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

// Enhanced Quick Action Card Component
function QuickActionCard({ action, style }) {
  return (
    <TouchableOpacity activeOpacity={0.7} style={style}>
      <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 items-center shadow-sm border border-gray-100 dark:border-gray-700">
        <View 
          className={`w-14 h-14 rounded-2xl items-center justify-center mb-3 ${action.bgColor}`}
        >
          <Ionicons name={action.icon} size={24} style={{ color: action.color }} />
        </View>
        <Text className="text-sm font-semibold text-gray-900 dark:text-white text-center">
          {action.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// Enhanced Activity Item Component
function ActivityItem({ activity, isLast }) {
  const getActivityIcon = (type) => {
    const configs = {
      'completed': { icon: 'checkmark-circle', color: '#10b981' },
      'added': { icon: 'add-circle', color: '#3b82f6' },
      'focus': { icon: 'flash', color: '#f59e0b' },
      'updated': { icon: 'pencil-outline', color: '#8b5cf6' }
    };
    return configs[type] || { icon: 'information-circle', color: '#64748b' };
  };

  const iconConfig = getActivityIcon(activity.type);

  return (
    <View 
      className="px-5 py-4"
      style={[
        { 
          borderBottomLeftRadius: isLast ? 16 : 0,
          borderBottomRightRadius: isLast ? 16 : 0,
        },
        !isLast && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }
      ]}
    >
      <View className="flex-row items-center">
        <View 
          className="w-10 h-10 rounded-2xl items-center justify-center mr-4"
          style={{ backgroundColor: `${iconConfig.color}20` }}
        >
          <Ionicons name={iconConfig.icon} size={18} style={{ color: iconConfig.color }} />
        </View>
        
        <View className="flex-1">
          <Text className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
            {activity.action}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400">
            {activity.time}
          </Text>
        </View>
        
        <Feather name="chevron-right" size={16} className="text-gray-400 dark:text-gray-500" />
      </View>
    </View>
  );
}

// AI Insights Component
const AIInsights = ({ insights }) => {
  return (
    <View className="px-6 mb-6">
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
      
      <View className="flex-row">
        {insights.map((insight, index) => (
          <View 
            key={index}
            className="flex-1 bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-100 dark:border-gray-700 shadow-sm"
            style={{ marginRight: index < insights.length - 1 ? 8 : 0 }}
          >
            <View className="items-center">
              <View 
                className="w-12 h-12 rounded-2xl items-center justify-center mb-3"
                style={{ backgroundColor: `${insight.color}20` }}
              >
                <MaterialIcons name={insight.icon} size={20} style={{ color: insight.color }} />
              </View>
              <Text className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                {insight.value}
              </Text>
              <Text className="text-xs text-gray-600 dark:text-gray-400 text-center">
                {insight.title}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
};

export default function ModernHomeScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 70,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
    
    return () => clearInterval(timer);
  }, []);

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          className="flex-1"
          style={{ paddingTop: insets.top + 10 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        >
          {/* Header */}
          <HomeHeader 
            currentTime={currentTime}
            getGreeting={getGreeting}
            colorScheme={colorScheme}
            setColorScheme={setColorScheme}
          />

          {/* Statistics Overview */}
          <StatisticsOverview stats={dashboardData.todayStats} colorScheme={colorScheme} />

          {/* AI Insights */}
          <AIInsights insights={dashboardData.insights} />

          {/* Quick Actions */}
          <View className="px-6 mb-6">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap -mx-2">
              {dashboardData.quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  style={{ 
                    marginHorizontal: 8,
                    marginBottom: 16,
                    width: (Dimensions.get('window').width - 64) / 2 - 8
                  }}
                />
              ))}
            </View>
          </View>

          {/* My Tasks */}
          <View className="px-6 mb-6">
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
            
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              {dashboardData.tasks.map((task, index) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isFirst={index === 0}
                  isLast={index === dashboardData.tasks.length - 1}
                  onPress={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  isSelected={selectedTask?.id === task.id}
                />
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View className="px-6 mb-6">
            <Text className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </Text>
            <View className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
              {dashboardData.recentActivity.map((activity, index) => (
                <ActivityItem
                  key={index}
                  activity={activity}
                  isLast={index === dashboardData.recentActivity.length - 1}
                />
              ))}
            </View>
          </View>
        </ScrollView> 
      </Animated.View>
    </View>
  );
}