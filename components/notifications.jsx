import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Mock Notifications
const notifications = [
  {
    id: 'n1',
    type: 'reminder',
    message: 'Submit AI assignment by 11:59 PM.',
    time: '2 hrs ago',
  },
  {
    id: 'n2',
    type: 'missed',
    message: 'You missed your workout session at 6:00 PM.',
    time: 'Yesterday',
  },
  {
    id: 'n3',
    type: 'system',
    message: 'Dark mode now available in settings!',
    time: '2 days ago',
  },
];

// Icon mapping
const iconMap = {
  reminder: { name: 'notifications-outline', color: '#3b82f6' },
  missed: { name: 'alert-circle-outline', color: '#ef4444' },
  system: { name: 'information-circle-outline', color: '#10b981' },
};

export default function NotificationScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: 60 }} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View className="mb-4">
        <Text className="text-3xl font-extrabold text-gray-900">Notifications</Text>
        <Text className="text-gray-500 mt-1 text-base">Stay updated and never miss a beat</Text>
      </View>

      {/* Notification List */}
      {notifications.map((n) => {
        const icon = iconMap[n.type];
        return (
          <TouchableOpacity
            key={n.id}
            className="flex-row items-start bg-white p-4 rounded-2xl mb-3 shadow-sm shadow-gray-200"
          >
            <Ionicons name={icon.name} size={24} color={icon.color} className="mt-1" />
            <View className="ml-3 flex-1">
              <Text className="text-gray-800 font-medium">{n.message}</Text>
              <Text className="text-xs text-gray-400 mt-1">{n.time}</Text>
            </View>
          </TouchableOpacity>
        );
      })}

      {/* Empty State */}
      {notifications.length === 0 && (
        <View className="items-center justify-center mt-10">
          <Ionicons name="notifications-off-outline" size={40} color="#9ca3af" />
          <Text className="text-gray-500 mt-2">You're all caught up!</Text>
        </View>
      )}
    </ScrollView>
  );
}
