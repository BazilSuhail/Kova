// CalendarWithModal.js
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import BottomSheet from "entity-bottom-sheet";
//import BottomSheet from "../BottomSheet";
const { width } = Dimensions.get("window");

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const WEEK_DAYS_SHORT = ["S", "M", "T", "W", "T", "F", "S"];

const CATEGORY_COLORS = {
  academic: "bg-blue-300",
  social: "bg-purple-300",
  health: "bg-green-300",
  career: "bg-amber-300",
  personal: "bg-orange-300",
  work: "bg-indigo-300",
  default: "bg-gray-300",
  completed: "bg-gray-400"
};

const DUMMY_TASKS = [
  {
    id: "1",
    title: "Complete project proposal",
    category: "work",
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    is_completed: false
  },
  {
    id: "2",
    title: "Team meeting",
    category: "career",
    due_date: new Date().toISOString(),
    is_completed: true
  },

  {
    id: "22",
    title: "Team meeting",
    category: "career",
    due_date: new Date().toISOString(),
    is_completed: true
  },

  {
    id: "2335",
    title: "Team meeting",
    category: "career",
    due_date: new Date().toISOString(),
    is_completed: true
  },
  {
    id: "3",
    title: "Gym session",
    category: "health",
    due_date: new Date().toISOString(),
    is_completed: false
  },
  {
    id: "4",
    title: "Read React Native docs",
    category: "personal",
    due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_completed: false
  },
  {
    id: "5",
    title: "Dentist appointment",
    category: "health",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_completed: false
  }
];


