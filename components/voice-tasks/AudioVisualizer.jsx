import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const BAR_COUNT = 15;

const AudioVisualizer = ({ mode = 'playback', isActive = false, currentTime = 0, duration = 0 }) => {
  const bars = Array.from({ length: BAR_COUNT }, () => useSharedValue(0.3));

  useEffect(() => {
    if (isActive) {
      // Animate bars continuously
      bars.forEach((bar, index) => {
        const animate = () => {
          bar.value = withRepeat(
            withSequence(
              withTiming(Math.random() * 0.7 + 0.4, { duration: 300 + Math.random() * 200 }),
              withTiming(Math.random() * 0.7 + 0.4, { duration: 300 + Math.random() * 200 })
            ),
            -1,
            true
          );
        };
        setTimeout(animate, index * 100);
      });
    } else {
      // If paused during playback, just stop animation (freeze at current height)
      if (mode === 'playback') {
        bars.forEach((bar) => cancelAnimation(bar));
      }
      // If recording stopped, reset bars to neutral
      if (mode === 'recording') {
        bars.forEach((bar) => {
          cancelAnimation(bar);
          bar.value = withTiming(0.3, { duration: 200 });
        });
      }
    }

    return () => {
      bars.forEach((bar) => cancelAnimation(bar));
    };
  }, [isActive, mode]);

  const progressPercentage = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <View className="bg-white rounded-lg p-4">
      {/* Animated Bars */}
      <View className="flex-row items-end justify-center h-12 mb-4 px-2">
        {bars.map((bar, index) => {
          const animatedStyle = useAnimatedStyle(() => ({
            height: bar.value * 32,
            opacity: bar.value,
          }));
          return (
            <View key={index} className="flex-1 items-center justify-end mx-0.5">
              <Animated.View
                className="bg-emerald-400 rounded-full"
                style={[{ width: 3, borderRadius: 999 }, animatedStyle]}
              />
            </View>
          );
        })}
      </View>

      {/* Progress Bar */}
      {mode === 'playback' && (
        <>
          <View className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <View
              className="h-full bg-emerald-500 rounded-full"
              style={{ width: `${progressPercentage}%` }}
            />
          </View>
          <View className="flex-row justify-between items-center">
            <Text className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              {currentTime}s
            </Text> 
            <Text className="text-sm font-mono text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
              {duration}s
            </Text>
          </View>
        </>
      )}
    </View>
  );
};

export default AudioVisualizer;
