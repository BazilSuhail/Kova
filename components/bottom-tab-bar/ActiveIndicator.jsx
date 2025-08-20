// ActiveIndicator.js
import { useColorScheme } from 'nativewind';
import React, { useEffect, useRef } from "react";
import { Animated } from "react-native";

const ActiveIndicator = ({ isActive }) => {
  const { colorScheme } = useColorScheme();
  const widthAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.spring(widthAnim, {
        toValue: 60,
        useNativeDriver: false,
        damping: 13,
        stiffness: 120,
      }).start();
    } else {
      Animated.timing(widthAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }).start();
    }
  }, [isActive]);

  if (!isActive) return null;

  return (
    <Animated.View
      style={{
        position: "absolute",
        top: 3,
        left: "50%",
        transform: [
          {
            translateX: widthAnim.interpolate({
              inputRange: [0, 60],
              outputRange: [0, -30],
            }),
          },
        ],
        width: widthAnim,
        height: 34,
        backgroundColor: colorScheme === 'dark' ? '#10b981' : '#d1fae5', // emerald-400 / emerald-500
        borderRadius: 20,
      }}
    />
  );
};

export default ActiveIndicator;