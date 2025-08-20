import CustomTabBar from '@/components/bottom-tab-bar/CustomTabBar';
import { COLORS } from '@/constants/colors';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { Dimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const Tab = createMaterialTopTabNavigator();
const Tabs = withLayoutContext(Tab.Navigator);
const { width } = Dimensions.get('window');

export default function TabsLayout() {
  const insets =useSafeAreaInsets();
  return ( 
      <View style={{ flex: 1,backgroundColor: COLORS.background,paddingTop:insets.top,paddingBottom:insets.bottom }}>
        <Tabs
          tabBarPosition="bottom"
          screenOptions={{
            tabBarShowLabel: false,
            swipeEnabled: true,
            animationEnabled: true,
            tabBarStyle: { display: 'none', height: 0 },
            tabBarIndicatorStyle: { display: 'none' },
            tabBarIcon: () => null,
          }}
          initialLayout={{ width }}
          sceneContainerStyle={{ backgroundColor: 'transparent' }}
        >
          <Tabs.Screen name="index" />
          <Tabs.Screen name="tasks" />
          <Tabs.Screen name="assistant" />
          <Tabs.Screen name="planner" />
          <Tabs.Screen name="profile" />
        </Tabs>

        {/* Custom Tab Bar */}
        <CustomTabBar />
      </View> 
  );
}
