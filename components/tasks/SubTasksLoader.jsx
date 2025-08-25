import { useEffect, useRef } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const ModernAILoader = () => {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0.3)).current;
  const shimmerAnim = useRef(new Animated.Value(-200)).current;

  useEffect(() => {
    // Rotation animation
    const rotationAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    );

    // Scale pulse animation
    const scaleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.1,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    );

    // Fade pulse animation
    const fadeAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    );

    // Shimmer animation
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: width + 200,
        duration: 2000,
        useNativeDriver: true,
      })
    );

    rotationAnimation.start();
    scaleAnimation.start();
    fadeAnimation.start();
    shimmerAnimation.start();

    return () => {
      rotationAnimation.stop();
      scaleAnimation.stop();
      fadeAnimation.stop();
      shimmerAnimation.stop();
    };
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View className="items-center py-8 px-6">
      {/* Main loader container with gradient background */}
      <View className="relative mb-6">
        {/* Outer glow ring */}
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
            opacity: fadeAnim,
          }}
          className="absolute w-24 h-24 -top-4 -left-4"
        >
          <LinearGradient
            colors={['#10B981', '#059669', '#047857']}
            style={{
              width: 96,
              height: 96,
              borderRadius: 48,
              opacity: 0.3,
            }}
          />
        </Animated.View>

        {/* Main icon container */}
        <View className="w-16 h-16 overflow-hidden rounded-full">
          <LinearGradient
            colors={['#ECFDF5', '#D1FAE5', '#A7F3D0']}
            style={{
              width: 64,
              height: 64,
              borderRadius: 32,
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
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
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.6)', 'transparent']}
                style={{
                  width: 100,
                  height: 64,
                }}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              />
            </Animated.View>

            {/* Rotating AI icon */}
            <Animated.View
              style={{
                transform: [{ rotate: rotation }],
              }}
            >
              <MaterialIcons name="auto-awesome" size={28} color="#059669" />
            </Animated.View>
          </LinearGradient>
        </View>

        {/* Floating particles */}
        <Animated.View
          style={{
            position: 'absolute',
            top: -2,
            right: -2,
            opacity: fadeAnim,
            transform: [{ rotate: rotation }],
          }}
        >
          <View className="w-3 h-3 bg-emerald-400 rounded-full opacity-60" />
        </Animated.View>

        <Animated.View
          style={{
            position: 'absolute',
            bottom: -2,
            left: -2,
            opacity: fadeAnim,
            transform: [{ rotate: rotation }],
          }}
        >
          <View className="w-2 h-2 bg-emerald-500 rounded-full opacity-80" />
        </Animated.View>
      </View>

      {/* Text content with gradient */}
      <View className="items-center space-y-3 max-w-sm">
        <View className="overflow-hidden rounded-lg">
          <Text className="text-xl font-bold text-center mb-1">
            <LinearGradient
              colors={['#059669', '#047857', '#064E3B']}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 4,
                borderRadius: 8,
              }}
            >
              <Text className="text-white font-bold text-xl">
                AI Magic in Progress
              </Text>
            </LinearGradient>
          </Text>
        </View>

        <Text className="text-gray-600 dark:text-gray-300 text-center text-base leading-6">
          Analyzing your task to generate actionable steps with intelligent precision
        </Text>

        {/* Progress indicator dots */}
        <View className="flex-row items-center space-x-2 mt-4">
          {[0, 1, 2].map((index) => (
            <Animated.View
              key={index}
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    scale: scaleAnim.interpolate({
                      inputRange: [1, 1.1],
                      outputRange: [0.8, 1.2],
                    }),
                  },
                ],
              }}
            >
              <LinearGradient
                colors={['#10B981', '#059669']}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  marginHorizontal: 4,
                }}
              />
            </Animated.View>
          ))}
        </View>
      </View>
    </View>
  );
};

export default ModernAILoader;