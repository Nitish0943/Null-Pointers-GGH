import { StyleSheet, Text, View } from 'react-native';

import { IconButton } from '../ui/IconButton';
import { colors, spacing } from '../../theme';

type Props = {
  title: string;
  eyebrow?: string;
  onBack?: () => void;
  right?: React.ReactNode;
};

export function ScreenHeader({ eyebrow, onBack, right, title }: Props) {
  return (
    <View style={styles.container}>
      {onBack ? <IconButton icon="←" label="Go back" onPress={onBack} /> : null}
      <View style={styles.copy}>
        {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    minHeight: 48,
  },
  copy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: spacing.xs,
  },
});
