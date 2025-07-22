// app/(tabs)/_layout.jsx
import React from 'react';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { Platform, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, Feather, MaterialCommunityIcons,MaterialIcons , AntDesign } from '@expo/vector-icons';

const Tab = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(Tab.Navigator);

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Tabs
        tabBarPosition="bottom"
        screenOptions={({ route }) => ({
          tabBarShowLabel: false,
          swipeEnabled: true,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 0.5,
            borderColor: '#ccc',
            height: 60,
          },
          tabBarIndicatorStyle: {
            backgroundColor: '#2563EB',
            height: 3,
            top: 0,
          },
          tabBarIcon: ({ focused }) => {
            const color = focused ? '#2563EB' : '#999';
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
