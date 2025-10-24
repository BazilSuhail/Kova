import { TopTabs } from 'expo-router/js-top-tabs';

import { AppTabBar, type AppTabBarProps } from '@/components/navigation/tab-bar';

export const unstable_settings = { initialRouteName: '(home)' };

export default function TabsLayout() {
  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={(props: AppTabBarProps) => <AppTabBar {...props} />}
      screenOptions={{ lazy: true, swipeEnabled: true, animationEnabled: true }}
    >
      <TopTabs.Screen name="(home)" options={{ title: 'Home' }} />
      <TopTabs.Screen name="tasks" options={{ title: 'Tasks' }} />
      <TopTabs.Screen name="plan" options={{ title: 'Plan' }} />
      <TopTabs.Screen name="insights" options={{ title: 'Insights' }} />
      <TopTabs.Screen name="profile" options={{ title: 'Profile' }} />
    </TopTabs>
  );
}
