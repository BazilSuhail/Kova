import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

const PRIORITY_COLORS = {
  high: "#ef4444",
  medium: "#f59e0b",
  low: "#22c55e"
};

export function TaskItem ({ task, getCategoryColor }) {
  const color = getCategoryColor(task.category, task.is_completed);
  const priorityColor = PRIORITY_COLORS[task.priority] || PRIORITY_COLORS.low;

  return (
    <View className="flex-row items-center mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-2xl">
      <View
        className="w-4 h-4 rounded-full mr-4"
        style={{ backgroundColor: '#059669' }}
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