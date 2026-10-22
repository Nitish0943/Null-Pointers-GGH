import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../../theme';

type Props = {
  checked: boolean;
  label: string;
  onPress: () => void;
};

export function AppCheckbox({ checked, label, onPress }: Props) {
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      onPress={onPress}
      style={styles.row}
    >
      <View style={[styles.box, checked && styles.checked]}>
        {checked ? <Text style={styles.tick}>✓</Text> : null}
      </View>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  box: {
    alignItems: 'center',
    borderColor: colors.border,
    borderRadius: radii.sm,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    width: 24,
  },
  checked: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  tick: {
    color: colors.surface,
    fontWeight: '800',
  },
  label: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});
