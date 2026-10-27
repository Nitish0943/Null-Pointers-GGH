import React from 'react';
import { Pressable, Text } from 'react-native';

type ComparisonBadgeProps = {
  count: number;
  onPress: () => void;
};

export function ComparisonBadge({ count, onPress }: ComparisonBadgeProps) {
  if (count < 2) {
    return null;
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Compare ${count} courses`}
      style={{ padding: 8 }}
    >
      <Text style={{ color: '#0F766E', fontSize: 11, fontWeight: '800' }}>
        Compare ({count})
      </Text>
    </Pressable>
  );
}
