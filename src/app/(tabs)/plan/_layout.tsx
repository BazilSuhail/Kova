import { Stack } from 'expo-router';

export default function PlanStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="editor" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
