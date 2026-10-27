import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

type LoadingSkeletonProps = {
  rows?: number;
};

export function LoadingSkeleton({ rows = 5 }: LoadingSkeletonProps) {
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1.0,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => {
      animation.stop();
    };
  }, [opacity]);

  return (
    <View>
      {Array.from({ length: rows }, (_, index) => (
        <Animated.View
          key={index}
          style={{
            height: 96,
            borderRadius: 14,
            backgroundColor: '#E8F3F2',
            marginBottom: 10,
            opacity,
          }}
        />
      ))}
    </View>
  );
}
