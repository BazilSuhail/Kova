import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const dashboardData = {
  tasks: [
    { id: '1', title: 'Submit final project report', category: 'Academics', completed: false, priority: 'high' },
    { id: '2', title: 'Morning yoga session', category: 'Health', completed: true, priority: 'medium' },
    { id: '3', title: 'Team standup meeting', category: 'Work', completed: false, priority: 'high' },
    { id: '4', title: 'Read 20 pages', category: 'Personal', completed: true, priority: 'low' },
    { id: '5', title: 'Cardio workout', category: 'Fitness', completed: false, priority: 'medium' },
  ],
  todayStats: {
    completed: 7,
    pending: 3,
    totalTime: '4h 20m',
    streak: 12
  },
  quickActions: [
    { id: 'add', title: 'Add Task', icon: 'add-circle-outline' },
    { id: 'mood', title: 'Log Mood', icon: 'happy-outline' },
    { id: 'note', title: 'Quick Note', icon: 'create-outline' },
    { id: 'timer', title: 'Focus Timer', icon: 'timer-outline' },
  ],
  recentActivity: [
    { time: '2 minutes ago', action: 'Completed "Morning yoga session"', type: 'completed' },
    { time: '15 minutes ago', action: 'Added new task "Team standup"', type: 'added' },
    { time: '1 hour ago', action: 'Updated project deadline', type: 'updated' },
  ]
};

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
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

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <View className="flex-1 bg-[#F6F7F8]">
      <Animated.View
        style={{
          flex: 1,
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <ScrollView
          className="flex-1"
          style={{ paddingTop: insets.top + 20 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: insets.bottom+20 }}
        >
          {/* Header */}
          <View className="px-6" style={{ marginBottom: 32 }}>
            <View className="flex-row justify-between items-start">
              <View className="flex-1">
                <Text className="text-2xl font-bold text-gray-800" style={{ marginBottom: 4 }}>
                  {getGreeting()}
                </Text>
                <Text className="text-sm text-gray-500">
                  {formatTime(currentTime)} • Your personal AI assistant
                </Text>
              </View>
              <TouchableOpacity>
                <View className="w-10 h-10 rounded-full bg-emerald-600 items-center justify-center">
                  <Ionicons name="person" size={20} color="white" />
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* Today's Overview */}
          <View className="px-6" style={{ marginBottom: 24 }}>
            <Text className="text-lg font-semibold text-gray-800" style={{ marginBottom: 16 }}>
              Today's Overview
            </Text>
            <View className="flex-row">
              <StatsCard
                number={dashboardData.todayStats.completed}
                label="Completed"
                icon="checkmark-circle"
                color="emerald"
                style={{ marginRight: 12 }}
              />
              <StatsCard
                number={dashboardData.todayStats.pending}
                label="Pending"
                icon="time"
                color="amber"
                style={{ marginRight: 12 }}
              />
              <StatsCard
                number={dashboardData.todayStats.streak}
                label="Day Streak"
                icon="flame"
                color="rose"
              />
            </View>
          </View>

          {/* My Tasks */}
          <View className="px-6" style={{ marginBottom: 24 }}>
            <View className="flex-row justify-between items-center" style={{ marginBottom: 16 }}>
              <Text className="text-lg font-semibold text-gray-800">My Tasks</Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>
            
            <View className="bg-white rounded-2xl">
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

          {/* Quick Actions */}
          <View className="px-6" style={{ marginBottom: 24 }}>
            <Text className="text-lg font-semibold text-gray-800" style={{ marginBottom: 16 }}>
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap">
              {dashboardData.quickActions.map((action, index) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  style={{ 
                    marginRight: index % 2 === 0 ? 12 : 0,
                    marginBottom: 12,
                    width: '48%'
                  }}
                />
              ))}
            </View>
          </View>

          {/* Recent Activity */}
          <View className="px-6" style={{ marginBottom: 24 }}>
            <Text className="text-lg font-semibold text-gray-800" style={{ marginBottom: 16 }}>
              Recent Activity
            </Text>
            <View className="bg-white rounded-2xl">
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

function StatsCard({ number, label, icon, color, style }) {
  const getColorConfig = (color) => {
    switch (color) {
      case 'emerald':
        return {
          bg: '#ecfdf5',
          iconBg: '#10b981',
          textColor: '#047857'
        };
      case 'amber':
        return {
          bg: '#fffbeb',
          iconBg: '#f59e0b',
          textColor: '#92400e'
        };
      case 'rose':
        return {
          bg: '#fff1f2',
          iconBg: '#fb7185',
          textColor: '#be123c'
        };
      default:
        return {
          bg: '#f8fafc',
          iconBg: '#64748b',
          textColor: '#475569'
        };
    }
  };

  const colorConfig = getColorConfig(color);

  return (
    <View 
      className="flex-1 rounded-xl p-4"
      style={[{ backgroundColor: colorConfig.bg }, style]}
    >
      <View className="flex-row items-center justify-between" style={{ marginBottom: 8 }}>
        <Text className="text-2xl font-bold" style={{ color: colorConfig.textColor }}>
          {number}
        </Text>
        <View 
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ backgroundColor: colorConfig.iconBg }}
        >
          <Ionicons name={icon} size={16} color="white" />
        </View>
      </View>
      <Text className="text-sm font-medium text-gray-500">
        {label}
      </Text>
    </View>
  );
}

