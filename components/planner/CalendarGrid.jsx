import { View, ScrollView, Text } from "react-native";
import { DayCell } from "./DayCell";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const CalendarGrid = ({ days, openModal, getCategoryColor }) => (
  <View className="flex-1 bg-slate-50 dark:bg-transparent">
    {/* Weekday Headers */}
    <View className="flex-row mb-2 px-2">
      {WEEK_DAYS.map((day, index) => (
        <View
          key={`weekday-${index}`}
          className="flex-1 items-center"
        >
          <Text className="text-gray-500 dark:text-gray-400 text-xs font-semibold">
            {day}
          </Text>
        </View>
      ))}
    </View>

    {/* Calendar Days */}
    <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
      <View className="flex-row flex-wrap justify-center">
        {days.map((day, index) => (
          <DayCell
            key={`cell-${index}`}
            day={day}
            index={index}
            openModal={openModal}
            getCategoryColor={getCategoryColor}
          />
        ))}
      </View>
    </ScrollView>
  </View>
);