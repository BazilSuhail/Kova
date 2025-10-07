import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import { Uniwind, useUniwind } from "uniwind";
import { useEffect } from "react";
import "../global.css";

export default function RootLayout() {
  const { theme } = useUniwind();

  useEffect(() => {
    const loadTheme = async () => {
      const savedTheme = await AsyncStorage.getItem("theme");
      if (savedTheme) {
        Uniwind.setTheme(savedTheme); // "dark" or "light"
      }
    };
    loadTheme();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar
        backgroundColor={theme === "dark" ? "#030712" : "#F9FAFB"}
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack
            screenOptions={{
              headerShown: false, // Hide headers if not needed
              gestureEnabled: true, // Enable gestures
              gestureDirection: 'horizontal', // 
            }}
          > 
            <Stack.Screen name="index" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="+not-found" />
          </Stack> 

     
    </GestureHandlerRootView>
  );
}
//     </GestureHandlerRootView>
//   );
// }
