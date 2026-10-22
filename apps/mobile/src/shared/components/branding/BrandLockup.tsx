import { StyleSheet, Text, View } from 'react-native';

import { colors } from '../../theme';

export function BrandLockup() {
  return (
    <View style={styles.lockup} accessible accessibilityLabel="Mantrix">
      <View style={styles.mark} accessibilityElementsHidden>
        <View style={styles.bar} />
        <View style={[styles.bar, styles.accent]} />
      </View>
      <Text style={styles.brand}>Mantrix</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  mark: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
    height: 19,
    marginRight: 8,
    width: 22,
  },
  bar: {
    backgroundColor: colors.primary,
    borderRadius: 2,
    height: 16,
    transform: [{ rotate: '-18deg' }],
    width: 7,
  },
  accent: {
    backgroundColor: colors.secondary,
    height: 19,
    transform: [{ rotate: '18deg' }],
  },
  brand: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
