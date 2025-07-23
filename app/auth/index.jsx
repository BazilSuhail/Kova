import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity } from 'react-native';
import { FontAwesome, Ionicons } from '@expo/vector-icons'; // For leaf icon and eye toggle
import { AntDesign } from '@expo/vector-icons'; // For Apple icon
import { GoogleLogoIcon } from '@expo/vector-icons'; // For Google icon
import { Text } from 'react-native';

const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View className="flex-1 bg-white p-5">
      {/* Header */}
      <View className="flex-row items-center mb-4">
        <Ionicons name="leaf" size={24} color="#008000" />
        <Text className="text-xl font-bold ml-2">Leafboard</Text>
      </View>
      <Text className="text-gray-600 text-center mb-8">Work without limits</Text>

      {/* Email Input */}
      <Text className="text-sm text-gray-600 mb-2">Your email address</Text>
      <TextInput
        className="w-full h-12 px-4 rounded-full border border-gray-300"
        placeholder="dilerragio@gmail.com"
        value={email}
        onChangeText={(text) => setEmail(text)}
        keyboardType="email-address"
      />

      {/* Password Input */}
      <Text className="text-sm text-gray-600 mb-2">Choose a password</Text>
      <View className="relative w-full h-12 rounded-full border border-gray-300">
        <TextInput
          className="w-full h-full px-4 rounded-full focus:outline-none"
          placeholder="min. 8 characters"
          value={password}
          onChangeText={(text) => setPassword(text)}
          secureTextEntry={!showPassword}
        />
        <TouchableOpacity
          className="absolute right-4 top-1/2 transform -translate-y-1/2"
          onPress={() => setShowPassword(!showPassword)}
        >
          <Ionicons
            name={showPassword ? 'eye-off' : 'eye'}
            size={20}
            color="#999"
          />
        </TouchableOpacity>
      </View>

      {/* Continue Button */}
      <TouchableOpacity
        className="w-full h-12 mt-6 bg-gray-100 rounded-full flex-row items-center justify-center"
      >
        <Text className="text-sm text-gray-600 mr-2">Continue</Text>
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* OR Separator */}
      <Text className="text-sm text-gray-600 mt-8 text-center">or</Text>

      {/* Google Sign Up */}
      <TouchableOpacity
        className="w-full h-12 mt-4 bg-white rounded-full border border-gray-300 flex-row items-center px-4"
      >
        <FontAwesome name="google" size={24} color="#4285F4" />
        <Text className="text-sm text-gray-600 ml-2">Sign up with Google</Text>
      </TouchableOpacity>

      {/* Apple Sign Up */}
      <TouchableOpacity
        className="w-full h-12 mt-4 bg-white rounded-full border border-gray-300 flex-row items-center px-4"
      >
        <AntDesign name="apple1" size={24} color="#000" />
        <Text className="text-sm text-gray-600 ml-2">Sign up with Apple</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Signin;
// import React, { useState } from 'react';
// import {
//   SafeAreaView,
//   Text,
//   TouchableOpacity,
//   View,
// } from 'react-native';
// import { StatusBar } from 'expo-status-bar';
// import { useRouter } from 'expo-router';
// import BottomSheet from '@/components/BottomSheet'; // Adjust the path if needed

// export default function App() {
//   const router = useRouter();
//   const [bottomSheetVisible, setBottomSheetVisible] = useState(false);

//   return (
//     <SafeAreaView className="flex-1 bg-gray-500">
//       <StatusBar style="auto" />

//       <View className="flex-1 items-center justify-center p-4">
//         <Text className="text-2xl font-bold text-blue-600 mb-4">
//           Welcome to NativeWind + React Native!
//         </Text>

//         <TouchableOpacity
//           className="bg-blue-500 px-6 py-3 rounded-lg shadow-md active:bg-blue-700"
//           onPress={() => setBottomSheetVisible(true)}
//         >
//           <Text className="text-white font-semibold">Open Bottom Sheet</Text>
//         </TouchableOpacity>

//         <View className="mt-6 p-4 bg-white rounded-lg shadow-sm">
//           <Text className="text-gray-700">This is a Tailwind-styled box.</Text>
//         </View>
//       </View>

//       {/* Pass `height` from parent and control visibility */}
//       <BottomSheet
//         visible={bottomSheetVisible}
//         onClose={() => setBottomSheetVisible(false)}
//         height={600} // You can change this value or make it dynamic
//       />
//     </SafeAreaView>
//   );
// }
