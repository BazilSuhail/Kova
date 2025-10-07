import { useMemo } from "react";
import { Text, View } from "react-native";

export const TaskStats = ({ tasks }) => {
  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.is_completed).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, completionRate };
  }, [tasks]);

  return (
    <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mx-4 mb-4">
      <Text className="text-gray-900 dark:text-white font-semibold text-lg mb-3">
        Today's Progress
      </Text>

      <View className="flex-row justify-between">
        <View className="items-center">
          <Text className="text-2xl font-bold text-emerald-600">{stats.total}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Total</Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl font-bold text-green-600">{stats.completed}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Done</Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl font-bold text-orange-500">{stats.pending}</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Pending</Text>
        </View>

        <View className="items-center">
          <Text className="text-2xl font-bold text-blue-600">{stats.completionRate}%</Text>
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Complete</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View className="mt-4">
        <View className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <View
            className="bg-emerald-600 rounded-full h-2"
            style={{ width: `${stats.completionRate}%` }}
          />
        </View>
      </View>
    </View>
  );
};
