import { Dimensions, Text, TouchableOpacity, View } from "react-native";

const { width } = Dimensions.get("window");

const TaskDot = ({ color, size = 6 }) => (
  <View
    className="rounded-full"
    style={{
      backgroundColor: '#059669',
      width: 5,
      height: 5
    }}
  />
);


export const DayCell = ({ day, index, openModal, getCategoryColor }) => {
  const cellSize = Math.max((width - 32) / 8, 40); // Better calculation for 7 days per week

  const activeTasks = day.tasks.filter(task => !task.is_completed);
  const completedTasks = day.tasks.filter(task => task.is_completed);

  return (
    <TouchableOpacity
      key={`day-${index}`}
      style={{
        width: cellSize,
        height: cellSize,
        minWidth: 40,
        minHeight: 40
      }}
      onPress={() => openModal(day)}
      activeOpacity={0.7}
      className={`
        items-center justify-center rounded-2xl m-1
        ${day.currentMonth
          ? (day.isToday
            ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500'
            : 'bg-gray-50 dark:bg-[#00000018]')
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
        style={{ fontSize: 13 }}
      >
        {day.date}
      </Text>

      <View className="flex-row flex-wrap justify-center mt-1" style={{ maxWidth: cellSize * 0.5,gap:2 }}>
        {activeTasks.slice(0, 3).map((task, taskIndex) => (
          <View key={`dot-${task.id}-${taskIndex}`} className="rounded-full bg-[#059669] w-[6px] h-[6px] " />
        ))}
        {completedTasks.length > 0 && (
          <View key="completed-dot" className="rounded-full bg-[#0cc88d] w-[6px] h-[6px] " />
        )}
        {/* {activeTasks.slice(0, 3).map((task, taskIndex) => (
          <TaskDot
            key={`dot-${task.id}-${taskIndex}`}
            color={getCategoryColor(task.category)}
            size={6} // Fixed small size for visibility
          />
        ))}
        {completedTasks.length > 0 && (
          <TaskDot
            key="completed-dot"
            color={getCategoryColor('completed')}
            size={6}
          />
        )} */}
        {activeTasks.length > 3 && (
          <Text
            className="text-gray-500 dark:text-gray-400 font-medium"
            style={{ fontSize: 10, marginLeft: 2 }}
          >
            +{activeTasks.length - 3}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

// export const DayCell = ({ day, index, openModal, getCategoryColor }) => {
//   const cellSize = Math.max((width - 32) / 8, 40); // Better calculation for 7 days per week

//   const activeTasks = day.tasks.filter(task => !task.is_completed);
//   const completedTasks = day.tasks.filter(task => task.is_completed);

//   return (
//     <TouchableOpacity
//       key={`day-${index}`}
//       style={{
//         width: cellSize,
//         height: cellSize,
//         minWidth: 40,
//         minHeight: 40
//       }}
//       onPress={() => openModal(day)}
//       activeOpacity={0.7}
//       className={`
//         items-center justify-center rounded-2xl m-1
//         ${day.currentMonth
//           ? (day.isToday
//             ? 'bg-emerald-100 dark:bg-emerald-900/30 border-2 border-emerald-500'
//             : 'bg-gray-50 dark:bg-gray-800')
//           : 'bg-transparent'}
//       `}
//     >
//       <Text
//         className={`
//           text-center font-semibold
//           ${day.currentMonth
//             ? (day.isToday
//               ? 'text-emerald-700 dark:text-emerald-400'
//               : 'text-gray-900 dark:text-white')
//             : 'text-gray-400 dark:text-gray-600'}
//         `}
//         style={{ fontSize: 13 }}
//       >
//         {day.date}
//       </Text>

//       <View className="flex-row flex-wrap justify-center mt-1" style={{ maxWidth: cellSize * 0.5 }}>
//         {activeTasks.slice(0, 3).map((task, taskIndex) => (
//           <TaskDot
//             key={`dot-${task.id}-${taskIndex}`}
//             color={getCategoryColor(task.category)}
//             size={6} // Fixed small size for visibility
//           />
//         ))}
//         {completedTasks.length > 0 && (
//           <TaskDot
//             key="completed-dot"
//             color={getCategoryColor('completed')}
//             size={6}
//           />
//         )}
//         {activeTasks.length > 3 && (
//           <Text
//             className="text-gray-500 dark:text-gray-400 font-medium"
//             style={{ fontSize: 10, marginLeft: 2 }}
//           >
//             +{activeTasks.length - 3}
//           </Text>
//         )}
//       </View>
//     </TouchableOpacity>
//   );
// };
