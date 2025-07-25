//import { View, Text } from "react-native"; 
//import { CalendarView } from "@/components/planner/CalendarView"; 
//import { useState } from "react";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import CalendarView from "../../components/planner/CalendarView";
import CalendarHeader from "../../components/planner/CalendarHeader";
 

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState("month");

  return (
    <View className="flex-1 p-4">
      <CalendarHeader
        currentDate={currentDate}
        setCurrentDate={setCurrentDate}
        viewType={viewType}
        setViewType={setViewType}
      />
      <CalendarView currentDate={currentDate} viewType={viewType} />
    </View>
  );
}
// import { Ionicons } from '@expo/vector-icons';
// import React, { useState } from 'react';
// import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// // Mock planner task blocks
// const calendarData = [
//   { id: '1', title: 'AI Lecture', time: '10:00 AM', category: 'Academics' },
//   { id: '2', title: 'Project Meeting', time: '1:30 PM', category: 'Group Work' },
//   { id: '3', title: 'Gym', time: '6:00 PM', category: 'Fitness' },
// ];

// const views = ['Day', 'Week', 'Month'];

// export default function PlannerScreen() {
//   const [activeView, setActiveView] = useState('Day');

//   return (
//     <View style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: 60 }}>
//       {/* Header */}
//       <View className="px-5 mb-4">
//         <Text className="text-3xl font-extrabold text-gray-900">Planner</Text>
//         <Text className="text-base text-gray-500">Organize your schedule at a glance</Text>
//       </View>

//       {/* View Switcher */}
//       <View className="flex-row justify-center mb-4 space-x-4">
//         {views.map((v) => (
//           <TouchableOpacity
//             key={v}
//             onPress={() => setActiveView(v)}
//             className={`px-4 py-2 rounded-full ${
//               activeView === v ? 'bg-indigo-600' : 'bg-white border border-gray-300'
//             }`}
//           >
//             <Text className={`${activeView === v ? 'text-white' : 'text-gray-700'} font-semibold`}>
//               {v}
//             </Text>
//           </TouchableOpacity>
//         ))}
//       </View>

//       {/* Calendar View */}
//       <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
//         {calendarData.map((event) => (
//           <View
//             key={event.id}
//             className="bg-white rounded-2xl px-5 py-4 mb-4 shadow-sm shadow-gray-200 flex-row justify-between items-center"
//           >
//             <View>
//               <Text className="text-lg font-semibold text-gray-800">{event.title}</Text>
//               <Text className="text-sm text-gray-500">{event.time}</Text>
//               <Text className="text-xs text-gray-400 capitalize">{event.category}</Text>
//             </View>

//             <TouchableOpacity>
//               <Ionicons name="ellipsis-horizontal" size={22} color="#9ca3af" />
//             </TouchableOpacity>
//           </View>
//         ))}

//         {/* Placeholder if no events */}
//         {calendarData.length === 0 && (
//           <View className="bg-white p-6 rounded-2xl shadow-sm shadow-gray-100 items-center">
//             <Ionicons name="calendar-clear-outline" size={32} color="#9ca3af" />
//             <Text className="mt-2 text-gray-500">No events scheduled for today.</Text>
//           </View>
//         )}
//       </ScrollView>

//       {/* Floating Action Button */}
//       <TouchableOpacity
//         className="absolute bottom-6 right-6 bg-indigo-600 p-4 rounded-full shadow-lg"
//         activeOpacity={0.8}
//         onPress={() => {
//           // navigation logic to AddTask
//         }}
//       >
//         <Ionicons name="add" size={26} color="white" />
//       </TouchableOpacity>
//     </View>
//   );
// }
