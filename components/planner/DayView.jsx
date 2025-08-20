import { EmptyState } from "./EmptyState";
import { TaskItem } from "./TaskItem";
import { ScrollView, Text } from "react-native";

export const DayView = ({ day, getCategoryColor }) => {
  if (!day || day.tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks scheduled"
        subtitle="Perfect day to relax or plan ahead!"
        icon="calendar"
      />
    );
  }

  return (
    <ScrollView className="flex-1 px-2 mx-3" showsVerticalScrollIndicator={false}>
      <Text className="text-gray-600 dark:text-gray-400 text-sm mb-4">
        {day.tasks.length} task{day.tasks.length !== 1 ? 's' : ''} scheduled
      </Text>

      {day.tasks.map((task) => (
        <TaskItem key={task.id} task={task} getCategoryColor={getCategoryColor} />
      ))}
    </ScrollView>
  );
};