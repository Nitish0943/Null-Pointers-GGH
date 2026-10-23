import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';
import catalog from '../data/college-catalog.json';

type Props = NativeStackScreenProps<RootStackParamList, 'CollegeDetails'>;

type CollegeDetails = {
  name: string;
  city: string;
  type: string;
  color: string;
  icon: string;
  highlight: string;
  courses: string[];
  learning: string;
  environment: string;
  firstStep: string;
};

const colleges: Record<string, CollegeDetails> = {
  northstar: {
    name: 'Northstar Institute of Design',
    city: 'Bengaluru',
    type: 'Design school',
    color: '#6366F1',
    icon: '◇',
    highlight: 'Project-led learning and studio mentorship.',
    courses: ['Product design', 'Interaction design', 'Innovation'],
    learning:
      'Learn through studio briefs, critique, and projects that connect design decisions to people’s real needs.',
    environment:
      'A collaborative studio environment with regular feedback from mentors and peers.',
    firstStep:
      'Explore one student project and note the questions it helps answer.',
  },
  'civic-tech': {
    name: 'Civic Technology University',
    city: 'Pune',
    type: 'University',
    color: '#0F766E',
    icon: '◎',
    highlight: 'Technology pathways with community impact.',
    courses: ['Computing', 'Data science', 'Public systems'],
    learning:
      'Connect technical foundations with projects that improve how communities access services and information.',
    environment:
      'A cross-disciplinary campus where technology, policy, and community work meet.',
    firstStep:
      'Find one local problem that could be improved with better information.',
  },
  horizon: {
    name: 'Horizon College of Applied Science',
    city: 'Hyderabad',
    type: 'College',
    color: '#C26A1B',
    icon: '▥',
    highlight: 'Hands-on learning with industry projects.',
    courses: ['Technology', 'Analytics', 'Business'],
    learning:
      'Build practical fluency through applied assignments, labs, and projects with real-world context.',
    environment:
      'An applied learning community with opportunities to work in teams and present outcomes.',
    firstStep:
      'Compare two projects from the subject area you are most curious about.',
  },
};

export function CollegeDetailsScreen({ navigation, route }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const catalogCollege = catalog.find(
    (item) => item.id === route.params.collegeId,
  );
  const college =
    (catalogCollege && {
      name: catalogCollege.name,
      city: catalogCollege.city,
      type: catalogCollege.type,
      color: '#0F766E',
      icon: '◎',
      highlight: `${catalogCollege.management} institution affiliated with ${catalogCollege.affiliation}.`,
      courses: catalogCollege.courses,
      learning: `Explore ${catalogCollege.courses.join(', ')} through the programmes offered by this institution.`,
      environment: `${catalogCollege.management} college in ${catalogCollege.city}, Chhattisgarh.`,
      firstStep:
        'Verify current courses, admission requirements, fees, and affiliation with the official institution.',
    }) ??
    colleges[route.params.collegeId] ??
    colleges.northstar;

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
          <Text style={styles.headerTitle}>College details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View
            style={[styles.heroIcon, { backgroundColor: `${college.color}18` }]}
          >
            <Text style={[styles.heroIconText, { color: college.color }]}>
              {college.icon}
            </Text>
          </View>
          <Text style={styles.eyebrow}>{college.type.toUpperCase()}</Text>
          <Text style={styles.title}>{college.name}</Text>
          <Text style={styles.location}>{college.city} · India</Text>
          <Text style={styles.highlight}>{college.highlight}</Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoEyebrow}>WHY EXPLORE THIS PLACE</Text>
          <Text style={styles.infoText}>{college.learning}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Areas of study</Text>
          <Text style={styles.sectionMeta}>{college.courses.length} areas</Text>
        </View>
        <View style={styles.courseList}>
          {college.courses.map((course, index) => (
            <View key={course} style={styles.courseRow}>
              <View style={styles.courseNumber}>
                <Text style={styles.courseNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.courseText}>{course}</Text>
              <Text style={styles.courseArrow}>›</Text>
            </View>
          ))}
        </View>

        <View style={styles.environmentCard}>
          <Text style={styles.environmentEyebrow}>CAMPUS FEEL</Text>
          <Text style={styles.environmentTitle}>A place to keep learning.</Text>
          <Text style={styles.environmentText}>{college.environment}</Text>
        </View>

        <View style={styles.firstStepCard}>
          <Text style={styles.firstStepEyebrow}>YOUR FIRST STEP</Text>
          <Text style={styles.firstStepTitle}>Explore before you apply.</Text>
          <Text style={styles.firstStepText}>{college.firstStep}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove saved college' : 'Save college'}
          onPress={() => setIsSaved((saved) => !saved)}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>
            {isSaved ? 'Saved to my colleges' : 'Save to my colleges'}
          </Text>
          <Text style={styles.arrow}>{isSaved ? '✓' : '+'}</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Check admission eligibility"
          onPress={() =>
            navigation.navigate('AdmissionEligibility', {
              collegeId: route.params.collegeId,
            })
          }
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.secondaryText}>Check admission eligibility</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo college profile · Admissions, fees, and verified programme data
          will be connected in a later batch.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7FAFC', flex: 1 },
  container: { padding: 20, paddingBottom: 32 },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  backButton: { padding: 8 },
  backArrow: { color: '#17324D', fontSize: 27 },
  headerTitle: { color: '#17324D', fontSize: 17, fontWeight: '800' },
  headerSpacer: { width: 43 },
  hero: { alignItems: 'center', marginTop: 24 },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 39,
    height: 78,
    justifyContent: 'center',
    width: 78,
  },
  heroIconText: { fontSize: 30, fontWeight: '800' },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 18,
  },
  title: {
    color: '#17324D',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 35,
    marginTop: 10,
    textAlign: 'center',
  },
  location: { color: '#6366F1', fontSize: 12, fontWeight: '700', marginTop: 7 },
  highlight: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#17324D',
    borderRadius: 16,
    marginTop: 24,
    padding: 18,
  },
  infoEyebrow: {
    color: '#8DE4D6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  infoText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 9,
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 27,
  },
  sectionTitle: { color: '#17324D', fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: '#7B8D9B', fontSize: 10, fontWeight: '700' },
  courseList: { gap: 9, marginTop: 13 },
  courseRow: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  courseNumber: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderRadius: 9,
    height: 30,
    justifyContent: 'center',
    marginRight: 11,
    width: 30,
  },
  courseNumberText: { color: '#0F766E', fontSize: 11, fontWeight: '800' },
  courseText: { color: '#17324D', flex: 1, fontSize: 13, fontWeight: '700' },
  courseArrow: { color: '#7B8D9B', fontSize: 22 },
  environmentCard: {
    backgroundColor: '#EEF0FF',
    borderColor: '#D9DBFF',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 22,
    padding: 17,
  },
  environmentEyebrow: {
    color: '#6366F1',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  environmentTitle: {
    color: '#17324D',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  environmentText: {
    color: '#5D7182',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
  },
  firstStepCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 16,
    padding: 17,
  },
  firstStepEyebrow: {
    color: '#C26A1B',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  firstStepTitle: {
    color: '#17324D',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  firstStepText: {
    color: '#6B8193',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 6,
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
  secondaryButton: { alignItems: 'center', padding: 14 },
  secondaryText: { color: '#0F766E', fontSize: 13, fontWeight: '800' },
  demoNote: {
    color: '#7B8D9B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 13,
    textAlign: 'center',
  },
});
