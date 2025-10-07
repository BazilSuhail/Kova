import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

export const ViewTypeButton = ({ type, icon, label, viewType, setViewType }) => (
  <TouchableOpacity
    onPress={() => setViewType(type)}
    className={`flex-1 flex-row items-center justify-center py-3 rounded-xl ${viewType === type
        ? 'bg-white dark:bg-gray-700'
        : 'bg-transparent'
      }`}
    activeOpacity={0.7}
  >
    <MaterialIcons
      name={icon}
      size={18}
      color={viewType === type ? '#059669' : '#9ca3af'}
    />
    <Text
      className={`ml-2 text-sm font-medium ${viewType === type
          ? 'text-emerald-600 dark:text-emerald-400'
          : 'text-gray-500 dark:text-gray-400'
        }`}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
