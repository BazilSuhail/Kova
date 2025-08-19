import { Stack } from 'expo-router'; 
import { StatusBar, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "../global.css";

import * as NavigationBar from 'expo-navigation-bar'; 

NavigationBar.setBackgroundColorAsync('#FFFFFF');
NavigationBar.setButtonStyleAsync('light');

export default function RootLayout() {
  const colorScheme = useColorScheme(); 

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View className={colorScheme === 'dark' ? 'dark flex-1' : 'flex-1'}>
        <StatusBar
          backgroundColor={colorScheme === 'dark' ? '#000' : '#F9FAFB'}
          barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
