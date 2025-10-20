import { Stack } from 'expo-router';

export default function InsightsStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="mood" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
