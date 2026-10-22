import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseComparison'>;

type CourseOption = {
  id: string;
  title: string;
  provider: string;
  format: string;
  duration: string;
  level: string;
  outcome: string;
  color: string;
  icon: string;
};

const courses: CourseOption[] = [
  {
    id: 'design-thinking',
    title: 'Design Thinking Foundations',
    provider: 'Mantrix Learning Studio',
    format: 'Self-paced',
    duration: '4 weeks',
    level: 'Beginner',
    outcome: 'Prototype a solution around a real human need.',
    color: '#6366F1',
    icon: '◇',
  },
  {
    id: 'data-storytelling',
    title: 'Data and Storytelling',
    provider: 'Open Skills Academy',
    format: 'Live cohort',
    duration: '6 weeks',
    level: 'Beginner',
    outcome: 'Create a clear story from a real dataset.',
    color: '#0F766E',
    icon: '▥',
  },
  {
    id: 'community-projects',
    title: 'Community Project Lab',
    provider: 'Impact Works',
    format: 'Mentored',
    duration: '8 weeks',
    level: 'Intermediate',
    outcome: 'Plan and test a practical community project.',
    color: '#C26A1B',
    icon: '◎',
  },
];

export function CourseComparisonScreen({ navigation }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    courses[0].id,
    courses[1].id,
  ]);
  const selectedCourses = useMemo(
    () => courses.filter((course) => selectedIds.includes(course.id)),
    [selectedIds],
  );

  function toggleCourse(courseId: string) {
    setSelectedIds((current) => {
      if (current.includes(courseId)) {
        return current.filter((id) => id !== courseId);
      }
      if (current.length >= 2) {
        return [current[1], courseId];
      }
      return [...current, courseId];
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to course discovery"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>MAKE A CLEARER CHOICE</Text>
            <Text style={styles.title}>Course comparison</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.description}>
          Choose up to two courses and compare the details that matter to you.
        </Text>

        <View style={styles.selectionHint}>
          <Text style={styles.selectionHintText}>
            {selectedIds.length} of 2 courses selected
          </Text>
          <Text style={styles.selectionHintDetail}>
            Tap a course to replace a selection
          </Text>
        </View>

        <View style={styles.courseChoices}>
          {courses.map((course) => {
            const selected = selectedIds.includes(course.id);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                key={course.id}
                onPress={() => toggleCourse(course.id)}
                style={({ pressed }) => [
                  styles.choice,
                  selected && styles.choiceSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.choiceIcon,
                    { backgroundColor: `${course.color}18` },
                  ]}
                >
                  <Text
                    style={[styles.choiceIconText, { color: course.color }]}
                  >
                    {course.icon}
                  </Text>
                </View>
                <View style={styles.choiceCopy}>
                  <Text style={styles.choiceTitle}>{course.title}</Text>
                  <Text style={styles.choiceProvider}>{course.provider}</Text>
                </View>
                <View
                  style={[styles.checkbox, selected && styles.checkboxSelected]}
                >
                  {selected && <Text style={styles.check}>✓</Text>}
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Side-by-side view</Text>
          <Text style={styles.sectionMeta}>Demo data</Text>
        </View>

        {selectedCourses.length >= 2 ? (
          <View style={styles.comparisonCard}>
            <View style={styles.comparisonRow}>
              <Text style={styles.rowLabel}>Format</Text>
              {selectedCourses.map((course) => (
                <Text key={course.id} style={styles.rowValue}>
                  {course.format}
                </Text>
              ))}
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.comparisonRow}>
              <Text style={styles.rowLabel}>Duration</Text>
              {selectedCourses.map((course) => (
                <Text key={course.id} style={styles.rowValue}>
                  {course.duration}
                </Text>
              ))}
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.comparisonRow}>
              <Text style={styles.rowLabel}>Level</Text>
              {selectedCourses.map((course) => (
                <Text key={course.id} style={styles.rowValue}>
                  {course.level}
                </Text>
              ))}
            </View>
            <View style={styles.rowDivider} />
            <View style={styles.comparisonRow}>
              <Text style={styles.rowLabel}>Outcome</Text>
              {selectedCourses.map((course) => (
                <Text key={course.id} style={styles.rowValue}>
                  {course.outcome}
                </Text>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Select one more course</Text>
            <Text style={styles.emptyText}>
              Choose two courses to see a useful side-by-side view.
            </Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Find colleges for these courses"
          onPress={() => navigation.navigate('CollegeFinder')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>Find colleges</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo comparison · Course outcomes and college matches will use
          connected education data when available.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7FAFC', flex: 1 },
  container: { padding: 20, paddingBottom: 32 },
  header: { alignItems: 'center', flexDirection: 'row', minHeight: 48 },
  backButton: { padding: 8 },
  backArrow: { color: '#17324D', fontSize: 27 },
  headerCopy: { flex: 1, marginLeft: 8 },
  headerSpacer: { width: 43 },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { color: '#17324D', fontSize: 27, fontWeight: '800', marginTop: 5 },
  description: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 20,
  },
  selectionHint: {
    backgroundColor: '#E8F3F2',
    borderRadius: 12,
    marginTop: 20,
    padding: 13,
  },
  selectionHintText: { color: '#0F766E', fontSize: 13, fontWeight: '800' },
  selectionHintDetail: { color: '#376E6A', fontSize: 11, marginTop: 3 },
  courseChoices: { gap: 9, marginTop: 13 },
  choice: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 12,
  },
  choiceSelected: { borderColor: '#0F766E', backgroundColor: '#FCFFFE' },
  choiceIcon: {
    alignItems: 'center',
    borderRadius: 10,
    height: 42,
    justifyContent: 'center',
    marginRight: 11,
    width: 42,
  },
  choiceIconText: { fontSize: 19, fontWeight: '800' },
  choiceCopy: { flex: 1 },
  choiceTitle: { color: '#17324D', fontSize: 13, fontWeight: '800' },
  choiceProvider: { color: '#6B8193', fontSize: 10, marginTop: 4 },
  checkbox: {
    alignItems: 'center',
    borderColor: '#AABBC6',
    borderRadius: 6,
    borderWidth: 2,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxSelected: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  check: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  sectionTitle: { color: '#17324D', fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: '#7B8D9B', fontSize: 10, fontWeight: '700' },
  comparisonCard: {
    backgroundColor: '#17324D',
    borderRadius: 15,
    marginTop: 13,
    padding: 16,
  },
  comparisonRow: { flexDirection: 'row', gap: 8, minHeight: 42 },
  rowLabel: {
    color: '#8DE4D6',
    fontSize: 10,
    fontWeight: '800',
    paddingTop: 2,
    width: 54,
  },
  rowValue: { color: '#FFFFFF', flex: 1, fontSize: 11, lineHeight: 16 },
  rowDivider: { backgroundColor: '#3D5A6B', height: 1, marginVertical: 7 },
  empty: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 13,
    padding: 24,
  },
  emptyTitle: { color: '#17324D', fontSize: 15, fontWeight: '800' },
  emptyText: {
    color: '#6B8193',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 56,
  },
  pressed: { opacity: 0.78 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  arrow: { color: '#5EEAD4', fontSize: 22, marginLeft: 12 },
  demoNote: {
    color: '#7B8D9B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 13,
    textAlign: 'center',
  },
});
