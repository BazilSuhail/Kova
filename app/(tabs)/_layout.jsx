import { Tabs } from 'expo-router';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; // Using Expo icons directly
import { Platform, View } from 'react-native';
import { useColorScheme } from 'nativewind'; // NativeWind's color scheme hook

export default function TabLayout() {
  const { colorScheme } = useColorScheme(); // NativeWind's hook (replace if not using)
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: isDark ? '#3b82f6' : '#2563eb', // Tailwind blue-500/600
        tabBarInactiveTintColor: isDark ? '#94a3b8' : '#cbd5e1', // Tailwind slate-400/300
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1e293b' : '#ffffff', // Tailwind slate-900/white
          borderTopWidth: 0,
          ...Platform.select({
            ios: {
              position: 'absolute',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
            },
          }),
        },
        tabBarItemStyle: {
          paddingVertical: Platform.OS === 'ios' ? 5 : 0,
        },
      }}
    >
      {/* Home Tab */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="home" size={24} color={color} />
          ),
        }}
      />

      {/* Explore Tab */}
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <FontAwesome name="search" size={24} color={color} />
          ),
        }}
      />

      {/* Add more tabs as needed */}
    </Tabs>
  );
}