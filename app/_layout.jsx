import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import "../global.css";

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        setColorScheme(savedTheme); // "dark" or "light"
      }
    };
    loadTheme();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        backgroundColor={colorScheme === "dark" ? "#030712" : "#F9FAFB"}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}

// import { Stack } from "expo-router";
// import { StatusBar } from "react-native";
// import { GestureHandlerRootView } from "react-native-gesture-handler";

// import "../global.css";
// import { useColorScheme } from "nativewind"; 


// export default function RootLayout() {
//   const { colorScheme } = useColorScheme();
  
//   return (
//     <GestureHandlerRootView style={{ flex: 1 }}>
//       <StatusBar
//         backgroundColor={colorScheme === "dark" ? "#030712" : "#F9FAFB"}
//         barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
//       />
//       <Stack screenOptions={{ headerShown: false }}>
//         <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
//       </Stack>
//     </GestureHandlerRootView>
//   );
// }
