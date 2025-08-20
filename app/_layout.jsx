import * as NavigationBar from "expo-navigation-bar";
import { Stack } from "expo-router";
import { StatusBar } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "../global.css";
import { useColorScheme } from "nativewind";
NavigationBar.setButtonStyleAsync("dark");

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();
  console.log(colorScheme)


  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      {/* White background ensures nav area looks white in Expo Go */}
      <StatusBar
        backgroundColor={colorScheme === "dark" ? "#000" : "#fff"}
        barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
      />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
