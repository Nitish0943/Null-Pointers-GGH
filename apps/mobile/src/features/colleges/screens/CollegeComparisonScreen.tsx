import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CollegeComparison'>;

type CollegeOption = {
  id: string;
  name: string;
  city: string;
  type: string;
  focus: string;
  environment: string;
  color: string;
  icon: string;
};

const colleges: CollegeOption[] = [
  {
    id: 'northstar',
    name: 'Northstar Institute of Design',
    city: 'Bengaluru',
    type: 'Design school',
    focus: 'Design, interaction, innovation',
    environment: 'Studio mentorship',
    color: '#6366F1',
    icon: '◇',
  },
  {
    id: 'civic-tech',
    name: 'Civic Technology University',
    city: 'Pune',
    type: 'University',
    focus: 'Computing, data, public systems',
    environment: 'Cross-disciplinary',
    color: '#0F766E',
    icon: '◎',
  },
  {
    id: 'horizon',
    name: 'Horizon College of Applied Science',
    city: 'Hyderabad',
    type: 'College',
    focus: 'Technology, analytics, business',
    environment: 'Industry projects',
    color: '#C26A1B',
    icon: '▥',
  },
];

export function CollegeComparisonScreen({ navigation }: Props) {
  const [selectedIds, setSelectedIds] = useState<string[]>([
    colleges[0].id,
    colleges[1].id,
  ]);
  const selectedColleges = useMemo(
    () => colleges.filter((college) => selectedIds.includes(college.id)),
    [selectedIds],
  );

  function toggleCollege(collegeId: string) {
    setSelectedIds((current) => {
      if (current.includes(collegeId)) {
        return current.filter((id) => id !== collegeId);
      }
      if (current.length >= 2) {
        return [current[1], collegeId];
      }
      return [...current, collegeId];
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to college search results"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>MAKE A CLEARER CHOICE</Text>
            <Text style={styles.title}>College comparison</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.description}>
          Select up to two colleges and compare the learning experience side by
          side.
        </Text>

        <View style={styles.hint}>
          <Text style={styles.hintTitle}>
            {selectedIds.length} of 2 selected
          </Text>
          <Text style={styles.hintText}>
            Choose another to replace a selection.
          </Text>
        </View>

        <View style={styles.choices}>
          {colleges.map((college) => {
            const selected = selectedIds.includes(college.id);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                key={college.id}
                onPress={() => toggleCollege(college.id)}
                style={({ pressed }) => [
                  styles.choice,
                  selected && styles.choiceSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.choiceIcon,
                    { backgroundColor: `${college.color}18` },
                  ]}
                >
                  <Text
                    style={[styles.choiceIconText, { color: college.color }]}
                  >
                    {college.icon}
                  </Text>
                </View>
                <View style={styles.choiceCopy}>
                  <Text style={styles.choiceTitle}>{college.name}</Text>
                  <Text style={styles.choiceMeta}>
                    {college.city} · {college.type}
                  </Text>
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

        {selectedColleges.length >= 2 ? (
          <View style={styles.comparisonCard}>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Location</Text>
              {selectedColleges.map((college) => (
                <Text key={college.id} style={styles.rowValue}>
                  {college.city}
                </Text>
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Focus</Text>
              {selectedColleges.map((college) => (
                <Text key={college.id} style={styles.rowValue}>
                  {college.focus}
                </Text>
              ))}
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Learning</Text>
              {selectedColleges.map((college) => (
                <Text key={college.id} style={styles.rowValue}>
                  {college.environment}
                </Text>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Select one more college</Text>
            <Text style={styles.emptyText}>
              Choose two places to compare their learning experience.
            </Text>
          </View>
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check admission eligibility"
          onPress={() =>
            navigation.navigate('AdmissionEligibility', {
              collegeId: selectedColleges[0]?.id ?? colleges[0].id,
            })
          }
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>Check eligibility</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo comparison · Verified college requirements will be connected when
          admissions data is available.
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
  hint: {
    backgroundColor: '#E8F3F2',
    borderRadius: 12,
    marginTop: 20,
    padding: 13,
  },
  hintTitle: { color: '#0F766E', fontSize: 13, fontWeight: '800' },
  hintText: { color: '#376E6A', fontSize: 11, marginTop: 3 },
  choices: { gap: 9, marginTop: 13 },
  choice: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 12,
  },
  choiceSelected: { backgroundColor: '#FCFFFE', borderColor: '#0F766E' },
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
  choiceMeta: { color: '#6B8193', fontSize: 10, marginTop: 4 },
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
  row: { flexDirection: 'row', gap: 8, minHeight: 42 },
  rowLabel: {
    color: '#8DE4D6',
    fontSize: 10,
    fontWeight: '800',
    paddingTop: 2,
    width: 58,
  },
  rowValue: { color: '#FFFFFF', flex: 1, fontSize: 11, lineHeight: 16 },
  divider: { backgroundColor: '#3D5A6B', height: 1, marginVertical: 7 },
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
