import { StyleSheet, Text, type TextProps } from 'react-native';

import { colors, typography } from '../../theme';

type Variant = 'body' | 'caption' | 'eyebrow' | 'heading' | 'title';

type Props = TextProps & {
  variant?: Variant;
  muted?: boolean;
};

export function AppText({
  muted = false,
  style,
  variant = 'body',
  ...props
}: Props) {
  return (
    <Text
      {...props}
      style={[styles.base, typography[variant], muted && styles.muted, style]}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    color: colors.text,
  },
  muted: {
    color: colors.bodyText,
  },
});
