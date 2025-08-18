import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { SafeAreaView, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';

export default function TodoManagerScreen() {
  // Sample task data
  const tasks = [
    {
      id: 1,
      title: "Finalize Project Proposal for Client",
      category: "Proposal",
      completed: 15,
      total: 20,
      color: "#10b981", // emerald-500
      bgColor: "bg-emerald-100",
      href: "/tasks/project-proposal"
    },
    {
      id: 2,
      title: "Prepare for Weekly Team Meeting",
      category: "Meeting",
      completed: 5,
      total: 8,
      color: "#f59e0b", // amber-500
      bgColor: "bg-amber-100",
      href: "/tasks/team-meeting"
    },
    {
      id: 3,
      title: "Design Landing Page for New App",
      category: "Design",
      completed: 0,
      total: 12,
      color: "#8b5cf6", // violet-500
      bgColor: "bg-violet-100",
      href: "/tasks/landing-design"
    },
    {
      id: 4,
      title: "Review Code Documentation",
      category: "Development",
      completed: 3,
      total: 6,
      color: "#06b6d4", // cyan-500
      bgColor: "bg-cyan-100",
      href: "/tasks/code-review"
    }
  ];

  // AI Assistant options
  const aiOptions = [
    {
      title: "Checklist Generator",
      desc: "Turn goals into actionable checklists",
      icon: "list-outline",
      href: "/assistant/create-sub-tasks",
    },
    {
      title: "Quick Add from Camera",
      desc: "Capture tasks from images",
      icon: "camera-outline",
      href: "/assistant/image-to-tasks",
    },
    {
      title: "PDF Notes Summarizer",
      desc: "Summarize notes from your PDFs",
      icon: "document-text-outline",
      href: "/assistant/notes-summarizer",
    },
    {
      title: "See Sub-tasks",
      desc: "Expand tasks into smaller steps",
      icon: "list-circle-outline",
      href: "/assistant/with-sub-tasks",
    },
  ];

  // Calendar days
  const calendarDays = [
    { day: 'Sun', date: 1 },
    { day: 'Mon', date: 1 },
    { day: 'Tue', date: 1 },
    { day: 'Wed', date: 2, isToday: true },
    { day: 'Thu', date: 1 },
    { day: 'Fri', date: 1 },
    { day: 'Sat', date: 1 },
  ];

  const renderTaskCard = (task) => {
    const progressPercent = (task.completed / task.total) * 100;

    return (
      <Link key={task.id} href={task.href} asChild>
        <TouchableOpacity activeOpacity={0.7} className="mb-4">
          <View className={`${task.bgColor} rounded-2xl p-4 `}>
            {/* Category and Options */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-sm font-medium text-gray-600 uppercase tracking-wider">
                {task.category}
              </Text>
              <TouchableOpacity>
                <Ionicons name="ellipsis-horizontal" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Task Title */}
            <Text className="text-lg font-bold text-gray-800 mb-4 leading-6">
              {task.title}
            </Text>

            {/* Progress Section */}
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-600 mb-2">
                  {task.completed}/{task.total} tasks done
                </Text>

                {/* Progress Bar */}
                <View className="bg-white/60 h-2 rounded-full overflow-hidden">
                  <View
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: task.color,
                      width: `${progressPercent}%`
                    }}
                  />
                </View>
              </View>

              {/* Edit Icon */}
              <TouchableOpacity className="ml-4 w-10 h-10 bg-white/60 rounded-full items-center justify-center">
                <Ionicons name="pencil" size={16} color={task.color} />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Link>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <StatusBar barStyle="dark-content" backgroundColor="#f9fafb" />

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Title */}
        <Text className="text-2xl font-bold text-gray-800 mb-6">
          Manage your to do List
        </Text>


        {/* AI Assistant Section */}
        <View className="mb-6">
          <Text className="text-xl font-bold text-gray-800 mb-4">
            AI Assistant
          </Text>
          <Text className="text-base text-emerald-600 font-semibold mb-4">
            What can I do for you?
          </Text>

          {/* AI Options Grid */}
          <View className="flex-row flex-wrap -mx-2">
            {aiOptions.map((option, idx) => (
              <View key={idx} className="w-1/2 px-2 mb-4">
                <Link href={option.href} asChild>
                  <TouchableOpacity activeOpacity={0.7}>
                    <View className="bg-white rounded-2xl p-4 border border-gray-100">
                      <View className="w-12 h-12 rounded-xl bg-emerald-100 items-center justify-center mb-3">
                        <Ionicons name={option.icon} size={22} color="#10b981" />
                      </View>
                      <Text className="text-sm font-bold text-gray-800 mb-1 leading-5">
                        {option.title}
                      </Text>
                      <Text className="text-xs text-gray-500 leading-4">
                        {option.desc}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Link>
              </View>
            ))}
          </View>
        </View>

        {/* Calendar Strip */}
        {/* <View className="flex-row justify-between mb-6">
          {calendarDays.map((day, index) => (
            <View key={index} className="items-center">
              <Text className="text-xs text-gray-500 mb-2 font-medium">
                {day.day}
              </Text>
              <View className={`w-8 h-8 rounded-lg items-center justify-center ${
                day.isToday ? 'bg-orange-500' : 'bg-transparent'
              }`}>
                <Text className={`text-sm font-semibold ${
                  day.isToday ? 'text-white' : 'text-gray-700'
                }`}>
                  {day.date}
                </Text>
              </View>
            </View>
          ))}
        </View> */}

        {/* Task Cards */}
        <View className="mb-6">
          {tasks.map(renderTaskCard)}
        </View>


        {/* Quick Actions */}
        <View className="bg-white rounded-2xl p-4  border border-gray-100 mb-6">
          <Text className="text-lg font-bold text-gray-800 mb-3">
            Quick Actions
          </Text>

          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
            <View className="w-10 h-10 rounded-full bg-emerald-100 items-center justify-center mr-3">
              <Ionicons name="add" size={20} color="#10b981" />
            </View>
            <Text className="text-base text-gray-700 font-medium">Add New Task</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3 border-b border-gray-100">
            <View className="w-10 h-10 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Ionicons name="calendar" size={20} color="#3b82f6" />
            </View>
            <Text className="text-base text-gray-700 font-medium">Schedule Tasks</Text>
          </TouchableOpacity>

          <TouchableOpacity className="flex-row items-center py-3">
            <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
              <Ionicons name="stats-chart" size={20} color="#8b5cf6" />
            </View>
            <Text className="text-base text-gray-700 font-medium">View Analytics</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 w-14 h-14 bg-emerald-500 rounded-full items-center justify-center"
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}