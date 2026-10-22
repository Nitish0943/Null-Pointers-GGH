import { StyleSheet, View } from 'react-native';

import { colors, radii } from '../../theme';

export function AppProgressBar({ value }: { value: number }) {
  const boundedValue = Math.max(0, Math.min(1, value));
  return (
    <View accessibilityRole="progressbar" style={styles.track}>
      <View style={[styles.fill, { width: `${boundedValue * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    backgroundColor: colors.border,
    borderRadius: radii.pill,
    height: 8,
    overflow: 'hidden',
    width: '100%',
  },
  fill: {
    backgroundColor: colors.secondary,
    borderRadius: radii.pill,
    height: '100%',
  },
});
