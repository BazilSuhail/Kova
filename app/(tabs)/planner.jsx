
import { useState } from "react";
import { 
  View
} from "react-native";
import CalendarView from "../../components/planner/CalendarView";
import CalendarHeader from "../../components/planner/CalendarHeader";
 

export default function Planner() {
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