// TaskDetailModal.js
import { useEffect, useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    Dimensions,
    Modal,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const SCREEN_HEIGHT = Dimensions.get('window').height; 

export default function TaskDetailModal({ visible, onClose, selectedDay, tasks, getCategoryColor }) {
    const insets=useSafeAreaInsets()
  const modalHeight = useMemo(() => {
    const estimatedHeight = selectedDay?.tasks?.length > 0 
      ? Math.min(SCREEN_HEIGHT * 0.8, 200 + (selectedDay.tasks.length * 60))
      : SCREEN_HEIGHT * 0.4;
    return estimatedHeight + insets.bottom;
  }, [selectedDay]);

  const translateY = useSharedValue(SCREEN_HEIGHT);
  const context = useSharedValue({ y: 0 });
  const isClosing = useSharedValue(false);

  const animatedStyles = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [SCREEN_HEIGHT, SCREEN_HEIGHT - modalHeight],
      [0, 1],
      Extrapolate.CLAMP
    ),
  }));

  const openModal = () => {
    // Move modal up by its height to show it at the bottom
    const finalPosition = SCREEN_HEIGHT - modalHeight;
    translateY.value = withSpring(finalPosition, { damping: 20, stiffness: 150 });
  };

  const closeModal = () => {
    isClosing.value = true;
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
        isClosing.value = false;
      }
    });
  };

  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      const maxUp = SCREEN_HEIGHT - modalHeight; // Top position when fully open
      const maxDown = SCREEN_HEIGHT; // Bottom position when closed
      const newTranslate = Math.min(Math.max(context.value.y + event.translationY, maxUp), maxDown);
      translateY.value = newTranslate;
    })
    .onEnd((event) => {
      const velocity = event.velocityY;
      const threshold = modalHeight * 0.25;
      const openPosition = SCREEN_HEIGHT - modalHeight;
      const distanceFromOpen = translateY.value - openPosition;

      if (velocity > 1000 || distanceFromOpen > threshold) {
        runOnJS(closeModal)();
      } else {
        const finalPosition = SCREEN_HEIGHT - modalHeight;
        translateY.value = withSpring(finalPosition, { damping: 20, stiffness: 150 });
      }
    });

  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(closeModal)();
  });

  useEffect(() => {
    if (visible && selectedDay) {
      openModal();
    } else if (!visible && !isClosing.value) {
      if (translateY.value !== SCREEN_HEIGHT) {
         closeModal();
      } else {
        onClose();
      }
    }
  }, [visible, selectedDay]);

  if (!selectedDay) return null;

  const dateString = selectedDay.dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <Modal
      animationType="none"
      transparent={true}
      visible={visible}
      onRequestClose={closeModal}
      statusBarTranslucent={true}
    >
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
          },
          backdropAnimatedStyle,
        ]}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <GestureDetector gesture={tapGesture}>
          <View className="flex-1" />
        </GestureDetector>
      </Animated.View>

      <GestureDetector gesture={panGesture}>
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              height: modalHeight,
              top: 0, // Changed from bottom: 0 to top: 0
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              overflow: 'hidden',
            },
            animatedStyles,
          ]}
        >
          <View className="items-center pt-3 pb-2">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          <View className="px-4 pb-2 border-b border-gray-200 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800">{dateString}</Text>
            <TouchableOpacity onPress={closeModal} className="p-2">
              <Text className="text-blue-500 text-lg font-bold">X</Text>
            </TouchableOpacity>
          </View>

          <ScrollView className="p-4 flex-1">
            {tasks && tasks.length > 0 ? (
              tasks.map((task) => (
                <View
                  key={task.id}
                  className={`p-3 rounded-lg mb-2 ${getCategoryColor(task.category, task.is_completed)}`}
                >
                  <Text
                    className={`font-medium text-gray-800 ${task.is_completed ? "line-through" : ""}`}
                  >
                    {task.title}
                  </Text>
                  <Text className="text-gray-800 text-xs opacity-75 mt-1 capitalize">
                    {task.category}
                  </Text>
                </View>
              ))
            ) : (
              <View className="flex-1 justify-center items-center py-8">
                <Text className="text-gray-500 text-center">No tasks scheduled for this day</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>
      </GestureDetector>
    </Modal>
  );
}