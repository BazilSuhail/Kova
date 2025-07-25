import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import React, { useState, useEffect } from 'react';
import { 
  ScrollView, 
  Text, 
  TouchableOpacity, 
  View, 
  Animated,
  Dimensions,
  StatusBar,
  Pressable
} from 'react-native';

const { width } = Dimensions.get('window');

const dashboardData = {
  tasks: [
    { id: '1', title: 'Submit assignment', category: 'Academics', completed: false, priority: 'high' },
    { id: '2', title: 'Buy groceries', category: 'Personal', completed: true, priority: 'medium' },
    { id: '3', title: 'Call project teammate', category: 'Work', completed: false, priority: 'low' },
  ],
  mood: {
    status: 'Energized',
    emoji: '💪',
    note: 'Ready to tackle today\'s challenges',
    score: 8
  },
  reminders: [
    { id: 'r1', title: 'Doctor appointment at 6 PM', urgent: true },
    { id: 'r2', title: 'Pay electricity bill', urgent: false },
  ],
  suggestions: [
    'Take a 5-minute mindfulness break.',
    'Review tomorrow\'s priorities tonight.',
    'Stay hydrated – drink more water.',
  ],
  schedule: [
    { time: '9:00 AM', activity: 'Team Meeting', status: 'completed' },
    { time: '11:00 AM', activity: 'Client Review Call', status: 'current' },
    { time: '3:00 PM', activity: 'Focus Work Session', status: 'upcoming' },
  ],
  goals: [
    { text: 'Read 10 pages', completed: true },
    { text: 'Journal your day', completed: false },
    { text: 'Sleep before 11 PM', completed: false }
  ],
};

