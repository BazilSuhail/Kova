import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

const RecordingAnimation = ({ isRecording, size = 96 }) => {
  const circle1 = useRef(new Animated.Value(0)).current;
  const circle2 = useRef(new Animated.Value(0)).current;
  const circle3 = useRef(new Animated.Value(0)).current;
  const opacity1 = useRef(new Animated.Value(0)).current;
  const opacity2 = useRef(new Animated.Value(0)).current;
  const opacity3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isRecording) {
      // Start the pulse animations with staggered timing
      const createPulseAnimation = (scaleValue, opacityValue, delay = 0) => {
        return Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.parallel([
              Animated.timing(scaleValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(opacityValue, {
                toValue: 0.3,
                duration: 300,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
            Animated.parallel([
              Animated.timing(scaleValue, {
                toValue: 2.5,
                duration: 1200,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
              Animated.timing(opacityValue, {
                toValue: 0,
                duration: 1200,
                easing: Easing.out(Easing.quad),
                useNativeDriver: true,
              }),
            ]),
          ]),
          { iterations: -1 }
        );
      };

      // Start animations with different delays for staggered effect
      createPulseAnimation(circle1, opacity1, 0).start();
      createPulseAnimation(circle2, opacity2, 500).start();
      createPulseAnimation(circle3, opacity3, 1000).start();
    } else {
      // Stop and reset all animations
      circle1.stopAnimation();
      circle2.stopAnimation();
      circle3.stopAnimation();
      opacity1.stopAnimation();
      opacity2.stopAnimation();
      opacity3.stopAnimation();

      // Reset values
      circle1.setValue(0);
      circle2.setValue(0);
      circle3.setValue(0);
      opacity1.setValue(0);
      opacity2.setValue(0);
      opacity3.setValue(0);
    }
  }, [isRecording]);

  if (!isRecording) return null;

  return (
    <View 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
      }}
      pointerEvents="none"
    >
      {/* Circle 1 */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#10b981',
          opacity: opacity1,
          transform: [{ scale: circle1 }],
        }}
      />
      
      {/* Circle 2 */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#059669',
          opacity: opacity2,
          transform: [{ scale: circle2 }],
        }}
      />
      
      {/* Circle 3 */}
      <Animated.View
        style={{
          position: 'absolute',
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#047857',
          opacity: opacity3,
          transform: [{ scale: circle3 }],
        }}
      />
    </View>
  );
};

export default RecordingAnimation;