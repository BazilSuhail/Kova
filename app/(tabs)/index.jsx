import { View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';

export default function App() {
  const router =useRouter()
  return (
    <View className="flex-1 bg-gray-500">
      <StatusBar style="auto" />
      
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-2xl font-bold text-blue-600 mb-4">
          Welcome to NativeWind + React Native!
        </Text>
        
        <TouchableOpacity 
          className="bg-blue-500 px-6 py-3 rounded-lg shadow-md active:bg-blue-700"
          onPress={() => router.push('/auth')}
        >
          <Text className="text-white font-semibold">Click Me</Text>
        </TouchableOpacity>
        
        <View className="mt-6 p-4 bg-white rounded-lg shadow-sm">
          <Text className="text-gray-700">This is a Tailwind-styled box.</Text>
        </View>
      </View>
    </View>
  );
}