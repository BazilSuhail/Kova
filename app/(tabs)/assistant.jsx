import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function AIAssistantScreen() {
  const options = [
    {
      title: "Checklist Generator",
      desc: "Turn goals into actionable checklists",
      icon: "list-outline",
      color: "#10b981",
      href: "/assistant/create-sub-tasks",
    },
    {
      title: "Quick Add from Camera",
      desc: "Capture tasks from images",
      icon: "camera-outline",
      color: "#10b981",
      href: "/assistant/image-to-tasks",
    },
    {
      title: "PDF Notes Summarizer",
      desc: "Summarize notes from your PDFs",
      icon: "document-text-outline",
      color: "#10b981",
      href: "/assistant/notes-summarizer",
    },
    {
      title: "See Sub-tasks",
      desc: "Expand tasks into smaller steps",
      icon: "list-circle-outline",
      color: "#10b981",
      href: "/assistant/with-sub-tasks",
    },
    {
      title: "Auto Notes Summarizer",
      desc: "Summarize your notes instantly",
      icon: "document-outline",
      color: "#10b981",
    },
    {
      title: "Smart Task Suggestions",
      desc: "Get AI-based task ideas",
      icon: "bulb-outline",
      color: "#10b981",
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="p-5">
        
        {/* Header */}
        <Text className="text-2xl font-bold text-emerald-600 mb-5">
          What can I do for you?
        </Text>

        {/* Option Grid */}
        <View className="flex-row flex-wrap -mx-1.5">
          {options.map((opt, idx) => {
            const CardContent = (
              <View className="bg-white/50 w-[48%] p-4 rounded-2xl mb-4 mx-1.5">
                <View className="w-14 h-14 rounded-xl bg-emerald-100 items-center justify-center mb-2">
                  <Ionicons name={opt.icon} size={26} color={opt.color} />
                </View>
                <Text className="text-base font-bold text-gray-900 mb-1">{opt.title}</Text>
                <Text className="text-sm text-gray-500">{opt.desc}</Text>
              </View>
            );

            return opt.href ? (
              <Link key={idx} href={opt.href} asChild>
                <TouchableOpacity activeOpacity={0.7}>{CardContent}</TouchableOpacity>
              </Link>
            ) : (
              <TouchableOpacity key={idx} activeOpacity={0.7}>
                {CardContent}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
