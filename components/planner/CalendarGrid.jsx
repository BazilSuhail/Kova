import { ScrollView, Text, View } from "react-native";
import { DayCell } from "./DayCell";

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid ({ days, openModal, getCategoryColor }) {
  
 return(
   <View className="flex-1">
    {/* Weekday Headers */}
    <View className="flex-row mb-2 p">
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
 )
};
