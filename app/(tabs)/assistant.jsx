import { Feather, Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Task Card Component
const TaskCard = ({ task }) => {
  const progressPercent = (task.completed / task.total) * 100;
  
  return (
    <Link href={task.href} asChild>
      <TouchableOpacity activeOpacity={0.7} className="mb-4">
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
          {/* Header */}
          <View className="flex-row justify-between items-center mb-3">
            <View 
              className="px-3 py-1.5 rounded-full"
              style={{ backgroundColor: `${task.color}20` }}
            >
              <Text 
                className="text-xs font-semibold uppercase tracking-wider"
                style={{ color: task.color }}
              >
                {task.category}
              </Text>
            </View>
            <TouchableOpacity className="p-2 rounded-full bg-gray-100 dark:bg-gray-700">
              <Ionicons name="ellipsis-horizontal" size={16} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          {/* Task Title */}
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4 leading-6">
            {task.title}
          </Text>

          {/* Progress Section */}
          <View className="flex-row justify-between items-center">
            <View className="flex-1">
              <Text className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-3">
                {task.completed}/{task.total} tasks completed
              </Text>

              {/* Progress Bar */}
              <View className="bg-gray-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden">
                <View
                  className="h-full rounded-full"
                  style={{
                    backgroundColor: task.color,
                    width: `${progressPercent}%`
                  }}
                />
              </View>
              
              {/* Progress Text */}
              <Text className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
                {Math.round(progressPercent)}% complete
              </Text>
            </View>

            {/* Edit Button */}
            <TouchableOpacity className="ml-4 w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-2xl items-center justify-center">
              <Feather name="edit-3" size={16} color={task.color} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Link>
  );
};

// AI Assistant Option Component
const AIOptionCard = ({ option, index }) => {
  return (
    <View className="w-1/2 px-2 mb-4">
      <Link href={option.href} asChild>
        <TouchableOpacity activeOpacity={0.7}>
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-4 border border-gray-100 dark:border-gray-700">
            <View 
              className={`w-14 h-14 rounded-2xl items-center justify-center mb-4 ${option.bgColor || ''}`}
              style={option.bgColorStyle ? { backgroundColor: option.bgColorStyle } : {}}
            >
              <Ionicons 
                name={option.icon} 
                size={24} 
                color={option.iconColor || "#059669"}
              />
            </View>
            <Text className="text-sm font-bold text-gray-900 dark:text-white mb-2 leading-5">
              {option.title}
            </Text>
            <Text className="text-xs text-gray-600 dark:text-gray-400 leading-4">
              {option.desc}
            </Text>
          </View>
        </TouchableOpacity>
      </Link>
    </View>
  );
};

// Quick Action Item Component
const QuickActionItem = ({ icon, title, description, color, bgColor, bgColorStyle, isLast = false }) => {
  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      className={`flex-row items-center py-4 ${!isLast ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}
    >
      <View 
        className={`w-12 h-12 rounded-2xl items-center justify-center mr-4 ${bgColor}`}
        style={bgColorStyle ? { backgroundColor: bgColorStyle } : {}}
      >
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View className="flex-1">
        <Text className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </Text>
        {description && (
          <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {description}
          </Text>
        )}
      </View>
      <Feather name="chevron-right" size={18} color="#9ca3af" />
    </TouchableOpacity>
  );
};

// Statistics Component
const StatisticsOverview = ({ tasks }) => {
  const totalTasks = tasks.reduce((sum, task) => sum + task.total, 0);
  const completedTasks = tasks.reduce((sum, task) => sum + task.completed, 0);
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const pendingTasks = totalTasks - completedTasks;

  return (
    <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 mb-6 border border-gray-100 dark:border-gray-700">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-lg font-bold text-gray-900 dark:text-white">
          Today's Overview
        </Text>
        <View className="bg-emerald-100 dark:bg-emerald-900/30 px-3 py-1 rounded-full">
          <Text className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
            {completionRate}% Done
          </Text>
        </View>
      </View>

      <View className="flex-row justify-between">
        <View className="items-center">
          <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedTasks}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Completed
          </Text>
        </View>
        
        <View className="items-center">
          <Text className="text-2xl font-bold text-orange-500">
            {pendingTasks}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Pending
          </Text>
        </View>
        
        <View className="items-center">
          <Text className="text-2xl font-bold text-blue-600">
            {totalTasks}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Total
          </Text>
        </View>
        
        <View className="items-center">
          <Text className="text-2xl font-bold text-purple-600">
            {tasks.length}
          </Text>
          <Text className="text-xs text-gray-600 dark:text-gray-400 mt-1">
            Projects
          </Text>
        </View>
      </View>
    </View>
  );
};

// Header Component
const AssistantHeader = ({ colorScheme, setColorScheme }) => {
  return (
    <View className="flex-row justify-between items-center mb-6">
      <View>
        <Text className="text-3xl font-bold text-gray-900 dark:text-white">
          AI Assistant
        </Text>
        <Text className="text-base text-gray-600 dark:text-gray-400 mt-1">
          Let me help you manage your tasks
        </Text>
      </View>
      
      <View className="flex-row items-center">
        <TouchableOpacity className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 mr-3">
          <Feather name="search" size={20} color="#9ca3af" />
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
  );
};

export default function ModernAssistantScreen() {
  const insets = useSafeAreaInsets();
  const { colorScheme, setColorScheme } = useColorScheme();

  // Enhanced task data
  const tasks = [
    {
      id: 1,
      title: "Finalize Project Proposal for Client",
      category: "Proposal",
      completed: 15,
      total: 20,
      color: "#10b981",
      href: "/tasks/project-proposal"
    },
    {
      id: 2,
      title: "Prepare for Weekly Team Meeting",
      category: "Meeting",
      completed: 5,
      total: 8,
      color: "#f59e0b",
      href: "/tasks/team-meeting"
    },
    {
      id: 3,
      title: "Design Landing Page for New App",
      category: "Design",
      completed: 0,
      total: 12,
      color: "#8b5cf6",
      href: "/tasks/landing-design"
    },
    {
      id: 4,
      title: "Review Code Documentation",
      category: "Development",
      completed: 3,
      total: 6,
      color: "#06b6d4",
      href: "/tasks/code-review"
    }
  ];

  // Enhanced AI Assistant options
  const aiOptions = [
    {
      title: "Image to Tasks",
      desc: "Capture tasks from photos",
      icon: "camera-outline",
      href: "/assistant/image-to-tasks",
      bgColorStyle: "#dbeafe",
      iconColor: "#3b82f6"
    },
    {
      title: "Voice Notes",
      desc: "Convert speech to tasks",
      icon: "mic-outline",
      href: "/assistant/voice-notes",
      bgColorStyle: "#dcfce7",
      iconColor: "#22c55e"
    },
    {
      title: "PDF Summarizer",
      desc: "Extract tasks from documents",
      icon: "document-text-outline",
      href: "/assistant/pdf-summarizer",
      bgColorStyle: "#f3e8ff",
      iconColor: "#a855f7"
    },
    {
      title: "Smart Scheduling",
      desc: "AI-powered task scheduling",
      icon: "calendar-outline",
      href: "/assistant/smart-scheduling",
      bgColorStyle: "#ffedd5",
      iconColor: "#f97316"
    },
    {
      title: "Task Breakdown",
      desc: "Split complex tasks",
      icon: "list-circle-outline",
      href: "/assistant/task-breakdown",
      bgColorStyle: "#fce7f3",
      iconColor: "#ec4899"
    },
    {
      title: "Priority Advisor",
      desc: "Get task prioritization help",
      icon: "flash-outline",
      href: "/assistant/priority-advisor",
      bgColorStyle: "#fef9c3",
      iconColor: "#eab308"
    }
  ];

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        contentContainerStyle={{ 
          paddingHorizontal: 15,  
          paddingBottom: insets.bottom + 20
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <AssistantHeader colorScheme={colorScheme} setColorScheme={setColorScheme} />

        {/* AI Tips Section */}
        <View className="mt-5 mb-10 bg-emerald-50 to-blue-50 dark:bg-emerald-900/20 rounded-3xl p-5 border border-emerald-200 dark:border-emerald-800">
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-900/40 items-center justify-center mr-3">
              <Ionicons name="bulb-outline" size={20} color="#059669" />
            </View>
            <Text className="text-lg font-bold text-gray-900 dark:text-white">
              AI Tip of the Day
            </Text>
          </View>
          <Text className="text-gray-700 dark:text-gray-300 leading-6">
            Try breaking down large tasks into smaller, manageable chunks. This makes them less overwhelming and easier to track progress!
          </Text>
          <TouchableOpacity className="mt-3">
            <Text className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
              Learn more productivity tips →
            </Text>
          </TouchableOpacity>
        </View> 

        {/* AI Assistant Section */}
        <View className="mb-6">
          <View className="flex-row  px-1 justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              What can I help you with?
            </Text>
            <TouchableOpacity>
              <Text className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                View All
              </Text>
            </TouchableOpacity>
          </View>

          {/* AI Options Grid */}
          <View className="flex-row flex-wrap -mx-2">
            {aiOptions.map((option, idx) => (
              <AIOptionCard key={idx} option={option} index={idx} />
            ))}
          </View>
        </View>

        {/* Current Projects */}
        <View className="mb-6">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-900 dark:text-white">
              Current Projects
            </Text>
            <TouchableOpacity>
              <Text className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                Manage All
              </Text>
            </TouchableOpacity>
          </View>

          {/* Task Cards */}
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </View>

        {/* Quick Actions */}
        <View className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700">
          <Text className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </Text>

          <QuickActionItem
            icon="add-circle-outline"
            title="Create New Task"
            description="Add a new task to your list"
            color="#10b981"
            bgColorStyle="#d1fae5"
          />

          <QuickActionItem
            icon="calendar-outline"
            title="Schedule Tasks"
            description="Plan your tasks for the week"
            color="#3b82f6"
            bgColorStyle="#dbeafe"
          />

          <QuickActionItem
            icon="stats-chart-outline"
            title="View Analytics"
            description="Check your productivity insights"
            color="#8b5cf6"
            bgColorStyle="#f3e8ff"
          />

          <QuickActionItem
            icon="settings-outline"
            title="Preferences"
            description="Customize your assistant settings"
            color="#6b7280"
            bgColorStyle="#f3f4f6"
            isLast={true}
          />
        </View>

      </ScrollView>
    </View>
  );
}