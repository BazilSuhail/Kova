import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

// Mock user data
const user = {
  name: 'Bazil Suhail',
  email: 'bazilsuhail@example.com',
};

export default function SettingsScreen() {
  const colorScheme = useColorScheme();
  
  // State for toggles
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);
  
  // Force light mode colors even if system is dark
  const isDarkMode = colorScheme === 'dark';
  const backgroundColor = '#f9fafb'; // gray-50
  const textColor = '#1f2937'; // gray-800
  const subtitleColor = '#6b7280'; // gray-500
  const cardBackgroundColor = '#ffffff'; // white
  const switchTrackColor = { false: '#d1d5db', true: '#059669' }; // gray-300, emerald-600

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
    <View className="flex-1" style={{ backgroundColor: backgroundColor }}>
      <ScrollView
        className="flex-1 pt-12"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
      >
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text className="text-3xl font-extrabold" style={{ color: textColor }}>Settings</Text>
          <Text className="text-base" style={{ color: subtitleColor, marginTop: 4 }}>
            Manage your preferences
          </Text>
        </View>

        {/* User Info Card */}
        <View
          className="rounded-2xl p-4 mb-6"
          style={{ 
            backgroundColor: cardBackgroundColor,
            shadowColor: '#000', 
            shadowOffset: { width: 0, height: 1 }, 
            shadowOpacity: 0.1, 
            shadowRadius: 3, 
            elevation: 2 
          }}
        >
          <Text className="text-xl font-semibold" style={{ color: textColor }}>{user.name}</Text>
          <Text className="text-sm" style={{ color: subtitleColor, marginTop: 2 }}>
            {user.email}
          </Text>
        </View>

        {/* Settings List */}
        <View>
          {/* Dark Mode (Emerald Toggle) */}
          <StaticSettingItem
            icon="moon"
            label="Dark Mode"
            value={darkMode}
            onValueChange={setDarkMode}
            type="toggle"
            color="#059669"
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBackgroundColor={cardBackgroundColor}
            switchTrackColor={switchTrackColor}
          />

          {/* Notifications */}
          <StaticSettingItem
            icon="notifications"
            label="Notifications"
            value={notifications}
            onValueChange={setNotifications}
            type="toggle"
            color="#059669"
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBackgroundColor={cardBackgroundColor}
            switchTrackColor={switchTrackColor}
          />

          {/* Offline Mode */}
          <StaticSettingItem
            icon="cloud-offline"
            label="Offline Mode"
            value={offlineMode}
            onValueChange={setOfflineMode}
            type="toggle"
            color="#059669"
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBackgroundColor={cardBackgroundColor}
            switchTrackColor={switchTrackColor}
          />

          {/* Language */}
          <StaticSettingItem
            icon="language"
            label="Language"
            value="English"
            type="option"
            color="#059669"
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBackgroundColor={cardBackgroundColor}
          />

          {/* Account Settings */}
          <StaticSettingItem
            icon="person-circle"
            label="Account Settings"
            type="nav"
            color="#059669"
            textColor={textColor}
            subtitleColor={subtitleColor}
            cardBackgroundColor={cardBackgroundColor}
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

function StaticSettingItem({ 
  icon, 
  label, 
  value, 
  onValueChange,
  type = 'toggle', 
  color,
  textColor,
  subtitleColor,
  cardBackgroundColor,
  switchTrackColor
}) {
  return (
    <View
      className="rounded-2xl px-4 py-4 mb-3 flex-row items-center justify-between"
      style={{
        backgroundColor: cardBackgroundColor,
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
        <Text className="ml-3 text-base font-medium" style={{ color: textColor }}>{label}</Text>
      </View>

      {/* Right-side Control */}
      {type === 'toggle' ? (
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={switchTrackColor}
          thumbColor="#ffffff"
        />
      ) : type === 'option' ? (
        <Text className="text-sm" style={{ color: subtitleColor }}>{value}</Text>
      ) : (
        <Ionicons 
          name="chevron-forward" 
          size={20} 
          color="#94a3b8"
        />
      )}
    </View>
  );
}