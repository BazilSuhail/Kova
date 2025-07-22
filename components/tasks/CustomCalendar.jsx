import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';

export default function CustomCalendar({ visible, onClose, onDateChange, selectedDate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date(selectedDate || new Date()));

  useEffect(() => {
    setCurrentMonth(new Date(selectedDate));
  }, [selectedDate]);

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

  const buildCalendarGrid = () => {
    const days = getDaysInMonth(currentMonth);
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

    const grid = [];
    let row = [];

    for (let i = 0; i < firstDay; i++) row.push(null);
    days.forEach((day) => {
      row.push(day);
      if (row.length === 7) {
        grid.push(row);
        row = [];
      }
    });

    while (row.length < 7) row.push(null);
    grid.push(row);

    while (grid.length < 6) grid.push(Array(7).fill(null));

    return grid;
  };

  const calendar = buildCalendarGrid();

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleSelect = (date) => {
    onDateChange(date);
    onClose();
  };

  const isSelected = (day) =>
    selectedDate &&
    day?.getDate() === selectedDate.getDate() &&
    day?.getMonth() === selectedDate.getMonth() &&
    day?.getFullYear() === selectedDate.getFullYear();

  const isToday = (day) => {
    const today = new Date();
    return (
      day?.getDate() === today.getDate() &&
      day?.getMonth() === today.getMonth() &&
      day?.getFullYear() === today.getFullYear()
    );
  };

  const formatMonthYear = (date) =>
    date.toLocaleDateString('default', { month: 'long', year: 'numeric' });

  return (
    <Modal transparent animationType="slide" visible={visible} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-6 w-full">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={prevMonth}>
              <Ionicons name="chevron-back" size={24} color="#10b981" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              {formatMonthYear(currentMonth)}
            </Text>
            <TouchableOpacity onPress={nextMonth}>
              <Ionicons name="chevron-forward" size={24} color="#10b981" />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View className="flex-row justify-between mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <Text key={i} className="text-sm font-medium text-gray-500 flex-1 text-center">
                {d}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="w-full">
            {calendar.map((week, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-between mb-1">
                {week.map((day, colIndex) => (
                  <View key={colIndex} className="flex-1 items-center">
                    {day ? (
                      <TouchableOpacity
                        onPress={() => handleSelect(day)}
                        className={`aspect-square w-full items-center justify-center rounded-full ${
                          isSelected(day)
                            ? 'bg-green-500'
                            : isToday(day)
                            ? 'bg-green-100'
                            : ''
                        }`}
                      >
                        <Text
                          className={`text-base ${
                            isSelected(day)
                              ? 'text-white font-semibold'
                              : isToday(day)
                              ? 'text-green-700 font-semibold'
                              : 'text-gray-800'
                          }`}
                        >
                          {day.getDate()}
                        </Text>
                      </TouchableOpacity>
                    ) : (
                      <View className="aspect-square w-full" />
                    )}
                  </View>
                ))}
              </View>
            ))}
          </View>

          {/* Done Button */}
          <TouchableOpacity
            onPress={onClose}
            className="bg-green-600 py-3 px-6 rounded-full self-center mt-6"
          >
            <Text className="text-white font-semibold text-base">Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
