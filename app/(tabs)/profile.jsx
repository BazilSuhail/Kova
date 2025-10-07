import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import { Uniwind, useUniwind } from 'uniwind';
import { Alert, ScrollView, StatusBar, Switch, Text, TouchableOpacity, View } from 'react-native';

// Mock user data for AI assistant
const user = {
  name: 'Bazil Suhail',
  email: 'bazilsuhail@example.com',
  aiAssistantName: 'Nova AI',
  memberSince: 'March 2024',
  totalConversations: 1247,
  favoriteTopics: ['Technology', 'Creative Writing', 'Problem Solving']
};

// Mock AI assistant stats
const aiStats = {
  responsesGenerated: 15420,
  accuracy: 98.5,
  userSatisfaction: 4.9,
  uptime: 99.9
};

export default function ProfileSettingsScreen() {
  const router=useRouter();
  const { theme } = useUniwind();
  const isFocused = useIsFocused(); // 👈 detect if profile tab is active

  const toggleDarkMode = async (value) => {
    const newTheme = value ? "dark" : "light";
    await AsyncStorage.setItem("theme", newTheme);
    Uniwind.setTheme(newTheme);
  };


  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your AI assistant?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive' ,
            onPress: () => { 
          router.replace('/auth/login'); // Navigate after confirming
        },
        },
      ]
    );
    //router.replace('/(tabs)'); // Use Expo Router replace
  };

  const showComingSoon = (feature) => {
    Alert.alert(
      'Coming Soon',
      `${feature} will be available in the next update!`,
      [{ text: 'Got it', style: 'default' }]
    );
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-950">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {isFocused && (
          <StatusBar
            backgroundColor={theme === "dark" ? "#030712" : "#f3f4f6"}
            barStyle={theme === "dark" ? "light-content" : "dark-content"}
          />
        )}

        <View className="px-6 pt-16 pb-20 rounded-b-[22px] overflow-hidden bg-gradient-to-b dark:from-black dark:to-emerald-800 from-white to-emerald-100">
          {/* Optional subtle overlay for depth */}
          <View className="absolute inset-0 bg-black/5 dark:bg-white/5 rounded-b-[32px]" />

          <View className="flex-row items-center justify-between relative z-10">
            <View>
              <Text className="text-3xl font-extrabold text-emerald-800 dark:text-emerald-100">
                Profile & Settings
              </Text>
              <Text className="text-base text-emerald-700 dark:text-emerald-300 mt-2">
                Manage your AI assistant experience
              </Text>
            </View>

            <View className="w-14 h-14 bg-emerald-500 rounded-full items-center justify-center shadow-lg shadow-emerald-800/30">
              <Ionicons name="person" size={28} color="white" />
            </View>
          </View>
        </View>

        <View className="px-4 -mt-10">
          {/* Profile Card */}
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-6 shadow-lg">
            <View className="flex-row items-center mb-4">
              <View className="w-16 h-16 bg-emerald-600 rounded-full items-center justify-center mr-4">
                <Text className="text-white text-xl font-bold">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-xl font-bold text-gray-800 dark:text-white">
                  {user.name}
                </Text>
                <Text className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </Text>
                <View className="flex-row items-center mt-1">
                  <Ionicons name="time-outline" size={14} color="#6b7280" />
                  <Text className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    Member since {user.memberSince}
                  </Text>
                </View>
              </View>
            </View>

            {/* Stats Row */}
            <View className="flex-row justify-between bg-gray-50 dark:bg-gray-700 rounded-2xl p-4">
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {user.totalConversations}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Conversations
                </Text>
              </View>
              <View className="w-px bg-gray-200 dark:bg-gray-600 mx-4" />
              <View className="items-center flex-1">
                <Text className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {user.favoriteTopics.length}
                </Text>
                <Text className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Topics
                </Text>
              </View>
            </View>
          </View>

          {/* AI Assistant Info */}
          <View className="bg-white dark:bg-gray-800 rounded-3xl p-6 mb-6 shadow-lg">
            <View className="flex-row items-center mb-4">
              <View className="w-12 h-12 bg-emerald-500 rounded-full items-center justify-center mr-3">
                <Ionicons name="sparkles" size={20} color="white" />
              </View>
              <View>
                <Text className="text-lg font-semibold text-gray-800 dark:text-white">
                  {user.aiAssistantName}
                </Text>
                <Text className="text-sm text-emerald-600 dark:text-emerald-400">
                  Your Personal AI Assistant
                </Text>
              </View>
            </View>

            {/* AI Stats Grid */}
            <View className="flex-row flex-wrap justify-between">
              <StatCard
                title="Responses"
                value={aiStats.responsesGenerated.toLocaleString()}
                icon="chatbubbles-outline"
              />
              <StatCard
                title="Accuracy"
                value={`${aiStats.accuracy}%`}
                icon="checkmark-circle-outline"
              />
              <StatCard
                title="Rating"
                value={`${aiStats.userSatisfaction}/5`}
                icon="star-outline"
              />
              <StatCard
                title="Uptime"
                value={`${aiStats.uptime}%`}
                icon="pulse-outline"
              />
            </View>
          </View>

          {/* Settings Sections */}
          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4 px-2">
            Preferences
          </Text>

          {/* Appearance Settings */}
          <SettingItem
            icon="moon"
            label="Dark Mode"
            value={theme === 'dark'}
            onValueChange={toggleDarkMode}
            type="toggle"
          />

          <SettingItem
            icon="notifications"
            label="Push Notifications"
            value={true}
            type="toggle"
          />

          <SettingItem
            icon="mic"
            label="Voice Responses"
            value={false}
            type="toggle"
          />

          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4 mt-6 px-2">
            AI Configuration
          </Text>

          <SettingItem
            icon="flash"
            label="Response Speed"
            value="Fast"
            type="option"
            onPress={() => showComingSoon('Response Speed Settings')}
          />

          <SettingItem
            icon="school"
            label="Learning Mode"
            value={true}
            type="toggle"
          />

          <SettingItem
            icon="shield-checkmark"
            label="Safety Filters"
            value="Standard"
            type="option"
            onPress={() => showComingSoon('Safety Filter Settings')}
          />

          <Text className="text-lg font-bold text-gray-800 dark:text-white mb-4 mt-6 px-2">
            Account
          </Text>

          <SettingItem
            icon="person-circle"
            label="Account Settings"
            type="nav"
            onPress={() => showComingSoon('Account Settings')}
          />

          <SettingItem
            icon="card"
            label="Subscription"
            value="Pro Plan"
            type="option"
            onPress={() => showComingSoon('Subscription Management')}
          />

          <SettingItem
            icon="download"
            label="Export Data"
            type="nav"
            onPress={() => showComingSoon('Data Export')}
          />

          <SettingItem
            icon="help-circle"
            label="Help & Support"
            type="nav"
            onPress={() => showComingSoon('Help Center')}
          />

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="mt-8 flex-row items-center justify-center bg-red-500 py-4 rounded-2xl shadow-lg"
          >
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text className="text-white font-semibold ml-2 text-base">Sign Out</Text>
          </TouchableOpacity>

          {/* App Version */}
          <Text className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
            Nova AI v2.1.0 • Build 2024.03.15
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ title, value, icon }) {
  return (
    <View className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-3 mb-3" style={{ width: '48%' }}>
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-xs text-gray-500 dark:text-gray-400 mb-1">{title}</Text>
          <Text className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
            {value}
          </Text>
        </View>
        <Ionicons name={icon} size={20} color="#10b981" />
      </View>
    </View>
  );
}

function SettingItem({ icon, label, value, onValueChange, type = 'toggle', onPress, color = '#10b981' }) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      onPress={type === 'nav' || type === 'option' ? handlePress : undefined}
      className="flex-row mb-3 items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-5 py-3 shadow-sm border border-gray-100 dark:border-gray-700"
      activeOpacity={type === 'nav' || type === 'option' ? 0.7 : 1}
    >
      <View className="flex-row items-center flex-1">
        <View className="w-11 h-11 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl items-center justify-center mr-4">
          <Ionicons name={icon} size={22} color={color} />
        </View>
        <Text className="text-base font-semibold text-gray-900 dark:text-white flex-1">
          {label}
        </Text>
      </View>

      <View className="ml-3">
        {type === 'toggle' ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#e5e7eb', true: '#10b981' }}
            thumbColor="#ffffff"
            ios_backgroundColor="#e5e7eb"
          />
        ) : type === 'option' ? (
          <View className="flex-row items-center">
            <Text className="text-sm font-medium text-emerald-600 dark:text-emerald-400 mr-2">
              {value}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#10b981" />
          </View>
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#10b981" />
        )}
      </View>
    </TouchableOpacity>
  );
}
