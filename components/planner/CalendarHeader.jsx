import { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons, Feather } from "@expo/vector-icons";

export default function CalendarHeader({
  currentDate,
  setCurrentDate,
  viewType,
  setViewType,
  onAddEvent,
}) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

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

  // Header title based on view type
  const getHeaderTitle = () => {
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
        return `${
          monthNames[start.getMonth()]
        } ${start.getDate()}-${end.getDate()}`;
      }
      return `${start.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })} - ${end.toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}`;
    }

    return `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
  };

  // View type selector with nice animations
  const ViewTypeButton = ({ type, icon, label }) => (
    <TouchableOpacity
      onPress={() => setViewType(type)}
      className={`px-3 py-2 rounded-md mx-1 ${
        viewType === type ? "bg-gray-100" : ""
      }`}
    >
      <View className="flex-row items-center">
        <MaterialIcons
          name={icon}
          size={20}
          color={viewType === type ? "#3B82F6" : "#6B7280"}
        />
        {label && (
          <Text
            className={`ml-2 ${
              viewType === type ? "text-blue-500" : "text-gray-600"
            }`}
          >
            {label}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="bg-white rounded-lg shadow-sm p-4 mb-2">
      <View className=" items-center">
        {/* Left side: Navigation controls */}
        <View className="flex-row items-center">
          {/* Previous period */}
          <TouchableOpacity
            onPress={() => navigatePeriod("prev")}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
          >
            <MaterialIcons name="chevron-left" size={24} color="#4B5563" />
          </TouchableOpacity>

          {/* Today button */}
          <TouchableOpacity
            onPress={goToToday}
            className="px-3 py-1.5 mx-2 border border-gray-200 rounded-md"
          >
            <Text className="text-gray-700 font-medium">Today</Text>
          </TouchableOpacity>

          {/* Next period */}
          <TouchableOpacity
            onPress={() => navigatePeriod("next")}
            className="p-2 rounded-full hover:bg-gray-100 active:bg-gray-200"
          >
            <MaterialIcons name="chevron-right" size={24} color="#4B5563" />
          </TouchableOpacity>

          {/* Current period title */}
          <Text className="ml-4 text-sm font-semibold text-gray-800">
            {getHeaderTitle()}
          </Text>
        </View>

        {/* Right side: View controls */}
        <View className="flex-row items-center mt-4">
          {/* View type selector */}
          <View className="flex-row bg-gray-50 rounded-md p-1 border border-gray-200">
            <ViewTypeButton type="day" icon="view-day" label="Day" />
            <ViewTypeButton type="week" icon="view-week" label="Week" />
            <ViewTypeButton
              type="month"
              icon="calendar-view-month"
              label="Month"
            />
          </View>
        </View>
      </View>
    </View>
  );
}


