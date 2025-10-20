import { Stack } from 'expo-router';

export default function ProfileStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="about" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
    </Stack>
  );
}
