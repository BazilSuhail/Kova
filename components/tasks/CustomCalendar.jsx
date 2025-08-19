import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function CustomDatePicker({ visible, onClose, onDateSelect, initialDate }) {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState(new Date(initialDate));

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const days = [];

    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const buildCalendarGrid = (date) => {
    const days = getDaysInMonth(date);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const grid = [];
    let currentRow = [];

    for (let i = 0; i < firstDay; i++) {
      currentRow.push(null);
    }

    days.forEach((day) => {
      currentRow.push(day);
      if (currentRow.length === 7) {
        grid.push(currentRow);
        currentRow = [];
      }
    });

    while (currentRow.length < 7) {
      currentRow.push(null);
    }
    grid.push(currentRow);

    while (grid.length < 6) {
      grid.push(Array(7).fill(null));
    }

    return grid;
  };

  const calendarGrid = buildCalendarGrid(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleDatePress = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
  };

  const formatMonthYear = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      date &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      heightRatio={0.54}
      header={
        <View className="flex-row items-center justify-between px-8">
          <TouchableOpacity
            onPress={prevMonth}
            className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="chevron-back" size={20} color="#059669" />
          </TouchableOpacity>

          <Text className="text-lg font-semibold text-gray-800">
            {formatMonthYear(currentDate)}
          </Text>

          <TouchableOpacity
            onPress={nextMonth}
            className="w-11 h-11 rounded-full bg-gray-100 items-center justify-center"
          >
            <Ionicons name="chevron-forward" size={20} color="#059669" />
          </TouchableOpacity>
        </View>
      }
    >
      <View className="rounded-t-3xl px-6 pt-0 pb-6 max-h-[80%] mt-9 bg-white">
        {/* Weekdays */}
        <View className="flex-row justify-between mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Text
              key={index}
              className="text-xs font-medium text-gray-500 flex-1 text-center"
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View>
          {calendarGrid.map((week, rowIndex) => (
            <View key={rowIndex} className="flex-row justify-between mb-1">
              {week.map((day, colIndex) => (
                <View key={colIndex} className="flex-1 items-center">
                  {day ? (
                    <TouchableOpacity
                      onPress={() => handleDatePress(day)}
                      className={`
                        w-9 h-9 items-center justify-center rounded-full
                        ${isSelected(day) ? 'bg-emerald-500' : isToday(day) ? 'bg-emerald-100' : ''}
                      `}
                    >
                      <Text
                        className={`
                          text-sm 
                          ${isSelected(day)
                            ? 'text-white font-semibold'
                            : isToday(day)
                              ? 'text-emerald-600 font-semibold'
                              : 'text-gray-700 font-normal'}
                        `}
                      >
                        {day.getDate()}
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View className="w-9 h-9" />
                  )}
                </View>
              ))}
            </View>
          ))}
        </View>

        {/* Done Button */}
        <TouchableOpacity
          onPress={onClose}
          className="bg-emerald-500 py-2 rounded-xl self-end mt-6 min-w-[90px]"
        >
          <Text className="text-white font-semibold text-base text-center">
            Done
          </Text>
        </TouchableOpacity>
      </View>
    </BottomSheet>
  );
}


// import { Ionicons } from '@expo/vector-icons';
// import { useEffect, useState } from 'react';
// import { Modal, Text, TouchableOpacity, View } from 'react-native';

// export default function CustomCalendar({ visible, onClose, onDateChange, selectedDate }) {
//   const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

//   useEffect(() => {
//     setCurrentMonth(new Date(selectedDate));
//   }, [selectedDate]);

//   const getDaysInMonth = (date) => {
//     const year = date.getFullYear();
//     const month = date.getMonth();
//     const totalDays = new Date(year, month + 1, 0).getDate();
//     const days = [];

//     for (let i = 1; i <= totalDays; i++) {
//       days.push(new Date(year, month, i));
//     }

//     return days;
//   };

//   const buildCalendarGrid = () => {
//     const days = getDaysInMonth(currentMonth);
//     const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

//     const grid = [];
//     let row = [];

//     for (let i = 0; i < firstDay; i++) row.push(null);
//     days.forEach((day) => {
//       row.push(day);
//       if (row.length === 7) {
//         grid.push(row);
//         row = [];
//       }
//     });

//     while (row.length < 7) row.push(null);
//     grid.push(row);

//     while (grid.length < 6) grid.push(Array(7).fill(null));

//     return grid;
//   };

//   const calendar = buildCalendarGrid();

//   const prevMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
//   };

//   const nextMonth = () => {
//     setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
//   };

//   const handleSelect = (date) => {
//     onDateChange(date);
//     onClose();
//   };

//   const isSelected = (day) =>
//     selectedDate &&
//     day?.getDate() === selectedDate.getDate() &&
//     day?.getMonth() === selectedDate.getMonth() &&
//     day?.getFullYear() === selectedDate.getFullYear();

//   const isToday = (day) => {
//     const today = new Date();
//     return (
//       day?.getDate() === today.getDate() &&
//       day?.getMonth() === today.getMonth() &&
//       day?.getFullYear() === today.getFullYear()
//     );
//   };

//   const formatMonthYear = (date) =>
//     date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

//   return (
//     <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
//       <View className="flex-1 justify-end bg-black/40">
//         <View className="bg-white rounded-t-3xl p-6 w-full">
//           {/* Header */}
//           <View className="flex-row items-center justify-between mb-4">
//             <TouchableOpacity onPress={prevMonth}>
//               <Ionicons name="chevron-back" size={24} color="#10b981" />
//             </TouchableOpacity>
//             <Text className="text-lg font-semibold text-gray-800">
//               {formatMonthYear(currentMonth)}
//             </Text>
//             <TouchableOpacity onPress={nextMonth}>
//               <Ionicons name="chevron-forward" size={24} color="#10b981" />
//             </TouchableOpacity>
//           </View>

//           {/* Weekdays */}
//           <View className="flex-row justify-between mb-2">
//             {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
//               <Text key={i} className="text-sm font-medium text-gray-500 flex-1 text-center">
//                 {d}
//               </Text>
//             ))}
//           </View>

//           {/* Calendar Grid */}
//           <View className="w-full">
//             {calendar.map((week, rowIndex) => (
//               <View key={rowIndex} className="flex-row justify-between mb-1">
//                 {week.map((day, colIndex) => (
//                   <View key={colIndex} className="flex-1 items-center">
//                     {day ? (
//                       <TouchableOpacity
//                         onPress={() => handleSelect(day)}
//                         className={`aspect-square w-full items-center justify-center rounded-full ${
//                           isSelected(day)
//                             ? 'bg-green-500'
//                             : isToday(day)
//                             ? 'bg-green-100'
//                             : ''
//                         }`}
//                       >
//                         <Text
//                           className={`text-base ${
//                             isSelected(day)
//                               ? 'text-white font-semibold'
//                               : isToday(day)
//                               ? 'text-green-700 font-semibold'
//                               : 'text-gray-800'
//                           }`}
//                         >
//                           {day.getDate()}
//                         </Text>
//                       </TouchableOpacity>
//                     ) : (
//                       <View className="aspect-square w-full" />
//                     )}
//                   </View>
//                 ))}
//               </View>
//             ))}
//           </View>

//           {/* Done Button */}
//           <TouchableOpacity
//             onPress={onClose}
//             className="bg-green-600 py-3 px-6 rounded-full self-center mt-6"
//           >
//             <Text className="text-white font-semibold text-base">Cancel</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );
// 
//}
