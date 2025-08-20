import { View, Text, TouchableOpacity } from "react-native";
import { Dimensions } from "react-native"; 

const { width } = Dimensions.get("window");

const TaskDot = ({ color, size = 6 }) => (
  <View
    className="rounded-full mx-0.5"
    style={{
      backgroundColor: color,
      width: size,
      height: size
    }}
  />
);

export const DayCell = ({ day, index, openModal, getCategoryColor }) => {
  const cellSize = (width - 32) / 9; // Adjusted for padding

  const activeTasks = day.tasks.filter(task => !task.is_completed);
  const completedTasks = day.tasks.filter(task => task.is_completed);

  return (
    <TouchableOpacity
      key={`day-${index}`}
      style={{ width: cellSize, height: cellSize }}
      onPress={() => openModal(day)}
      activeOpacity={0.7}
      className={`
        items-center justify-center rounded-2xl m-1
        ${day.currentMonth
          ? (day.isToday
            ? 'bg-emerald-100 dark:bg-emerald-900/30'
            : 'bg-gray-50 dark:bg-gray-800')
          : 'bg-transparent'}
      `}
    >
      <Text
        className={`
          text-center font-semibold
          ${day.currentMonth
            ? (day.isToday
              ? 'text-emerald-700 dark:text-emerald-400'
              : 'text-gray-900 dark:text-white')
            : 'text-gray-400 dark:text-gray-600'}
        `}
        style={{ fontSize: cellSize * 0.3 }}
      >
        {day.date}
      </Text>

      <View className="flex-row flex-wrap justify-center mt-1" style={{ width: cellSize * 0.8 }}>
        {activeTasks.slice(0, 3).map((task) => (
          <TaskDot
            key={`dot-${task.id}`}
            color={getCategoryColor(task.category)}
            size={cellSize * 0.12}
          />
        ))}
        {completedTasks.length > 0 && (
          <TaskDot
            color={getCategoryColor('completed')}
            size={cellSize * 0.12}
          />
        )}
        {day.tasks.length > 3 && (
          <Text
            className="text-gray-500 dark:text-gray-400 font-medium"
            style={{ fontSize: cellSize * 0.12, marginLeft: 2 }}
          >
            +{day.tasks.length - 3}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};