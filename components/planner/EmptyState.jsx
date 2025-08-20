import { Feather } from "@expo/vector-icons";
import { Text, View } from "react-native";

export const EmptyState = ({ title, subtitle, icon = "calendar" }) => (
  <View className="flex-1 justify-center items-center py-12">
    <View className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-3xl mb-4">
      <Feather name={icon} size={48} color="#059669" />
    </View>
    <Text className="text-gray-900 dark:text-white text-center font-bold text-xl mb-2">
      {title}
    </Text>
    <Text className="text-gray-500 dark:text-gray-400 text-center max-w-sm">
      {subtitle}
    </Text>
  </View>
);