import { Feather, Ionicons } from "@expo/vector-icons";
import { View, Text, TouchableOpacity } from "react-native";
import { ViewTypeButton } from "./ViewTypeButton";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export const PlannerHeader = ({
  currentDate,
  viewType,
  setViewType,
  navigatePeriod,
  goToToday,
  getHeaderTitle,
  colorScheme,
  setColorScheme
}) => {
  return (
    <View className="pt-2">
      <View className="px-4 py-3">
        {/* Top Navigation Row */}
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigatePeriod("prev")}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mr-2"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-back" size={20} color="#059669" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goToToday}
              className="px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl"
              activeOpacity={0.7}
            >
              <Text className="text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                Today
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigatePeriod("next")}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 ml-2"
              activeOpacity={0.7}
            >
              <Ionicons name="chevron-forward" size={20} color="#059669" />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center">
            <TouchableOpacity
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800 mr-2"
              activeOpacity={0.7}
            >
              <Feather name="plus" size={20} color="#059669" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark')}
              className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800"
              activeOpacity={0.7}
            >
              <Ionicons
                name={colorScheme === 'dark' ? "sunny" : "moon"}
                size={18}
                color="#059669"
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title */}
        <Text className="text-gray-900 dark:text-white text-2xl font-bold mb-4">
          {getHeaderTitle()}
        </Text>

        {/* View Type Selector */}
        <View className="flex-row bg-gray-100 dark:bg-gray-800 rounded-2xl p-1">
          <ViewTypeButton type="day" icon="today" label="Day" viewType={viewType} setViewType={setViewType} />
          <ViewTypeButton type="week" icon="view-week" label="Week" viewType={viewType} setViewType={setViewType} />
          <ViewTypeButton type="month" icon="calendar-month" label="Month" viewType={viewType} setViewType={setViewType} />
        </View>
      </View>
    </View>
  );
};