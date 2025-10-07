import { Ionicons } from '@expo/vector-icons'; 
import { View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
 
export default function  SwipeableTaskItem ({ item, onDelete, children }) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const startX = useSharedValue(0);

  const panGesture = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
    })
    .onUpdate((event) => {
      const newTranslateX = startX.value + event.translationX;
      translateX.value = Math.min(0, newTranslateX);
    })
    .onEnd((event) => {
      const shouldDelete = event.translationX < -100;

      if (shouldDelete) {
        translateX.value = withSpring(-300);
        opacity.value = withSpring(0, undefined, (finished) => {
          if (finished) {
            runOnJS(onDelete)(item);
          }
        });
      } else {
        translateX.value = withSpring(0);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: opacity.value,
    };
  });

  const deleteButtonStyle = useAnimatedStyle(() => {
    const scale = translateX.value < -50 ? 1 : 0;
    return {
      transform: [{ scale: withSpring(scale) }],
    };
  });

  return (
    <View className="relative">
      {/* Delete Button Background */}
      <Animated.View
        style={deleteButtonStyle}
        className="absolute right-0 top-0 bottom-0 w-20 bg-red-500 rounded-r-xl items-center justify-center mb-5 z-0"
      >
        <Ionicons name="trash" size={24} color="white" />
      </Animated.View>

      {/* Main Task Item */}
      <GestureDetector gesture={panGesture}>
        <Animated.View style={animatedStyle}>
          {children}
        </Animated.View>
      </GestureDetector>
    </View>
  );
};
