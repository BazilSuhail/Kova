import { Ionicons } from '@expo/vector-icons';
import BottomSheet from 'entity-bottom-sheet';
import { useUniwind } from 'uniwind';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

export default function CustomDatePicker({ visible, onClose, onDateSelect, initialDate }) {
  const { theme } = useUniwind();
  const isDark = theme === 'dark';

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

  // Dynamic styles based on color scheme 
  const textColor = isDark ? 'text-white' : 'text-gray-800';
  const weekdayColor = isDark ? 'text-gray-400' : 'text-gray-500';
  const dateTextColor = isDark ? 'text-gray-300' : 'text-gray-700';
  const todayBg = isDark ? 'bg-emerald-900/30' : 'bg-emerald-100';
  const todayTextColor = isDark ? 'text-emerald-400' : 'text-emerald-600';
  const selectedBg = isDark ? 'bg-emerald-600' : 'bg-emerald-500';
  const selectedTextColor = 'text-white';
  const buttonBg = isDark ? 'bg-gray-700' : 'bg-gray-100';
  const doneButtonBg = isDark ? 'bg-emerald-600' : 'bg-emerald-500';
  const calendarBg = isDark ? 'bg-gray-800' : 'bg-white';

  return (
    <BottomSheet
      visible={visible}
      onClose={onClose}
      heightRatio={0.54}
      draggableAreaColor={theme === 'dark' ? '#1f2937' : 'white'}  // gray-800 / white
      dragHandleColor={theme === 'dark' ? '#4b5563' : '#ccc'}       // gray-600 / gray
      statusBarColor={theme === 'dark' ? '#00000099' : '#00000066'} // Darker for dark mode
      statusBarStyle={theme === 'dark' ? 'light-content' : 'dark-content'}
      header={
        <View className={`flex-row items-center justify-between px-8 dark:bg-gray-800 bg-white`}>
          <TouchableOpacity
            onPress={prevMonth}
            className={`w-11 h-11 rounded-full items-center justify-center ${buttonBg}`}
          >
            <Ionicons
              name="chevron-back"
              size={20}
              color={isDark ? "#34D399" : "#059669"}
            />
          </TouchableOpacity>

          <Text className={`text-lg font-semibold ${textColor}`}>
            {formatMonthYear(currentDate)}
          </Text>

          <TouchableOpacity
            onPress={nextMonth}
            className={`w-11 h-11 rounded-full items-center justify-center ${buttonBg}`}
          >
            <Ionicons
              name="chevron-forward"
              size={20}
              color={isDark ? "#34D399" : "#059669"}
            />
          </TouchableOpacity>
        </View>
      }
    >
      <View className="flex-1 dark:bg-gray-800 bg-white">
        <View className={`px-6 pt-0 pb-6 max-h-[80%] mt-9 `}>
        {/* Weekdays */}
        <View className="flex-row justify-between mb-3">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
            <Text
              key={index}
              className={`text-xs font-medium flex-1 text-center ${weekdayColor}`}
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
                        ${isSelected(day)
                          ? selectedBg
                          : isToday(day)
                            ? todayBg
                            : ''}
                      `}
                    >
                      <Text
                        className={`
                          text-sm 
                          ${isSelected(day)
                            ? selectedTextColor + ' font-semibold'
                            : isToday(day)
                              ? todayTextColor + ' font-semibold'
                              : dateTextColor + ' font-normal'}
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
          className={`${doneButtonBg} py-2 rounded-xl self-end mt-6 min-w-[90px]`}
        >
          <Text className="text-white font-semibold text-base text-center">
            Done
          </Text>
        </TouchableOpacity>
      </View>
      </View>
    </BottomSheet>
  );
}