export default function CalendarWithModal({ viewType = "month", currentDate = new Date() }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  const openModal = (day) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDay(null);
  };

  const dateInfo = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = currentDate.getDate();
    const today = new Date();
    return { year, month, date, today };
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const taskMap = new Map();
    tasks.forEach(task => {
      if (!task.due_date) return;
      const dueDate = new Date(task.due_date);
      const dateKey = `${dueDate.getFullYear()}-${dueDate.getMonth()}-${dueDate.getDate()}`;
      if (!taskMap.has(dateKey)) {
        taskMap.set(dateKey, []);
      }
      taskMap.get(dateKey).push({
        id: task.id || task._id,
        title: task.title || "Untitled Task",
        category: task.category || "default",
        is_completed: Boolean(task.is_completed)
      });
    });
    return taskMap;
  }, [tasks]);

  const isToday = useCallback((date) => {
    const { today } = dateInfo;
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, [dateInfo]);

  const getTasksForDay = useCallback((year, month, day) => {
    const dateKey = `${year}-${month}-${day}`;
    return tasksByDate.get(dateKey) || [];
  }, [tasksByDate]);

  const getCategoryColor = useCallback((category, isCompleted = false) => {
    if (isCompleted) return CATEGORY_COLORS.completed;
    return CATEGORY_COLORS[category.toLowerCase()] || CATEGORY_COLORS.default;
  }, []);

  const days = useMemo(() => {
    const { year, month, date } = dateInfo;
    switch (viewType) {
      case "day":
        return [{
          date,
          currentMonth: true,
          dateObj: new Date(year, month, date),
          tasks: getTasksForDay(year, month, date),
          isToday: isToday(new Date(year, month, date)),
        }];
      case "week": {
        const days = [];
        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(date - currentDate.getDay());
        for (let i = 0; i < 7; i++) {
          const day = new Date(startOfWeek);
          day.setDate(startOfWeek.getDate() + i);
          days.push({
            date: day.getDate(),
            currentMonth: day.getMonth() === month,
            dateObj: day,
            tasks: getTasksForDay(day.getFullYear(), day.getMonth(), day.getDate()),
            isToday: isToday(day),
          });
        }
        return days;
      }
      case "month":
      default: {
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const firstDayOfWeek = firstDay.getDay();
        const daysInMonth = lastDay.getDate();
        const days = [];
        if (firstDayOfWeek > 0) {
          const prevMonthLastDay = new Date(year, month, 0).getDate();
          for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            const dayNum = prevMonthLastDay - i;
            days.push({
              date: dayNum,
              currentMonth: false,
              dateObj: new Date(year, month - 1, dayNum),
              tasks: [],
              isToday: false,
            });
          }
        }
        for (let i = 1; i <= daysInMonth; i++) {
          const day = new Date(year, month, i);
          days.push({
            date: i,
            currentMonth: true,
            dateObj: day,
            tasks: getTasksForDay(year, month, i),
            isToday: isToday(day),
          });
        }
        const remainingCells = 42 - days.length;
        for (let i = 1; i <= remainingCells; i++) {
          days.push({
            date: i,
            currentMonth: false,
            dateObj: new Date(year, month + 1, i),
            tasks: [],
            isToday: false,
          });
        }
        return days;
      }
    }
  }, [viewType, dateInfo, currentDate, getTasksForDay, isToday]);

  const cellSize = useMemo(() => {
    const padding = 16;
    if (viewType === "day") return width - padding * 2;
    return (width - padding * 4) / 7;
  }, [viewType]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setTasks(DUMMY_TASKS);
      } catch (err) {
        setError("Failed to load tasks. Please try again.");
        console.error("Error loading tasks:", err);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const WeekdayHeaders = useMemo(() => {
    if (viewType === "day") return null;
    const dayLabels = viewType === "week" ? WEEK_DAYS_SHORT : WEEK_DAYS;
    return (
      <View className="flex-row mb-2">
        {dayLabels.map((day, index) => (
          <View
            key={`weekday-${index}`}
            className="items-center"
            style={{ width: cellSize }}
          >
            <Text className="text-gray-700 text-xs font-medium">{day}</Text>
          </View>
        ))}
      </View>
    );
  }, [viewType, cellSize]);

  const TaskItem = useCallback(({ task }) => (
    <View
      className={`px-1 py-0.5 rounded mb-0.5 ${getCategoryColor(task.category, task.is_completed)}`}
    >
      <Text
        className={`text-gray-800 text-xs ${task.is_completed ? "line-through" : ""}`}
        numberOfLines={1}
      >
        {task.title}
      </Text>
    </View>
  ), [getCategoryColor]);

  const DayCell = useCallback(({ day, index }) => (
    <View
      key={`day-${index}`}
      style={{
        width: cellSize,
        height: viewType === "week" ? 120 : cellSize * 1.2,
      }}
    >
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => openModal(day)}
        className={`
          border flex-1
          ${day.currentMonth ? "bg-white" : "bg-gray-50"}
          ${day.isToday ? "border-blue-500 border-2 bg-blue-50" : "border-gray-100"}
          p-1
        `}
      >
        <View className="flex-1">
          <Text
            className={`
              text-right text-xs mb-1
              ${day.currentMonth ? "text-gray-800" : "text-gray-400"}
              ${day.isToday ? "font-bold text-blue-600" : ""}
            `}
          >
            {day.date}
          </Text>
          <ScrollView
            showsVerticalScrollIndicator={false}
            nestedScrollEnabled={true}
          >
            {day.tasks.slice(0, 3).map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
            {day.tasks.length > 3 && (
              <Text className="text-xs text-gray-500 text-right">+{day.tasks.length - 3} more</Text>
            )}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </View>
  ), [cellSize, viewType, TaskItem, openModal]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text className="text-gray-700 mt-2">Loading calendar...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center p-4 bg-white">
        <Text className="text-red-500 text-center mb-4">{error}</Text>
        <TouchableOpacity
          onPress={() => window.location.reload()}
          className="bg-blue-500 px-4 py-2 rounded"
        >
          <Text className="text-white">Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white p-4">
      <View className="bg-white rounded-lg shadow flex-1">
        {WeekdayHeaders}
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {viewType === "day" ? (
            <View className="border border-gray-200 rounded-lg p-4">
              <Text className="text-gray-800 text-lg font-bold mb-4">
                {currentDate.toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric"
                })}
              </Text>
              {days[0].tasks.length > 0 ? (
                days[0].tasks.map((task) => (
                  <View
                    key={task.id}
                    className={`p-3 rounded-lg mb-2 ${getCategoryColor(task.category, task.is_completed)}`}
                  >
                    <Text
                      className={`font-medium text-gray-800 ${task.is_completed ? "line-through" : ""}`}
                    >
                      {task.title}
                    </Text>
                    <Text className="text-gray-800 text-xs opacity-75 mt-1 capitalize">
                      {task.category}
                    </Text>
                  </View>
                ))
              ) : (
                <View className="py-8 items-center">
                  <Text className="text-gray-500 text-center">No tasks scheduled</Text>
                </View>
              )}
            </View>
          ) : (
            <View className="flex-1">
              <View className="flex-row flex-wrap">
                {days.map((day, index) => (
                  <DayCell key={`cell-${index}`} day={day} index={index} />
                ))}
              </View>
            </View>
          )}
        </ScrollView>
      </View>

      <BottomSheet
        visible={modalVisible}
        onClose={closeModal}
        title="Welcome Sheet"
        heightRatio={0.65}
      >
        <ScrollView className="px-4 pt-2 flex-1">
          {selectedDay && selectedDay.tasks && selectedDay.tasks.length > 0 ? (
            selectedDay.tasks.map((task) => (
              <View
                key={task.id}
                className={`p-3 rounded-lg mb-2 ${getCategoryColor(task.category, task.is_completed)}`}
              >
                <Text
                  className={`font-medium text-gray-800 ${task.is_completed ? "line-through" : ""}`}
                >
                  {task.title}
                </Text>
                <Text className="text-gray-800 text-xs opacity-75 mt-1 capitalize">
                  {task.category}
                </Text>
              </View>
            ))
          ) : (
            <View className="flex-1 justify-center items-center py-8">
              <Text className="text-gray-500 text-center">No tasks scheduled for this day</Text>
            </View>
          )}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
