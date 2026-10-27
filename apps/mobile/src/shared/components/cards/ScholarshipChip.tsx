import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../../theme';
import type { ScholarshipRecord } from '../../types/scholarship';

type ScholarshipChipProps = {
  scholarship: ScholarshipRecord;
  onPress: () => void;
};

const ELIGIBILITY_MAX = 80;

function truncateEligibility(text: string): string {
  if (text.length <= ELIGIBILITY_MAX) return text;
  return text.slice(0, ELIGIBILITY_MAX) + '…';
}

export function ScholarshipChip({ scholarship, onPress }: ScholarshipChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open scholarship: ${scholarship.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      {/* Icon */}
      <View style={styles.iconWrapper}>
        <Text style={styles.iconText}>✦</Text>
      </View>

      {/* Text content */}
      <View style={styles.textContent}>
        <Text style={styles.name} numberOfLines={1}>
          {scholarship.name}
        </Text>
        <Text style={styles.eligibility} numberOfLines={2}>
          {truncateEligibility(scholarship.eligibility)}
        </Text>
        <Text style={styles.period} numberOfLines={1}>
          {scholarship.applicationPeriod}
        </Text>
      </View>

      {/* Arrow */}
      <Text style={styles.arrow}>→</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  cardPressed: {
    opacity: 0.75,
  },
  iconWrapper: {
    alignItems: 'center',
    backgroundColor: colors.indigoSurface,
    borderRadius: radii.sm,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  iconText: {
    color: colors.indigo,
    fontSize: 16,
  },
  textContent: {
    flex: 1,
    gap: 2,
  },
  name: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  eligibility: {
    color: colors.bodyText,
    fontSize: 12,
    lineHeight: 17,
  },
  period: {
    color: colors.mutedText,
    fontSize: 11,
  },
  arrow: {
    color: colors.mutedText,
    fontSize: 16,
  },
});
