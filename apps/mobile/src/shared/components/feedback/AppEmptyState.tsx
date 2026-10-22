import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing } from '../../theme';

export function AppEmptyState({
  description,
  title,
}: {
  title: string;
  description: string;
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  title: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  description: {
    color: colors.bodyText,
    fontSize: 13,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
