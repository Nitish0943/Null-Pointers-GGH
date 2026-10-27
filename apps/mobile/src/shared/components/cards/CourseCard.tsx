import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../../theme';
import { cardStyles } from '../../theme/cardStyles';
import type { CourseRecord } from '../../types/course';

type CourseCardProps = {
  course: CourseRecord;
  isSaved: boolean;
  isInBasket: boolean;
  onPress: () => void;
  onSaveToggle: () => void;
  onAddToCompare: () => void;
};

function formatFees(fees: number | null): string {
  if (fees === null) return 'Not specified';
  return `₹${fees.toLocaleString('en-IN')}`;
}

function formatEligibility(eligibility: string | null): string {
  if (!eligibility) return '—';
  if (eligibility.length <= 80) return eligibility;
  return eligibility.slice(0, 80) + '…';
}

export function CourseCard({
  course,
  isInBasket,
  isSaved,
  onAddToCompare,
  onPress,
  onSaveToggle,
}: CourseCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [cardStyles.base, styles.card, pressed && styles.pressed]}
    >
      {/* Main info row */}
      <View style={styles.row}>
        {/* Icon badge */}
        <View style={styles.iconBadge} accessibilityElementsHidden>
          <Text style={styles.iconGlyph}>▣</Text>
        </View>

        {/* Course details */}
        <View style={styles.infoBlock}>
          <Text style={styles.courseName} numberOfLines={2}>
            {course.name}
          </Text>
          <Text style={styles.institutionName} numberOfLines={1}>
            {course.institutionName}
          </Text>

          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Degree</Text>
            <Text style={styles.metaValue}>{course.degree}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>City</Text>
            <Text style={styles.metaValue}>{course.city}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Duration</Text>
            <Text style={styles.metaValue}>{course.duration ?? '—'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Fees</Text>
            <Text style={styles.metaValue}>{formatFees(course.fees)}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Eligibility</Text>
            <Text style={styles.metaValue}>{formatEligibility(course.eligibility)}</Text>
          </View>
        </View>

        {/* Arrow */}
        <View style={styles.arrowContainer} accessibilityElementsHidden>
          <Text style={styles.arrow}>→</Text>
        </View>
      </View>

      {/* Actions row */}
      <View style={styles.actionsRow}>
        <Pressable
          accessibilityLabel={isSaved ? 'Unsave course' : 'Save course'}
          accessibilityRole="button"
          onPress={onSaveToggle}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Text style={styles.bookmarkIcon}>{isSaved ? '🔖' : '🏷️'}</Text>
          <Text style={styles.actionLabel}>{isSaved ? 'Saved' : 'Save'}</Text>
        </Pressable>

        <View style={styles.actionDivider} />

        <Pressable
          accessibilityLabel={isInBasket ? 'Remove from compare' : 'Add to compare'}
          accessibilityRole="button"
          onPress={onAddToCompare}
          style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
        >
          <Text style={[styles.compareLabel, isInBasket && styles.compareLabelActive]}>
            {isInBasket ? '✓ Added' : '+ Compare'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },

  // Main row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },

  // Icon badge
  iconBadge: {
    alignItems: 'center',
    backgroundColor: colors.tealSurface,
    borderRadius: radii.sm,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  iconGlyph: {
    color: colors.secondary,
    fontSize: 20,
  },

  // Info block
  infoBlock: {
    flex: 1,
    gap: spacing.xs,
  },
  courseName: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 21,
  },
  institutionName: {
    color: colors.secondary,
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginBottom: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  metaLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
    minWidth: 64,
  },
  metaValue: {
    color: colors.bodyText,
    flex: 1,
    fontSize: 11,
    lineHeight: 16,
  },

  // Arrow
  arrowContainer: {
    justifyContent: 'center',
    paddingLeft: spacing.xs,
  },
  arrow: {
    color: colors.mutedText,
    fontSize: 16,
  },

  // Actions row
  actionsRow: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  actionButton: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.sm,
  },
  actionDivider: {
    backgroundColor: colors.border,
    height: 16,
    width: 1,
  },
  bookmarkIcon: {
    fontSize: 14,
  },
  actionLabel: {
    color: colors.bodyText,
    fontSize: 12,
    fontWeight: '700',
  },
  compareLabel: {
    color: colors.bodyText,
    fontSize: 12,
    fontWeight: '700',
  },
  compareLabelActive: {
    color: colors.secondary,
  },
});
