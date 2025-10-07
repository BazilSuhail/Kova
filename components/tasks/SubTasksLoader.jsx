import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, Text, View } from 'react-native';

const { width } = Dimensions.get('window');

const ModernAILoader = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const shimmerAnim = useRef(new Animated.Value(-200)).current;
  const floatAnim1 = useRef(new Animated.Value(0)).current;
  const floatAnim2 = useRef(new Animated.Value(0)).current;
  const floatAnim3 = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Rotation animation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Scale pulse animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.15,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Fade pulse animation
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: width + 200,
        duration: 2500,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    // Floating particles animation
    const floatAnimation1 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim1, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim1, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation2 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim2, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim2, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    const floatAnimation3 = Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim3, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim3, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Main pulse animation
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    rotationAnimation.start();
    scaleAnimation.start();
    fadeAnimation.start();
    shimmerAnimation.start();
    floatAnimation1.start();
    floatAnimation2.start();
    floatAnimation3.start();
    pulseAnimation.start();

    return () => {
      rotationAnimation.stop();
      scaleAnimation.stop();
      fadeAnimation.stop();
      shimmerAnimation.stop();
      floatAnimation1.stop();
      floatAnimation2.stop();
      floatAnimation3.stop();
      pulseAnimation.stop();
    };
  }, []);

  // Interpolations
  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const dotScale = scaleAnim.interpolate({
    inputRange: [1, 1.15],
    outputRange: [0.8, 1.2],
  });

  const float1 = floatAnim1.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -15],
  });

  const float2 = floatAnim2.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 12],
  });

  const float3 = floatAnim3.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  return (
    <View className="items-center rounded-2xl pb-8 pt-16 px-5 dark:bg-emerald-800/20 border-[1.5px] dark:border-emerald-700/50 border-emerald-200/70">
      {/* Main loader container with enhanced animations */}
      <Animated.View
        style={{ transform: [{ scale: pulseAnim }] }}
        className="relative mb-6"
      >
        {/* Outer glow ring with enhanced animation */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }}
          className="absolute w-28 h-28 -top-7 -left-7 bg-gradient-to-br from-emerald-500 via-emerald-600 to-emerald-700 rounded-full opacity-25"
        />

        {/* Main icon container with shimmer effect */}
        <View className="w-18 h-18 overflow-hidden rounded-full shadow-lg">
          <View
            className="w-18 h-18 bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-200 rounded-full items-center justify-center"
            style={{
              elevation: 5,
              shadowColor: '#059669',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
            }}
          >
            {/* Shimmer overlay */}
            <Animated.View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                transform: [{ translateX: shimmerAnim }],
              }}
            >
              <View
                className="bg-gradient-to-r from-transparent via-white to-transparent"
                style={{
                  width: 100,
                  height: 72,
                  opacity: 0.8,
                }}
              />
            </Animated.View>

            {/* Rotating AI icon with enhanced size */}
            <Animated.View
              style={{
                transform: [{ rotate: rotation }],
              }}
            >
              <MaterialIcons name="auto-awesome" size={32} color="#059669" />
            </Animated.View>
          </View>
        </View>

        {/* Floating particles with individual animations */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            opacity: fadeAnim,
            transform: [
              { rotate: rotation },
              { translateY: float1 }
            ],
          }}
        >
          <View className="w-3.5 h-3.5 bg-emerald-400 rounded-full opacity-70" />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: -4,
            left: -4,
            opacity: fadeAnim,
            transform: [
              { rotate: rotation },
              { translateY: float2 }
            ],
          }}
        >
          <View className="w-2.5 h-2.5 bg-emerald-500 rounded-full opacity-85" />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            top: 8,
            left: -8,
            opacity: fadeAnim,
            transform: [
              { rotate: rotation },
              { translateY: float3 }
            ],
          }}
        >
          <View className="w-2 h-2 bg-emerald-300 rounded-full opacity-90" />
        </Animated.View>
      </Animated.View>

      {/* Text content with professional styling */}
      <View className="items-center max-w-xs mt-5" style={{ gap: 6 }}>
        <View className="my-2 rounded-lg overflow-hidden bg-gradient-to-r from-emerald-600 to-emerald-900 px-4 py-[5px]">
          <Text className="text-white font-[700] text-sm tracking-wide">
            AI Magic in Progress
          </Text>
        </View>

        <Text className="text-gray-600 dark:text-gray-300 text-center text-[12px] w-[190px] leading-5 font-[400]">
          Analyzing task details to generate optimized steps
        </Text>

        {/* Enhanced progress indicator dots with individual animations */}
        <View className="flex-row items-center mt-5" style={{ gap: 8 }}>
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnim,
                transform: [{ scale: dotScale }],
              }}
            >
              <View className="w-2 h-2 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ModernAILoader;
