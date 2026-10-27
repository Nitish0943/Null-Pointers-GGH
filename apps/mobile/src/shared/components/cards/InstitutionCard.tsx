import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '../../theme';
import type { InstitutionRecord } from '../../types/institution';

type InstitutionCardProps = {
  institution: InstitutionRecord;
  courseCount: number;
  onPress: () => void;
};

export function InstitutionCard({
  institution,
  courseCount,
  onPress,
}: InstitutionCardProps) {
  const courseLabel = `${courseCount} course${courseCount !== 1 ? 's' : ''}`;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`View ${institution.name}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.row}>
        {/* Icon badge */}
        <View style={styles.iconBadge}>
          <Text style={styles.iconText}>◎</Text>
        </View>

        {/* Main content */}
        <View style={styles.content}>
          <Text style={styles.name} numberOfLines={2}>
            {institution.name}
          </Text>
          <Text style={styles.meta}>
            {institution.city} · {institution.management}
          </Text>
          {institution.affiliation !== null && (
            <Text style={styles.affiliation} numberOfLines={1}>
              {institution.affiliation}
            </Text>
          )}
          <View style={styles.courseBadge}>
            <Text style={styles.courseBadgeText}>{courseLabel}</Text>
          </View>
        </View>

        {/* Arrow */}
        <Text style={styles.arrow}>→</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    padding: spacing.lg,
  },
  pressed: {
    opacity: 0.75,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md,
  },
  iconBadge: {
    alignItems: 'center',
    backgroundColor: colors.tealSurface,
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  iconText: {
    color: colors.secondary,
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    flex: 1,
    gap: spacing.xs,
  },
  name: {
    color: colors.text,
    fontSize: typography.body.fontSize,
    fontWeight: '700',
    lineHeight: 21,
  },
  meta: {
    color: colors.secondary,
    fontSize: typography.caption.fontSize,
    fontWeight: '600',
    lineHeight: typography.caption.lineHeight,
  },
  affiliation: {
    color: colors.mutedText,
    fontSize: typography.caption.fontSize,
    lineHeight: typography.caption.lineHeight,
  },
  courseBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.tealSurface,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  courseBadgeText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  arrow: {
    color: colors.mutedText,
    fontSize: 18,
    fontWeight: '600',
  },
});
