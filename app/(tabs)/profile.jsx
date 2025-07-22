import { Ionicons } from '@expo/vector-icons';
import { ScrollView, Switch, Text, TouchableOpacity, View } from 'react-native';

// Mock user preferences (you can replace with real state or context)
const user = {
  name: 'Ali Raza',
  email: 'ali.raza@example.com',
  preferences: {
    darkMode: true,
    notifications: true,
    offlineMode: false,
    language: 'English',
  },
};

export default function SettingsScreen() {
  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f9fafb', paddingTop: 60 }} contentContainerStyle={{ padding: 20 }}>
      {/* Header */}
      <View className="mb-6">
        <Text className="text-3xl font-extrabold text-gray-900">Settings</Text>
        <Text className="text-gray-500 text-base">Manage your preferences</Text>
      </View>

      {/* Profile Info */}
      <View className="bg-white rounded-2xl p-4 mb-6 shadow-sm shadow-gray-200">
        <Text className="text-xl font-semibold text-gray-800">{user.name}</Text>
        <Text className="text-sm text-gray-500">{user.email}</Text>
      </View>

      {/* Settings List */}
      <View className="space-y-3">
        <SettingItem icon="moon" label="Dark Mode" value={user.preferences.darkMode} />
        <SettingItem icon="notifications" label="Notifications" value={user.preferences.notifications} />
        <SettingItem icon="cloud-offline" label="Offline Mode" value={user.preferences.offlineMode} />
        <SettingItem icon="language" label="Language" value={user.preferences.language} type="option" />
        <SettingItem icon="person-circle" label="Account Settings" type="nav" />
      </View>

      {/* Logout */}
      <TouchableOpacity className="mt-10 flex-row items-center justify-center bg-red-500 py-3 rounded-2xl">
        <Ionicons name="log-out-outline" size={20} color="white" />
        <Text className="text-white font-semibold ml-2">Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// 🔧 Reusable Setting Item Component
function SettingItem({ icon, label, value, type = 'toggle' }) {
  return (
    <View className="flex-row mb-[15px] items-center justify-between bg-white rounded-2xl px-4 py-4 shadow-sm shadow-gray-100">
      <View className="flex-row items-center">
        <Ionicons name={`${icon}-outline`} size={22} color="#4b5563" />
        <Text className="ml-3 text-base text-gray-800 font-medium">{label}</Text>
      </View>

      {type === 'toggle' ? (
        <Switch value={value} />
      ) : type === 'option' ? (
        <Text className="text-sm text-gray-500">{value}</Text>
      ) : (
        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
      )}
    </View>
  );
}

// import { useCallback } from 'react';
// import {
//   Dimensions,
//   Pressable,
//   StyleSheet,
//   Text,
//   useWindowDimensions,
//   View,
// } from 'react-native';
// import { Gesture, GestureDetector } from 'react-native-gesture-handler';
// import Animated, {
//   Easing,
//   useAnimatedStyle,
//   useSharedValue,
//   withTiming
// } from 'react-native-reanimated';
// import { useSafeAreaInsets } from 'react-native-safe-area-context';

// export default function BottomSheetDemo() {
//   const { height: SCREEN_HEIGHT } = useWindowDimensions();
//   const insets = useSafeAreaInsets();
  
//   // Calculate max translateY accounting for bottom insets
//   const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 100 + insets.bottom;
  
//   const translateY = useSharedValue(0);
//   const isOpen = useSharedValue(false);
//   const context = useSharedValue({ y: 0 });

//   const scrollTo = useCallback((destination) => {
//     'worklet';
//     if (destination === 0) {
//       // Closing - start fast then slow down
//       translateY.value = withTiming(destination, {
//         duration: 500,
//         easing: Easing.out(Easing.exp),
//       });
//     } else {
//       // Opening - start slow then speed up
//       translateY.value = withTiming(destination, {
//         duration: 600,
//         easing: Easing.in(Easing.exp),
//       });
//     }
//     isOpen.value = destination !== 0;
//   }, []);

//   const closeSheet = () => {
//     scrollTo(0);
//   };

//   const panGesture = Gesture.Pan()
//     .onStart(() => {
//       context.value = { y: translateY.value };
//     })
//     .onUpdate((event) => {
//       translateY.value = Math.max(event.translationY + context.value.y, MAX_TRANSLATE_Y);
//     })
//     .onEnd(() => {
//       if (translateY.value > -SCREEN_HEIGHT / 3) {
//         scrollTo(0);
//       } else {
//         scrollTo(MAX_TRANSLATE_Y);
//       }
//     });

//   const animatedStyle = useAnimatedStyle(() => {
//     return {
//       transform: [{ translateY: translateY.value }],
//     };
//   });

//   return (
//     <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
//       <Pressable
//         style={{ backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
//         onPress={() => scrollTo(MAX_TRANSLATE_Y)}
//       >
//         <Text style={{ color: 'white', fontSize: 18 }}>Open Bottom Sheet</Text>
//       </Pressable>

//       <GestureDetector gesture={panGesture}>
//         <Animated.View
//           style={[
//             styles.bottomSheet,
//             animatedStyle,
//             {
//               width: '100%',
//               height: SCREEN_HEIGHT * 0.8,
//               backgroundColor: 'white',
//               padding: 16,
//               paddingBottom: insets.bottom + 16,
//             }
//           ]}
//         >
//           <View style={{ alignItems: 'center', marginBottom: 16 }}>
//             <View style={{ width: 48, height: 6, backgroundColor: '#9ca3af', borderRadius: 999 }} />
//           </View>
//           <Text style={{ color: 'black', fontSize: 20 }}>Hello from the Bottom Sheet!</Text>

//           <Pressable
//             style={{ marginTop: 16, backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start' }}
//             onPress={closeSheet}
//           >
//             <Text style={{ color: 'white' }}>Close</Text>
//           </Pressable>
//         </Animated.View>
//       </GestureDetector>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   bottomSheet: {
//     position: 'absolute',
//     top: Dimensions.get('window').height,
//     borderTopLeftRadius: 24,
//     borderTopRightRadius: 24,
//     elevation: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -5 },
//     shadowOpacity: 0.1,
//     shadowRadius: 10,
//   },
// });