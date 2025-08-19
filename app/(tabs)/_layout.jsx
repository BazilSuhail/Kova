// app/(tabs)/_layout.jsx
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(Tab.Navigator);

// Define colors based on your palette
const COLORS = {
  primary: '#059669',    // emerald-600
  background: '#f9fafb', // gray-50 (App background)
  cardBackground: 'white',
  tabBarBorder: '#e5e7eb', // gray-200
  iconInactive: '#94a3b8', // slate-400 (Tertiary icons)
  indicator: '#059669',    // emerald-600
};

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <Tabs
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          swipeEnabled: true,
          tabBarStyle: {
            backgroundColor: COLORS.cardBackground,
            borderTopWidth: 1, // Increased for clarity
            borderColor: COLORS.tabBarBorder,
            height: 60, 
          },
          tabBarIndicatorStyle: {
            backgroundColor: COLORS.indicator, // Use emerald for active indicator
            height: 3,
            top: 0, // Keep indicator at the top
          },
          tabBarIcon: ({ focused }) => {
            // Use emerald for active, slate-400 for inactive
            const color = focused ? COLORS.primary : COLORS.iconInactive;
            switch (route.name) {
              case 'index':
                return <Ionicons name="home-outline" size={26} color={color} />;
              case 'tasks':
                return <Feather name="check-square" size={26} color={color} />;
              case 'planner':
                return <MaterialCommunityIcons name="calendar-month-outline" size={26} color={color} />;
              case 'assistant':
                return <MaterialIcons name="assistant" size={26} color={color} />;
              case 'profile':
                return <AntDesign name="user" size={26} color={color} />;
              default:
                return null;
            }
          },
        })}
      >
        <Tabs.Screen name="index" />
        <Tabs.Screen name="tasks" />
        <Tabs.Screen name="assistant" />
        <Tabs.Screen name="planner" />
        <Tabs.Screen name="profile" />
      </Tabs>
    </SafeAreaView>
  );
}