function TaskItem({ task, isFirst, isLast, onPress, isSelected }) {
  const getCategoryColor = (category) => {
    switch (category.toLowerCase()) {
      case 'academics': return '#f59e0b';
      case 'health': return '#fb7185';
      case 'fitness': return '#38bdf8';
      case 'personal': return '#a78bfa';
      case 'work': return '#64748b';
      default: return '#64748b';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#64748b';
    }
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
      className={`px-4 py-4 ${task.completed ? 'bg-emerald-50' : 'bg-white'} ${isSelected ? 'bg-gray-50' : ''}`}
      style={[
        roundedStyle,
        !isLast && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }
      ]}
    >
      <View className="flex-row items-start">
        <TouchableOpacity 
          className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
            task.completed ? 'bg-emerald-600 border-emerald-600' : 'border-gray-300 bg-white'
          }`}
          style={{ marginRight: 12, marginTop: 2 }}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </TouchableOpacity>

        <View className="flex-1">
          <Text 
            className={`text-base font-medium ${
              task.completed ? 'text-emerald-700 line-through' : 'text-gray-800'
            }`}
            style={{ marginBottom: 8 }}
          >
            {task.title}
          </Text>
          
          <View className="flex-row items-center justify-between">
            <View 
              className="px-3 py-1 rounded-full"
              style={{ 
                backgroundColor: `${getCategoryColor(task.category)}15`,
                marginRight: 8
              }}
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
                className="w-2 h-2 rounded-full"
                style={{ 
                  backgroundColor: getPriorityColor(task.priority),
                  marginRight: 4
                }}
              />
              <Text className="text-xs font-medium text-gray-500 capitalize">
                {task.priority}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function QuickActionCard({ action, style }) {
  return (
    <TouchableOpacity style={style}>
      <View className="bg-white rounded-xl p-4 items-center">
        <View 
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: '#ecfdf5', marginBottom: 8 }}
        >
          <Ionicons name={action.icon} size={24} color="#059669" />
        </View>
        <Text className="text-sm font-medium text-gray-800 text-center">
          {action.title}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

function ActivityItem({ activity, isLast }) {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'completed': return { icon: 'checkmark-circle', color: '#10b981' };
      case 'added': return { icon: 'add-circle', color: '#3b82f6' };
      case 'updated': return { icon: 'pencil-outline', color: '#f59e0b' };
      default: return { icon: 'information-circle', color: '#64748b' };
    }
  };

  const iconConfig = getActivityIcon(activity.type);

  return (
    <View 
      className="px-4 py-4"
      style={[
        { 
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: isLast ? 16 : 0,
          borderBottomRightRadius: isLast ? 16 : 0,
        },
        !isLast && { borderBottomWidth: 1, borderBottomColor: '#f1f5f9' }
      ]}
    >
      <View className="flex-row items-start">
        <View 
          className="w-8 h-8 rounded-full items-center justify-center"
          style={{ 
            backgroundColor: `${iconConfig.color}15`,
            marginRight: 12,
            marginTop: 2
          }}
        >
          <Ionicons name={iconConfig.icon} size={16} color={iconConfig.color} />
        </View>
        
        <View className="flex-1">
          <Text className="text-sm font-medium text-gray-800" style={{ marginBottom: 2 }}>
            {activity.action}
          </Text>
          <Text className="text-xs text-gray-500">
            {activity.time}
          </Text>
        </View>
      </View>
    </View>
  );
}