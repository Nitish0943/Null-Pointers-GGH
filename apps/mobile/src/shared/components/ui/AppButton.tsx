import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radii, spacing } from '../../theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: 'primary' | 'secondary' | 'text';
  accessibilityLabel?: string;
};

export function AppButton({
  accessibilityLabel,
  disabled = false,
  label,
  loading = false,
  onPress,
  variant = 'primary',
}: Props) {
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ busy: loading, disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
      ]}
    >
      <Text style={[styles.label, variant === 'text' && styles.textLabel]}>
        {loading ? 'Please wait…' : label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    borderRadius: radii.md,
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.tealSurface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  text: {
    paddingHorizontal: spacing.sm,
  },
  label: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  textLabel: {
    color: colors.secondary,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.8,
  },
});
