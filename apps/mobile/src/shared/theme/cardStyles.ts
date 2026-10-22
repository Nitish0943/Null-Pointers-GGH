import { StyleSheet } from 'react-native';

import { colors, radii, spacing } from './index';

export const cardStyles = StyleSheet.create({
  base: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
});
