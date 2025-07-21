import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  return (
    <ScrollView className="bg-gray-50 flex-1">
      {/* Header */}
      <View className="bg-blue-600 p-4">
        <Text className="text-white text-2xl font-bold">My App</Text>
      </View>

      {/* Hero Section */}
      <View className="items-center p-6">
        <Image
          source={{ uri: 'https://via.placeholder.com/150' }}
          className="w-32 h-32 rounded-full mb-4"
        />
        <Text className="text-xl font-semibold mb-2">Welcome Back!</Text>
        <Text className="text-gray-600 text-center">
          This is a dummy component styled with Tailwind in React Native.
        </Text>
      </View>

      {/* Cards Grid */}
      <View className="flex-row flex-wrap justify-center px-2">
        {[1, 2, 3, 4].map((item) => (
          <TouchableOpacity
            key={item}
            className="bg-white m-2 p-4 rounded-lg w-40 shadow-sm"
          >
            <Text className="font-bold text-blue-600">Card {item}</Text>
            <Text className="text-gray-500 mt-1">Tap me</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Footer Button */}
      <TouchableOpacity
        className="bg-blue-500 mx-6 my-8 p-3 rounded-full items-center"
        onPress={() => alert('Action!')}
      >
        <Text className="text-white font-bold">Get Started</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}