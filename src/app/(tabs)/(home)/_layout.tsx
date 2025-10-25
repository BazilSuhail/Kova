import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

export default function HomeStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        animationDuration: 220,
      }}
    >
      <Stack.Screen name="index" options={{ animation: 'fade' }} />
      <Stack.Screen
        name="notifications"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom',
          animationDuration: 260,
        }}
      />
    </Stack>
  );
}
