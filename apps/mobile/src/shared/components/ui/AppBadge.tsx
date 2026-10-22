import { StyleSheet, Text } from 'react-native';

import { colors, radii, spacing } from '../../theme';

export function AppBadge({ children }: { children: string }) {
  return <Text style={styles.badge}>{children}</Text>;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tealSurface,
    borderRadius: radii.pill,
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
});
