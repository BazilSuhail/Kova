// TaskDetailModal.js
import { useEffect } from 'react';
import {
    Dimensions,
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

// Fallback height if selectedDay is not provided initially
const MODAL_HEIGHT = SCREEN_HEIGHT * 0.6; 

export default function TaskDetailModal({ visible, onClose, selectedDay, tasks, getCategoryColor }) {
  const modalHeight = selectedDay?.tasks?.length > 0 
    ? Math.min(SCREEN_HEIGHT * 0.8, 200 + (selectedDay.tasks.length * 60)) // Estimate height based on tasks
    : SCREEN_HEIGHT * 0.4; // Default height for no tasks

  const translateY = useSharedValue(SCREEN_HEIGHT); // Start off-screen
  const context = useSharedValue({ y: 0 });
  const isClosing = useSharedValue(false);

  const animatedStyles = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateY.value,
      [SCREEN_HEIGHT, SCREEN_HEIGHT * 0.1], // Adjust end value if needed
      [0, 1],
      Extrapolate.CLAMP
    );
    return {
      opacity,
    };
  });

  const openModal = () => {
    translateY.value = withSpring(modalHeight - SCREEN_HEIGHT, { damping: 20, stiffness: 150 });
  };

  const closeModal = () => {
    isClosing.value = true;
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: 250 }, (finished) => {
      if (finished) {
        runOnJS(onClose)();
        isClosing.value = false; // Reset for next open
      }
    });
  };

  // Handle pan gesture
  const panGesture = Gesture.Pan()
    .onStart(() => {
      context.value = { y: translateY.value };
    })
    .onUpdate((event) => {
      // Allow dragging only downwards and within limits
      const newTranslate = Math.max(context.value.y + event.translationY, modalHeight - SCREEN_HEIGHT);
      translateY.value = newTranslate;
    })
    .onEnd((event) => {
      // Define velocity and threshold for closing
      const velocity = event.velocityY;
      const threshold = modalHeight * 0.25; // 25% of modal height

      // Close if dragged down enough or if velocity is high enough downwards
      if (velocity > 1000 || translateY.value > (modalHeight - SCREEN_HEIGHT + threshold)) {
        runOnJS(closeModal)();
      } else {
        // Snap back to open position
        translateY.value = withSpring(modalHeight - SCREEN_HEIGHT, { damping: 20, stiffness: 150 });
      }
    });

  // Handle backdrop tap
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(closeModal)();
  });

  useEffect(() => {
    if (visible && selectedDay) {
      openModal();
    } else if (!visible && !isClosing.value) {
      closeModal();
    }
  }, [visible, selectedDay]); // Depend on visible and selectedDay

  if (!selectedDay) return null;

  const dateString = selectedDay.dateObj.toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <>
      <Animated.View
        style={[
          {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)', // bg-black/40 equivalent
          },
          backdropAnimatedStyle,
        ]}
        pointerEvents={visible ? 'auto' : 'none'} // Only receive touches when visible
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
              bottom: -modalHeight, // Start position offset
              backgroundColor: 'white',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 4,
              elevation: 5,
              overflow: 'hidden', // Contain children within rounded corners
            },
            animatedStyles,
          ]}
        >
          {/* Handle Bar */}
          <View className="items-center pt-3 pb-2">
            <View className="w-12 h-1 bg-gray-300 rounded-full" />
          </View>

          {/* Header */}
          <View className="px-4 pb-2 border-b border-gray-200 flex-row justify-between items-center">
            <Text className="text-lg font-bold text-gray-800">{dateString}</Text>
            <TouchableOpacity onPress={closeModal} className="p-2">
              <Text className="text-blue-500 text-lg font-bold">X</Text>
            </TouchableOpacity>
          </View>

          {/* Content */}
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
    </>
  );
}
