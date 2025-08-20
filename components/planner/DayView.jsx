//import { ScrollView, Text } from "react-native";
import { EmptyState } from "./EmptyState";
//import { TaskItem } from "./TaskItem";

import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e"
};

const TaskItem = ({ task, getCategoryColor }) => {
  const color = getCategoryColor(task.category, task.is_completed);
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;

  return (
    <View className="flex-row items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
      <View
        className="w-4 h-4 rounded-full mr-3"
        style={{ backgroundColor: color }}
      />

      <View className="flex-1">
        <Text
          className={`text-gray-900 dark:text-white font-semibold ${task.is_completed ? 'line-through opacity-60' : ''
            }`}
        >
          {task.title}
        </Text>

        <View className="flex-row items-center mt-1">
          <Text className="text-gray-500 dark:text-gray-400 text-xs capitalize mr-3">
            {task.category}
          </Text>

          {task.duration && (
            <View className="flex-row items-center mr-3">
              <Feather name="clock" size={12} color="#9ca3af" />
              <Text className="text-gray-500 dark:text-gray-400 text-xs">
                {task.duration}
              </Text>
            </View>
          )}

          <View
            className="px-2 py-1 rounded-full"
            style={{ backgroundColor: `${priorityColor}20` }}
          >
            <Text
              className="text-xs font-medium capitalize"
              style={{ color: priorityColor }}
            >
              {task.priority}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity className="ml-3 p-1">
        {task.is_completed ? (
          <Ionicons name="checkmark-circle" size={24} color={color} />
        ) : (
          <MaterialIcons name="radio-button-unchecked" size={24} color={color} />
        )}
      </TouchableOpacity>
    </View>
  );
};

export const DayView = ({ day, getCategoryColor }) => {
  if (day || day.tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks scheduled"
        subtitle="Perfect day to relax or plan ahead!"
        icon="calendar"
      />
    );
  }

  return (
    <ScrollView className="flex-1 px-2" showsVerticalScrollIndicator={false}>
      <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        {day.tasks.length} task{day.tasks.length !== 1 ? 's' : ''} scheduled
      </Text>

      {day.tasks.map((task) => (
        <TaskItem key={task.id} task={task} getCategoryColor={getCategoryColor} />
      ))}
    </ScrollView>
  );
};