import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

// Mock user data
const user = {
  name: 'Bazil Suhail',
  email: 'bazilsuhail@example.com',
};

export default function SettingsScreen() {
  // Temporarily disable dark mode — removed useColorScheme
  const isDarkMode = false; // Placeholder, not used

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive' },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1 pt-12"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text className="text-3xl font-extrabold text-gray-800">Settings</Text>
          <Text className="text-base text-gray-500" style={{ marginTop: 4 }}>
            Manage your preferences
          </Text>
        </View>

        {/* User Info Card */}
        <View
          className="bg-white rounded-2xl p-4 mb-6"
          style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 }}
        >
          <Text className="text-xl font-semibold text-gray-800">{user.name}</Text>
          <Text className="text-sm text-gray-500" style={{ marginTop: 2 }}>
            {user.email}
          </Text>
        </View>

        {/* Settings List */}
        <View>
          {/* Dark Mode (Emerald Toggle) */}
          <StaticSettingItem
            icon="moon"
            label="Dark Mode"
            value={false}
            type="toggle"
            color="#059669" // emerald-600
          />

          {/* Notifications */}
          <StaticSettingItem
            icon="notifications"
            label="Notifications"
            value={true}
            type="toggle"
            color="#059669"
          />

          {/* Offline Mode */}
          <StaticSettingItem
            icon="cloud-offline"
            label="Offline Mode"
            value={false}
            type="toggle"
            color="#059669"
          />

          {/* Language */}
          <StaticSettingItem
            icon="language"
            label="Language"
            value="English"
            type="option"
            color="#059669"
          />

          {/* Account Settings */}
          <StaticSettingItem
            icon="person-circle"
            label="Account Settings"
            type="nav"
            color="#059669"
          />
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="mt-8 flex-row items-center justify-center bg-rose-500 py-4 rounded-2xl"
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function StaticSettingItem({ icon, label, value, type = 'toggle', color }) {
  return (
    <View
      className="flex-row items-center justify-between bg-white rounded-2xl px-4 py-4 mb-3"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      {/* Icon + Label */}
      <View className="flex-row items-center">
        <Ionicons name={`${icon}-outline`} size={22} color={color} />
        <Text className="ml-3 text-base font-medium text-gray-800">{label}</Text>
      </View>

      {/* Right-side Control */}
      {type === 'toggle' ? (
        <Switch
          value={value}
          trackColor={{ false: '#d1d5db', true: color }}
          thumbColor="#ffffff"
        />
      ) : type === 'option' ? (
        <Text className="text-sm text-gray-500">{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#94a3b8" /> // slate-400
      )}
    </View>
  );
}