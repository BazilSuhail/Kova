import { CalendarGrid } from "@/components/planner/CalendarGrid";
import { DayView } from "@/components/planner/DayView";
import { EmptyState } from "@/components/planner/EmptyState";
import { PlannerHeader } from "@/components/planner/PlannerHeader";
import { TaskStats } from "@/components/planner/TaskStats";
import { COLORS } from "@/constants/color";
import BottomSheet from "entity-bottom-sheet";
import { useColorScheme } from "nativewind";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  View
} from "react-native";

const { width } = Dimensions.get("window");

// Sample data structure
const DUMMY_TASKS = [
  {
    id: "1",
    title: "Complete project proposal",
    category: "work",
    priority: "high",
    due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    is_completed: false,
    duration: "2h"
  },
  {
    id: "2",
    title: "Team meeting with stakeholders",
    category: "career",
    priority: "medium",
    due_date: new Date().toISOString(),
    is_completed: true,
    duration: "1h"
  },
  {
    id: "3",
    title: "Morning workout routine",
    category: "health",
    priority: "high",
    due_date: new Date().toISOString(),
    is_completed: false,
    duration: "45min"
  },
  {
    id: "4",
    title: "Read React Native documentation",
    category: "personal",
    priority: "low",
    due_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_completed: false,
    duration: "30min"
  },
  {
    id: "5",
    title: "Dentist appointment",
    category: "health",
    priority: "high",
    due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    is_completed: false,
    duration: "1h"
  },
  {
    id: "6",
    title: "Grocery shopping",
    category: "personal",
    priority: "medium",
    due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_completed: false,
    duration: "1h"
  }
];

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Main Component
export default function ModernPlannerScreen() {
  const { colorScheme, setColorScheme } = useColorScheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("month");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);

  // Load tasks
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setTasks(DUMMY_TASKS);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  // Date calculations
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
        priority: task.priority || "low",
        duration: task.duration || "",
        is_completed: Boolean(task.is_completed)
      });
    });
    return taskMap;
  }, [tasks]);

  // Navigation functions
  const navigatePeriod = (direction) => {
    const newDate = new Date(currentDate);
    const amount = direction === "prev" ? -1 : 1;

    if (viewType === "day") {
      newDate.setDate(newDate.getDate() + amount);
    } else if (viewType === "week") {
      newDate.setDate(newDate.getDate() + amount * 7);
    } else {
      newDate.setMonth(newDate.getMonth() + amount);
    }
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

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
    if (isCompleted) return COLORS.completed;
    return COLORS[category.toLowerCase()] || COLORS.default;
  }, []);

  const openModal = (day) => {
    setSelectedDay(day);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDay(null);
  };

  // Generate calendar days
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

        // Previous month days
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

        // Current month days
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

        // Next month days
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

  // Header title
  const getHeaderTitle = () => {
    const { year, month } = dateInfo;

    if (viewType === "day") {
      return currentDate.toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      });
    }

    if (viewType === "week") {
      const start = new Date(currentDate);
      start.setDate(currentDate.getDate() - currentDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      if (start.getMonth() === end.getMonth()) {
        return `${MONTH_NAMES[start.getMonth()]} ${start.getDate()}-${end.getDate()}`;
      }
      return `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} - ${end.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
    }

    return `${MONTH_NAMES[month]} ${year}`;
  };

  const todayTasks = useMemo(() => {
    const today = new Date();
    return getTasksForDay(today.getFullYear(), today.getMonth(), today.getDate());
  }, [getTasksForDay]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-50 dark:bg-gray-950">
        <View className="bg-white dark:bg-gray-800 p-8 rounded-3xl">
          <ActivityIndicator size="large" color="#10b981" />
          <Text className="text-gray-600 dark:text-gray-300 mt-4 text-base text-center font-medium">
            Loading your planner...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      
       {/* Task Statistics - Only show on day view or when viewing today */}
      {(viewType === "day" || isToday(currentDate)) && (
        <TaskStats tasks={todayTasks} />
      )}

      {/* Calendar Content */}
      <View className="flex-1">
        <View className="flex-1 mx-4 bg-white dark:bg-gray-800 rounded-3xl py-5 mb-4">
          {viewType === "day" ? (
            <DayView day={days[0]} getCategoryColor={getCategoryColor} />
          ) : (
            <CalendarGrid
              days={days}
              openModal={openModal}
              getCategoryColor={getCategoryColor}
            />
          )}
        </View>
      </View>

      {/* Bottom Sheet Modal */}
      <BottomSheet
        visible={modalVisible}
        onClose={closeModal}
        title={selectedDay ? `Tasks for ${selectedDay.dateObj.toLocaleDateString(undefined, {
          weekday: 'long',
          month: 'long',
          day: 'numeric'
        })}` : "Tasks"}
        heightRatio={0.7}
      >
        <ScrollView className="px-4 pt-2 flex-1" showsVerticalScrollIndicator={false}>
          {selectedDay && selectedDay.tasks && selectedDay.tasks.length > 0 ? (
            selectedDay.tasks.map((task) => (
              <TaskItem key={task.id} task={task} getCategoryColor={getCategoryColor} />
            ))
          ) : (
            <EmptyState
              title="No tasks scheduled"
              subtitle="Perfect day to relax or add some new tasks!"
            />
          )}
        </ScrollView>
      </BottomSheet>
    </View>
  );
}
 