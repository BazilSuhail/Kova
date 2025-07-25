import { Ionicons } from '@expo/vector-icons';
import { Alert, ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';
import { useColorScheme } from 'nativewind';

const user = {
  name: 'Bazil Suhail',
  email: 'bazilsuhail@example.com',
};

export default function SettingsScreen() {
  const { colorScheme, toggleColorScheme } = useColorScheme();

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Logout", style: "destructive" }
      ]
    );
  };

  return (
    <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
      <ScrollView
        className="flex-1 pt-12 bg-gray-100 dark:bg-gray-900"
        contentContainerStyle={{ padding: 20 }}
      >
        <View className="mb-6">
          <Text className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Settings
          </Text>
          <Text className="text-gray-500 text-base dark:text-gray-400">
            Manage your preferences
          </Text>
        </View>

        <View className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-6 shadow-sm shadow-gray-200 dark:shadow-none">
          <Text className="text-xl font-semibold text-gray-800 dark:text-white">{user.name}</Text>
          <Text className="text-sm text-gray-500 dark:text-gray-400">{user.email}</Text>
        </View>

        <View className="space-y-3">
          <View className="flex-row items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 shadow-sm shadow-gray-100 dark:shadow-none">
            <View className="flex-row items-center">
              <Ionicons
                name="moon-outline"
                size={22}
                color={colorScheme === 'dark' ? "#93c5fd" : "#4b5563"}
              />
              <Text className="ml-3 text-base text-gray-800 font-medium dark:text-white">
                Dark Mode
              </Text>
            </View>
            <Switch
              value={colorScheme === 'dark'}
              onValueChange={toggleColorScheme}
              trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
              thumbColor={colorScheme === 'dark' ? '#ffffff' : '#f4f4f5'}
            />
          </View>

          <StaticSettingItem icon="notifications" label="Notifications" value={true} />
          <StaticSettingItem icon="cloud-offline" label="Offline Mode" value={false} />
          <StaticSettingItem icon="language" label="Language" value="English" type="option" />
          <StaticSettingItem icon="person-circle" label="Account Settings" type="nav" />
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          className="mt-10 flex-row items-center justify-center bg-red-500 py-3 rounded-2xl"
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text className="text-white font-semibold ml-2">Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function StaticSettingItem({ icon, label, value, type = 'toggle' }) {
  return (
    <View className="flex-row mb-[15px] items-center justify-between bg-white dark:bg-gray-800 rounded-2xl px-4 py-4 shadow-sm shadow-gray-100 dark:shadow-none">
      <View className="flex-row items-center">
        <Ionicons name={`${icon}-outline`} size={22} color={"#4b5563"} />
        <Text className="ml-3 text-base text-gray-800 font-medium dark:text-white">
          {label}
        </Text>
      </View>

      {type === 'toggle' ? (
        <Switch
          value={value}
          trackColor={{ false: '#d1d5db', true: '#3b82f6' }}
          thumbColor={value ? '#ffffff' : '#f4f4f5'}
        />
      ) : type === 'option' ? (
        <Text className="text-sm text-gray-500 dark:text-gray-400">
          {value}
        </Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </View>
  );
}