export default function HomeScreen() {
  const [isDark, setIsDark] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTask, setSelectedTask] = useState(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const getGreeting = () => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const backgroundColors = isDark 
    ? ['#0f0f23', '#1a1a3a', '#2d1b69'] 
    : ['#f0f4ff', '#e0e7ff', '#c7d2fe'];

  return (
    <>
      <StatusBar 
        barStyle={isDark ? "light-content" : "dark-content"} 
        backgroundColor="transparent" 
        translucent 
      />
      
      <LinearGradient
        colors={backgroundColors}
        style={{ flex: 1 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Animated.View 
          style={{ 
            flex: 1, 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <ScrollView 
            className="flex-1 px-6" 
            style={{ paddingTop: 60 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row justify-between items-start mb-8">
              <View className="flex-1">
                <Text className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {getGreeting()} ✨
                </Text>
                <Text className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                  {formatTime(currentTime)} • Ready to assist you
                </Text>
              </View>
              
              <TouchableOpacity
                onPress={toggleTheme}
                className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800/60' : 'bg-white/80'}`}
                style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 }}
              >
                <Ionicons 
                  name={isDark ? "sunny" : "moon"} 
                  size={24} 
                  color={isDark ? "#fbbf24" : "#6366f1"} 
                />
              </TouchableOpacity>
            </View>

            {/* Quick Stats */}
            <View className="flex-row justify-between mb-8 space-x-4">
              <StatsCard
                value={dashboardData.tasks.filter(t => !t.completed).length}
                label="Pending"
                color="#6366f1"
                isDark={isDark}
              />
              <StatsCard
                value={`${dashboardData.mood.score}/10`}
                label="Mood"
                color="#10b981"
                isDark={isDark}
              />
              <StatsCard
                value={`${dashboardData.goals.filter(g => g.completed).length}/${dashboardData.goals.length}`}
                label="Goals"
                color="#8b5cf6"
                isDark={isDark}
              />
            </View>

            {/* Tasks Section */}
            <Section title="Today's Focus" icon="checkmark-done" color="#6366f1" isDark={isDark}>
              {dashboardData.tasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  isDark={isDark}
                  onPress={() => setSelectedTask(selectedTask?.id === task.id ? null : task)}
                  isSelected={selectedTask?.id === task.id}
                />
              ))}
            </Section>

            {/* Mood & AI Suggestions Row */}
            <View className="flex-row space-x-4 mb-6">
              <View className="flex-1">
                <Section title="Mood Check" icon="happy" color="#f59e0b" isDark={isDark}>
                  <MoodCard mood={dashboardData.mood} isDark={isDark} />
                </Section>
              </View>
              <View className="flex-1">
                <Section title="AI Insights" icon="bulb" color="#8b5cf6" isDark={isDark}>
                  <View className="space-y-2">
                    {dashboardData.suggestions.slice(0, 2).map((tip, idx) => (
                      <SuggestionItem key={idx} text={tip} isDark={isDark} />
                    ))}
                  </View>
                </Section>
              </View>
            </View>

            {/* Schedule */}
            <Section title="Today's Schedule" icon="calendar" color="#10b981" isDark={isDark}>
              {dashboardData.schedule.map((item, idx) => (
                <ScheduleItem key={idx} item={item} isDark={isDark} />
              ))}
            </Section>

            {/* Goals & Reminders Row */}
            <View className="flex-row space-x-4 mb-6">
              <View className="flex-1">
                <Section title="Daily Goals" icon="flag" color="#ef4444" isDark={isDark}>
                  {dashboardData.goals.map((goal, idx) => (
                    <GoalItem key={idx} goal={goal} isDark={isDark} />
                  ))}
                </Section>
              </View>
              <View className="flex-1">
                <Section title="Reminders" icon="notifications" color="#f97316" isDark={isDark}>
                  {dashboardData.reminders.map((reminder) => (
                    <ReminderItem key={reminder.id} reminder={reminder} isDark={isDark} />
                  ))}
                </Section>
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row justify-between space-x-3 mb-8">
              <ActionButton
                icon="add-circle"
                label="Add Task"
                colors={['#6366f1', '#8b5cf6']}
                isDark={isDark}
              />
              <ActionButton
                icon="heart"
                label="Log Mood"
                colors={['#ec4899', '#f97316']}
                isDark={isDark}
              />
              <ActionButton
                icon="create"
                label="Quick Note"
                colors={['#10b981', '#059669']}
                isDark={isDark}
              />
            </View>
          </ScrollView>
        </Animated.View>
      </LinearGradient>
    </>
  );
}

// Reusable Components
function StatsCard({ value, label, color, isDark }) {
  return (
    <BlurView 
      intensity={isDark ? 20 : 40} 
      tint={isDark ? "dark" : "light"}
      className="flex-1 rounded-2xl overflow-hidden"
      style={{ 
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.4)' : 'rgba(255, 255, 255, 0.4)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      }}
    >
      <View className="p-4 items-center">
        <Text className="text-2xl font-bold" style={{ color }}>
          {value}
        </Text>
        <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          {label}
        </Text>
      </View>
    </BlurView>
  );
}

function Section({ title, icon, color, children, isDark }) {
  return (
    <BlurView 
      intensity={isDark ? 30 : 50} 
      tint={isDark ? "dark" : "light"}
      className="rounded-3xl overflow-hidden mb-6"
      style={{ 
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.3)' : 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.15,
        shadowRadius: 16,
      }}
    >
      <View className="p-6">
        <View className="flex-row items-center mb-4">
          <Ionicons name={icon} size={22} color={color} />
          <Text className={`ml-3 text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {title}
          </Text>
        </View>
        {children}
      </View>
    </BlurView>
  );
}

function TaskItem({ task, isDark, onPress, isSelected }) {
  const priorityColors = {
    high: '#ef4444',
    medium: '#f59e0b', 
    low: '#10b981'
  };

  return (
    <Pressable
      onPress={onPress}
      className={`flex-row items-center p-4 rounded-2xl mb-3 ${
        isSelected 
          ? (isDark ? 'bg-indigo-900/50' : 'bg-indigo-100') 
          : (isDark ? 'bg-gray-800/30' : 'bg-white/50')
      }`}
      style={{
        transform: isSelected ? [{ scale: 1.02 }] : [{ scale: 1 }],
        shadowColor: isSelected ? '#6366f1' : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: isSelected ? 0.3 : 0.1,
        shadowRadius: 8,
      }}
    >
      <View className="flex-row items-center flex-1">
        <View 
          className={`w-6 h-6 rounded-full border-2 mr-4 items-center justify-center ${
            task.completed 
              ? 'bg-green-500 border-green-500' 
              : `border-gray-400 ${isDark ? 'border-gray-500' : 'border-gray-300'}`
          }`}
        >
          {task.completed && (
            <Ionicons name="checkmark" size={14} color="white" />
          )}
        </View>
        
        <View className="flex-1">
          <Text 
            className={`text-base font-medium ${
              task.completed 
                ? `line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}` 
                : `${isDark ? 'text-gray-100' : 'text-gray-800'}`
            }`}
          >
            {task.title}
          </Text>
          <View className="flex-row items-center mt-1 space-x-2">
            <Text 
              className={`text-xs px-2 py-1 rounded-full ${
                isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
              }`}
            >
              {task.category}
            </Text>
            <View 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: priorityColors[task.priority] }}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function MoodCard({ mood, isDark }) {
  return (
    <View className={`p-4 rounded-2xl ${isDark ? 'bg-orange-900/20' : 'bg-orange-50'}`}>
      <View className="flex-row items-center justify-between mb-2">
        <Text className="text-3xl">{mood.emoji}</Text>
        <Text className={`text-sm font-semibold ${isDark ? 'text-orange-300' : 'text-orange-700'}`}>
          {mood.status}
        </Text>
      </View>
      <Text className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        {mood.note}
      </Text>
    </View>
  );
}

function SuggestionItem({ text, isDark }) {
  return (
    <View className="flex-row items-start p-2 rounded-lg">
      <Ionicons 
        name="sparkles" 
        size={14} 
        color="#8b5cf6" 
        style={{ marginTop: 2, marginRight: 8 }} 
      />
      <Text className={`text-sm flex-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
        {text}
      </Text>
    </View>
  );
}

function ScheduleItem({ item, isDark }) {
  const statusColors = {
    completed: { bg: isDark ? 'bg-green-900/30' : 'bg-green-100', text: isDark ? 'text-green-300' : 'text-green-700' },
    current: { bg: isDark ? 'bg-blue-900/30' : 'bg-blue-100', text: isDark ? 'text-blue-300' : 'text-blue-700' },
    upcoming: { bg: isDark ? 'bg-gray-700/30' : 'bg-gray-100', text: isDark ? 'text-gray-300' : 'text-gray-600' }
  };

  return (
    <View className="flex-row items-center p-3 rounded-xl mb-2">
      <Ionicons 
        name="time" 
        size={16} 
        color={isDark ? '#9ca3af' : '#6b7280'} 
      />
      <Text className={`ml-3 text-sm font-medium w-20 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {item.time}
      </Text>
      <Text className={`flex-1 text-sm ml-2 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        {item.activity}
      </Text>
      <Text className={`text-xs px-2 py-1 rounded-full ${statusColors[item.status].bg} ${statusColors[item.status].text}`}>
        {item.status}
      </Text>
    </View>
  );
}

function GoalItem({ goal, isDark }) {
  return (
    <View className="flex-row items-center p-2 mb-2">
      <View 
        className={`w-5 h-5 rounded-full mr-3 ${
          goal.completed 
            ? 'bg-green-500' 
            : `border-2 ${isDark ? 'border-gray-500' : 'border-gray-300'}`
        }`}
      />
      <Text 
        className={`text-sm flex-1 ${
          goal.completed 
            ? `line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}` 
            : `${isDark ? 'text-gray-200' : 'text-gray-800'}`
        }`}
      >
        {goal.text}
      </Text>
    </View>
  );
}

function ReminderItem({ reminder, isDark }) {
  return (
    <View 
      className={`flex-row items-center p-3 rounded-xl mb-2 ${
        reminder.urgent 
          ? (isDark ? 'bg-red-900/20 border border-red-800/30' : 'bg-red-50 border border-red-200') 
          : ''
      }`}
    >
      <Ionicons 
        name="notifications" 
        size={14} 
        color={reminder.urgent ? '#ef4444' : (isDark ? '#9ca3af' : '#6b7280')} 
      />
      <Text className={`ml-2 text-sm flex-1 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        {reminder.title}
      </Text>
      {reminder.urgent && (
        <Text className={`text-xs px-2 py-1 rounded-full ${
          isDark ? 'bg-red-900/30 text-red-300' : 'bg-red-100 text-red-700'
        }`}>
          Urgent
        </Text>
      )}
    </View>
  );
}

function ActionButton({ icon, label, colors, isDark }) {
  return (
    <TouchableOpacity className="flex-1">
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-4 rounded-2xl items-center"
        style={{
          shadowColor: colors[0],
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
        }}
      >
        <Ionicons name={icon} size={24} color="white" />
        <Text className="text-white font-semibold text-sm mt-2">
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}