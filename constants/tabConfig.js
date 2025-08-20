import { AntDesign, Feather, MaterialCommunityIcons, MaterialIcons, FontAwesome } from '@expo/vector-icons'; 
export const TAB_CONFIG = [
  {
    name: 'index',
    path: '/(tabs)/',
    label: 'Home',
    icon: (color, size = 24) => <FontAwesome name="home" size={size} color={color} />
  },
  {
    name: 'tasks',
    path: '/(tabs)/tasks',
    label: 'Tasks',
    icon: (color, size = 24) => <Feather name="check-square" size={size} color={color} />
  },
  {
    name: 'assistant',
    path: '/(tabs)/assistant',
    label: 'Assistant',
    icon: (color, size = 24) => <MaterialIcons name="assistant" size={size} color={color} />
  },
  {
    name: 'planner',
    path: '/(tabs)/planner',
    label: 'Planner',
    icon: (color, size = 24) => <MaterialCommunityIcons name="calendar-month-outline" size={size} color={color} />
  },
  {
    name: 'profile',
    path: '/(tabs)/profile',
    label: 'Profile',
    icon: (color, size = 24) => <AntDesign name="user" size={size} color={color} />
  },
];
