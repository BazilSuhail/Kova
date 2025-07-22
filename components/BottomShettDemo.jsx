import { useCallback } from 'react';
import {
  Dimensions,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function BottomSheetDemo() {
  const { height: SCREEN_HEIGHT } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  
  // Calculate max translateY accounting for bottom insets
  const MAX_TRANSLATE_Y = -SCREEN_HEIGHT + 100 + insets.bottom;
  
  const translateY = useSharedValue(0);
  const isOpen = useSharedValue(false);
  const context = useSharedValue({ y: 0 });

  const scrollTo = useCallback((destination) => {
    'worklet';
    if (destination === 0) {
      // Closing - start fast then slow down
      translateY.value = withTiming(destination, {
        duration: 500,
        easing: Easing.out(Easing.exp),
      });
    } else {
      // Opening - start slow then speed up
      translateY.value = withTiming(destination, {
        duration: 600,
        easing: Easing.in(Easing.exp),
      });
    }
    isOpen.value = destination !== 0;
  }, []);

  const closeSheet = () => {
    scrollTo(0);
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      translateY.value = Math.max(event.translationY + context.value.y, MAX_TRANSLATE_Y);
    })
    .onEnd(() => {
      if (translateY.value > -SCREEN_HEIGHT / 3) {
        scrollTo(0);
      } else {
        scrollTo(MAX_TRANSLATE_Y);
      }
    });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'white' }}>
      <Pressable
        style={{ backgroundColor: '#3b82f6', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
        onPress={() => scrollTo(MAX_TRANSLATE_Y)}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>Open Bottom Sheet</Text>
      </Pressable>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            styles.bottomSheet,
            animatedStyle,
            {
              width: '100%',
              height: SCREEN_HEIGHT * 0.8,
              backgroundColor: 'white',
              padding: 16,
              paddingBottom: insets.bottom + 16,
            }
          ]}
        >
          <View style={{ alignItems: 'center', marginBottom: 16 }}>
            <View style={{ width: 48, height: 6, backgroundColor: '#9ca3af', borderRadius: 999 }} />
          </View>
          <Text style={{ color: 'black', fontSize: 20 }}>Hello from the Bottom Sheet!</Text>

          <Pressable
            style={{ marginTop: 16, backgroundColor: '#ef4444', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12, alignSelf: 'flex-start' }}
            onPress={closeSheet}
          >
            <Text style={{ color: 'white' }}>Close</Text>
          </Pressable>
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    top: Dimensions.get('window').height,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});