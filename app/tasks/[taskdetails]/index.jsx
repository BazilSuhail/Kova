import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

// Mock task data
const initialTask = {
  id: 'task_001',
  title: 'Finish AI Report',
  description: 'Summarize case studies and finalize references.',
  category: 'Academics',
  dueDate: '2025-07-22T18:00:00Z',
  isCompleted: false,
  checklist: [
    { id: '1', title: 'Complete draft', done: true },
    { id: '2', title: 'Revise figures', done: false },
    { id: '3', title: 'Submit PDF', done: false },
  ],
};

const CustomDatePicker = ({ visible, onClose, onDateSelect, initialDate }) => {
  const [currentDate, setCurrentDate] = useState(new Date(initialDate));
  const [selectedDate, setSelectedDate] = useState(new Date(initialDate));

  // Get all days in current month
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

  // Build a 6x7 grid including leading/trailing nulls
  const buildCalendarGrid = (date) => {
    const days = getDaysInMonth(date);
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const grid = [];
    let currentRow = [];

    // Leading empty days
    for (let i = 0; i < firstDay; i++) {
      currentRow.push(null);
    }

    // Fill in the days
    days.forEach((day) => {
      currentRow.push(day);
      if (currentRow.length === 7) {
        grid.push(currentRow);
        currentRow = [];
      }
    });

    // Trailing empty days
    while (currentRow.length < 7) {
      currentRow.push(null);
    }
    grid.push(currentRow);

    // Fill to 6 rows
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
    <Modal
      transparent={true}
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View className="bg-white rounded-t-3xl p-6 w-full">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={prevMonth}>
              <Ionicons name="chevron-back" size={24} color="#10b981" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-800">
              {formatMonthYear(currentDate)}
            </Text>
            <TouchableOpacity onPress={nextMonth}>
              <Ionicons name="chevron-forward" size={24} color="#10b981" />
            </TouchableOpacity>
          </View>

          {/* Weekdays */}
          <View className="flex-row justify-between mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
              <Text
                key={index}
                className="text-sm font-medium text-gray-500 flex-1 text-center"
              >
                {day}
              </Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View className="w-full">
            {calendarGrid.map((week, rowIndex) => (
              <View key={rowIndex} className="flex-row justify-between mb-1">
                {week.map((day, colIndex) => (
                  <View key={colIndex} className="flex-1 items-center">
                    {day ? (
                      <TouchableOpacity
                        onPress={() => handleDatePress(day)}
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
            <Text className="text-white font-semibold text-base">Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function TaskDetailsScreen() {
  const [task, setTask] = useState(initialTask);
  const [completed, setCompleted] = useState(task.isCompleted);
  const [checklist, setChecklist] = useState(task.checklist);
  const [hasChanged, setHasChanged] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description,
    dueDate: new Date(task.dueDate),
  });
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Toggle individual checklist items
  const toggleChecklistItem = (id) => {
    const updated = checklist.map((item) =>
      item.id === id ? { ...item, done: !item.done } : item
    );
    setChecklist(updated);
    setHasChanged(true);
  };

  // Handle updating the task
  const handleUpdateTask = () => {
    const updatedTask = {
      ...task,
      title: editData.title,
      description: editData.description,
      dueDate: editData.dueDate.toISOString(),
      isCompleted: completed,
      checklist: checklist,
    };
    
    setTask(updatedTask);
    console.log('Updated task:', updatedTask); // Log changes to console
    setIsEditing(false);
    setHasChanged(false);
    Alert.alert('Success', 'Task updated successfully!');
  };

  // Handle date selection from custom date picker
  const handleDateSelect = (selectedDate) => {
    setEditData({ ...editData, dueDate: selectedDate });
    console.log(selectedDate)
    setHasChanged(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: 60 }} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View className="mb-6">
        {isEditing ? (
          <TextInput
            className="text-3xl font-extrabold text-gray-900 border-b border-gray-300 pb-2"
            value={editData.title}
            onChangeText={(text) => {
              setEditData({ ...editData, title: text });
              setHasChanged(true);
            }}
          />
        ) : (
          <>
            <Text className="text-3xl font-extrabold text-gray-900">{task.title}</Text>
            <Text className="text-gray-500 text-base mt-1 capitalize">{task.category}</Text>
          </>
        )}
      </View>

      {/* Description */}
      <View className="bg-white p-4 rounded-2xl mb-4 shadow-sm shadow-gray-200">
        {isEditing ? (
          <TextInput
            className="text-gray-700 text-base border-b border-gray-300 pb-2"
            multiline
            value={editData.description}
            onChangeText={(text) => {
              setEditData({ ...editData, description: text });
              setHasChanged(true);
            }}
          />
        ) : (
          <Text className="text-gray-700 text-base">{task.description}</Text>
        )}
        
        <View className="flex-row items-center mt-2">
          <Text className="text-xs text-gray-400">Due: </Text>
          {isEditing ? (
            <TouchableOpacity onPress={() => setShowDatePicker(true)}>
              <Text className="text-xs text-blue-500 ml-1">
                {formatDate(editData.dueDate)}
              </Text>
            </TouchableOpacity>
          ) : (
            <Text className="text-xs text-gray-400 ml-1">
              {formatDate(task.dueDate)}
            </Text>
          )}
        </View>
      </View>

      {/* Checklist */}
      <View className="mb-6">
        <Text className="text-lg font-semibold text-gray-800 mb-3">Checklist</Text>
        {checklist.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => toggleChecklistItem(item.id)}
            className="flex-row items-center bg-white px-4 py-3 mb-2 rounded-xl shadow-sm shadow-gray-100"
          >
            <Ionicons
              name={item.done ? 'checkbox-outline' : 'square-outline'}
              size={20}
              color={item.done ? '#10b981' : '#9ca3af'}
            />
            <Text className={`ml-3 text-base ${item.done ? 'text-gray-400 line-through' : 'text-gray-800'}`}>
              {item.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Status Toggle */}
      <View className="flex-row items-center justify-between bg-white px-4 py-4 rounded-2xl shadow-sm shadow-gray-100 mb-6">
        <Text className="text-base font-medium text-gray-800">Mark as Completed</Text>
        <Switch value={completed} onValueChange={(value) => {
          setCompleted(value);
          setHasChanged(true);
        }} />
      </View>

      {/* Update Button */}
      {hasChanged && (
        <TouchableOpacity
          onPress={isEditing ? handleUpdateTask : handleUpdateTask}
          className="flex-row items-center justify-center bg-green-600 px-5 py- computedStyle={{ padding: 20 }}3 rounded-2xl mb-4"
        >
          <Ionicons name="save-outline" size={20} color="white" />
          <Text className="ml-2 text-white font-semibold">{isEditing ? 'Save Changes' : 'Update Checklist'}</Text>
        </TouchableOpacity>
      )}

      {/* Action Buttons */}
      <View className="flex-row justify-between mt-2">
        <TouchableOpacity 
          onPress={() => {
            if (isEditing) {
              // Reset edit data if cancelling
              setEditData({
                title: task.title,
                description: task.description,
                dueDate: new Date(task.dueDate),
              });
              setHasChanged(false);
            }
            setIsEditing(!isEditing);
          }}
          className="flex-row items-center justify-center bg-indigo-600 px-5 py-3 rounded-2xl flex-1 mr-2"
        >
          <Ionicons name={isEditing ? "close-outline" : "create-outline"} size={20} color="white" />
          <Text className="ml-2 text-white font-semibold">{isEditing ? 'Cancel' : 'Edit'}</Text>
        </TouchableOpacity>

        <TouchableOpacity className="flex-row items-center justify-center bg-red-500 px-5 py-3 rounded-2xl flex-1">
          <Ionicons name="trash-outline" size={20} color="white" />
          <Text className="ml-2 text-white font-semibold">Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Custom Date Picker Modal */}
      <CustomDatePicker
        visible={showDatePicker}
        onClose={() => setShowDatePicker(false)}
        onDateSelect={handleDateSelect}
        initialDate={editData.dueDate}
      />
    </ScrollView>
  );
}