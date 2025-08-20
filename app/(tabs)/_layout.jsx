// app/(tabs)/_layout.jsx
import { AntDesign, Feather, Ionicons, MaterialCommunityIcons, MaterialIcons,FontAwesome  } from '@expo/vector-icons';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { usePathname, useRouter, useSegments, withLayoutContext } from 'expo-router';
import React, { useMemo } from 'react';
import { Dimensions, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(Tab.Navigator);
const { width } = Dimensions.get('window');

// Define colors based on your palette
const COLORS = {
  primary: '#059669',    // emerald-600
  background: '#f9fafb', // gray-50 (App background)
  cardBackground: 'white',
  tabBarBorder: '#e5e7eb', // gray-200
  iconInactive: '#94a3b8', // slate-400 (Tertiary icons)
  indicator: '#d1fae5',    // emerald-600
  textActive: '#059669',   // gray-800
  textInactive: '#6b7280', // gray-500
};

// Tab configuration with proper route names and paths
const TAB_CONFIG = [
  {
    name: 'index',
    path: '/(tabs)/',
    label: 'Home',
    icon: (color, size = 24) => <FontAwesome name="home" size={size} color={color} />
  },
  {
    name: 'tasks',
    path: '/(tabs)/tasks',
    label: 'Tasks',
    icon: (color, size = 24) => <Feather name="check-square" size={size} color={color} />
  },
  {
    name: 'assistant',
    path: '/(tabs)/assistant',
    label: 'Assistant',
    icon: (color, size = 24) => <MaterialIcons name="assistant" size={size} color={color} />
  },
  {
    name: 'planner',
    path: '/(tabs)/planner',
    label: 'Planner',
    icon: (color, size = 24) => <MaterialCommunityIcons name="calendar-month-outline" size={size} color={color} />
  },
  {
    name: 'profile',
    path: '/(tabs)/profile',
    label: 'Profile',
    icon: (color, size = 24) => <AntDesign name="user" size={size} color={color} />
  },
];

// Custom Tab Bar Component
function CustomTabBar() {
  const router = useRouter();
  const pathname = usePathname();
  const segments = useSegments();

  // Determine active index based on current path
  const activeIndex = useMemo(() => {
    // Handle root index route
    if (pathname === '/' || pathname === '' || segments.length === 0) {
      return 0;
    }

    // Get the last segment (the actual tab name)
    const currentTab = segments[segments.length - 1];

    // Find matching tab configuration
    const tabIndex = TAB_CONFIG.findIndex(tab => {
      // Handle index route specially
      if (tab.name === 'index') {
        return currentTab === '(tabs)' || currentTab === 'index' || !currentTab;
      }
      return tab.name === currentTab;
    });

    return Math.max(0, tabIndex);
  }, [pathname, segments]);

  const handleTabPress = (tab, index) => {
    try {
      // Use Expo Router's push method with the correct path
      router.push(tab.path);
    } catch (error) {
      console.log('Navigation error:', error);
    }
  };

  return (
    <View style={{
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: COLORS.cardBackground,
      borderTopWidth: 1,
      borderTopColor: COLORS.tabBarBorder,
      flexDirection: 'row',
      paddingTop: 6,
      zIndex: 1000,
    }}>
      {TAB_CONFIG.map((tab, index) => {
        const isActive = activeIndex === index;
        const color = isActive ? COLORS.primary : COLORS.iconInactive;
        const textColor = isActive ? COLORS.textActive : COLORS.textInactive;

        return (
          <TouchableOpacity
            key={tab.name}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 8,
            }}
            onPress={() => handleTabPress(tab, index)}
            activeOpacity={0.7}
          >
            {/* Active indicator */}
            {isActive && (
              <View style={{
                position: 'absolute',
                top: 3,
                left: '50%',
                transform: [{ translateX: -30 }],
                width: 60,
                height: 34,
                backgroundColor: COLORS.indicator,
                borderRadius: 20,
              }} />
            )}
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 40,
            }}>
              {tab.icon(color, 23)}
              <Text style={{
                fontSize: isActive ? 11 : 10,
                fontWeight: isActive ? '600' : '400',
                color: textColor,
                marginTop: isActive ? 6 : 4,
                textAlign: 'center',
              }}>
                {tab.label}
              </Text>
            </View>


          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1 }}>
        {/* Material Top Tabs - Hidden but functional for swipe */}
        <Tabs
          tabBarPosition="bottom"
          screenOptions={{
            tabBarShowLabel: false,
            swipeEnabled: true,
            animationEnabled: true,
            tabBarStyle: {
              display: 'none', // Hide the default tab bar completely
              height: 0,
            },
            tabBarIndicatorStyle: {
              display: 'none',
            },
            tabBarIcon: () => null,
          }}
          initialLayout={{ width }}
          sceneContainerStyle={{
            backgroundColor: 'transparent',
            paddingBottom: 80, // Account for custom tab bar height
          }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="tasks" />
          <Tabs.Screen name="assistant" />
          <Tabs.Screen name="planner" />
          <Tabs.Screen name="profile" />
        </Tabs>

        {/* Custom Tab Bar - Always visible and synced */}
        <CustomTabBar />
      </View>
    </SafeAreaView>
  );
}