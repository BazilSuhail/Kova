import { Stack } from 'expo-router';

export const unstable_settings = { initialRouteName: 'index' };

export default function PlanStackLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="editor" options={{ presentation: 'modal' }} />
    </Stack>
  );
}
