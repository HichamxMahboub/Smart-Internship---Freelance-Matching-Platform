import React, { useEffect, useRef } from 'react';
import { Animated, Platform, ViewStyle } from 'react-native';

const nativeDriver = Platform.OS !== 'web';

export function AnimatedEntrance({ children, delay = 0, style }: { children: React.ReactNode; delay?: number; style?: ViewStyle }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 420, delay, useNativeDriver: nativeDriver }),
      Animated.spring(translateY, { toValue: 0, delay, friction: 8, tension: 55, useNativeDriver: nativeDriver })
    ]).start();
  }, [delay, opacity, translateY]);

  return <Animated.View style={[style, { opacity, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
