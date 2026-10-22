import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing } from '../../theme';

export type PrimaryTab =
  'Home' | 'Explore' | 'Roadmap' | 'Applications' | 'Profile';

type Props = {
  activeTab: PrimaryTab;
  onTabPress: (tab: PrimaryTab) => void;
};

const tabs: Array<{ label: string; icon: string; tab: PrimaryTab }> = [
  { tab: 'Home', label: 'Home', icon: '⌂' },
  { tab: 'Explore', label: 'Explore', icon: '◇' },
  { tab: 'Roadmap', label: 'Roadmap', icon: '≋' },
  { tab: 'Applications', label: 'Apply', icon: '▤' },
  { tab: 'Profile', label: 'Profile', icon: '○' },
];

export function BottomNavigation({ activeTab, onTabPress }: Props) {
  return (
    <View style={styles.bar} accessibilityRole="tablist">
      {tabs.map((item) => {
        const active = item.tab === activeTab;
        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            key={item.tab}
            onPress={() => onTabPress(item.tab)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}
          >
            <View style={[styles.iconWrap, active && styles.iconWrapActive]}>
              <Text style={[styles.icon, active && styles.iconActive]}>
                {item.icon}
              </Text>
            </View>
            <Text style={[styles.label, active && styles.labelActive]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingBottom: spacing.sm,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.sm,
  },
  tab: {
    alignItems: 'center',
    flex: 1,
    gap: spacing.xs,
    minHeight: 56,
    paddingHorizontal: spacing.xs,
  },
  iconWrap: {
    alignItems: 'center',
    borderRadius: radii.pill,
    height: 30,
    justifyContent: 'center',
    width: 48,
  },
  iconWrapActive: {
    backgroundColor: colors.tealSurface,
  },
  icon: {
    color: colors.mutedText,
    fontSize: 21,
    lineHeight: 24,
  },
  iconActive: {
    color: colors.secondary,
  },
  label: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '700',
  },
  labelActive: {
    color: colors.secondary,
  },
  pressed: {
    opacity: 0.7,
  },
});
