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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#f9fafb" }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* Header */}
        <Text style={{ fontSize: 26, fontWeight: "700", color: "#059669", marginBottom: 20 }}>
          What can I do for you?
        </Text>

        {/* Option Grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          {options.map((opt, idx) => {
            const CardContent = (
              <View
                style={{
                  backgroundColor: "white",
                  width: "48%",
                  padding: 18,
                  borderRadius: 20,
                  marginBottom: 15,
                  shadowColor: "#000",
                  shadowOpacity: 0.05,
                  shadowRadius: 5,
                  shadowOffset: { width: 0, height: 2 },
                }}
              >
                <View
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    backgroundColor: "#d1fae5", // emerald-100
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <Ionicons name={opt.icon} size={26} color={opt.color} />
                </View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 4 }}>
                  {opt.title}
                </Text>
                <Text style={{ fontSize: 13, color: "#6b7280" }}>{opt.desc}</Text>
              </View>
            );

            return opt.href ? (
              <Link key={idx} href={opt.href} asChild>
                <TouchableOpacity activeOpacity={0.7}>{CardContent}</TouchableOpacity>
              </Link>
            ) : (
              <TouchableOpacity key={idx} activeOpacity={0.7}>{CardContent}</TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
