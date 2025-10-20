import { ActivityIndicator, Text, View } from 'react-native';

/** Shown while the stored session is being restored, before the shell decides where to go. */
export function BootScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-violet-600">
      <Text className="text-4xl font-bold tracking-tight text-white">Kova</Text>
      <Text className="mt-2 text-sm text-violet-100">Plan, focus, reflect</Text>
      <ActivityIndicator style={{ marginTop: 32 }} color="#FFFFFF" />
    </View>
  );
}
