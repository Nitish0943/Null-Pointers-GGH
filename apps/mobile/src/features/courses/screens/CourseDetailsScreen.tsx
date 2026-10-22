import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDetails'>;

type CourseDetails = {
  title: string;
  provider: string;
  mode: string;
  duration: string;
  category: string;
  color: string;
  icon: string;
  summary: string;
  outcome: string;
  modules: string[];
  firstStep: string;
};

const detailsByCourse: Record<string, CourseDetails> = {
  'design-thinking': {
    title: 'Design Thinking Foundations',
    provider: 'Mantrix Learning Studio',
    mode: 'Self-paced',
    duration: '4 weeks',
    category: 'Design',
    color: '#6366F1',
    icon: '◇',
    summary: 'Learn to turn human needs into thoughtful solutions.',
    outcome: 'Build a simple prototype and explain the thinking behind it.',
    modules: [
      'Understand people',
      'Frame a useful problem',
      'Prototype ideas',
      'Learn from feedback',
    ],
    firstStep:
      'Write down one everyday frustration you would like to make easier.',
  },
  'data-storytelling': {
    title: 'Data and Storytelling',
    provider: 'Open Skills Academy',
    mode: 'Live cohort',
    duration: '6 weeks',
    category: 'Technology',
    color: '#0F766E',
    icon: '▥',
    summary: 'Find patterns and communicate insights with clarity.',
    outcome: 'Create a short, evidence-based story from a real dataset.',
    modules: [
      'Ask better questions',
      'Read patterns',
      'Choose a clear visual',
      'Tell the story',
    ],
    firstStep:
      'Find a small public dataset and list three questions it could answer.',
  },
  'community-projects': {
    title: 'Community Project Lab',
    provider: 'Impact Works',
    mode: 'Mentored',
    duration: '8 weeks',
    category: 'Impact',
    color: '#C26A1B',
    icon: '◎',
    summary: 'Design and test a small project for your community.',
    outcome: 'Plan and test a practical idea with the people it serves.',
    modules: [
      'Listen deeply',
      'Map a community need',
      'Plan a small experiment',
      'Reflect and improve',
    ],
    firstStep:
      'Speak with three people about a challenge your community shares.',
  },
  'coding-starter': {
    title: 'Build with Code',
    provider: 'Future Builders',
    mode: 'Self-paced',
    duration: '5 weeks',
    category: 'Technology',
    color: '#17324D',
    icon: '</>',
    summary: 'Create your first useful tool through guided practice.',
    outcome: 'Ship a small working project and understand how it was built.',
    modules: [
      'Think in steps',
      'Build an interface',
      'Connect the pieces',
      'Share your project',
    ],
    firstStep:
      'Choose one repeated task and imagine a tiny tool that could simplify it.',
  },
};

export function CourseDetailsScreen({ navigation, route }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const course =
    detailsByCourse[route.params.courseId] ??
    detailsByCourse['design-thinking'];

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
          <Text style={styles.headerTitle}>Course details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View
            style={[styles.heroIcon, { backgroundColor: `${course.color}18` }]}
          >
            <Text style={[styles.heroIconText, { color: course.color }]}>
              {course.icon}
            </Text>
          </View>
          <Text style={styles.eyebrow}>{course.category.toUpperCase()}</Text>
          <Text style={styles.title}>{course.title}</Text>
          <Text style={styles.provider}>{course.provider}</Text>
          <Text style={styles.summary}>{course.summary}</Text>
        </View>

        <View style={styles.metaCard}>
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{course.mode}</Text>
            <Text style={styles.metaLabel}>format</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>{course.duration}</Text>
            <Text style={styles.metaLabel}>duration</Text>
          </View>
          <View style={styles.metaDivider} />
          <View style={styles.metaItem}>
            <Text style={styles.metaValue}>Beginner</Text>
            <Text style={styles.metaLabel}>level</Text>
          </View>
        </View>

        <View style={styles.outcomeCard}>
          <Text style={styles.outcomeEyebrow}>WHAT YOU’LL MAKE</Text>
          <Text style={styles.outcomeText}>{course.outcome}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Course pathway</Text>
          <Text style={styles.sectionMeta}>
            {course.modules.length} modules
          </Text>
        </View>
        <View style={styles.modules}>
          {course.modules.map((module, index) => (
            <View key={module} style={styles.module}>
              <View style={styles.moduleNumber}>
                <Text style={styles.moduleNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.moduleText}>{module}</Text>
              <Text style={styles.moduleArrow}>›</Text>
            </View>
          ))}
        </View>

        <View style={styles.firstStepCard}>
          <Text style={styles.firstStepEyebrow}>START HERE</Text>
          <Text style={styles.firstStepTitle}>A small first step.</Text>
          <Text style={styles.firstStepText}>{course.firstStep}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove saved course' : 'Save course'}
          onPress={() => setIsSaved((saved) => !saved)}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>
            {isSaved ? 'Saved to my learning' : 'Save to my learning'}
          </Text>
          <Text style={styles.arrow}>{isSaved ? '✓' : '+'}</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo course profile · Enrollment, fees, and provider availability will
          be connected in a later batch.
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
  heroIconText: { fontSize: 29, fontWeight: '800' },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 18,
  },
  title: {
    color: '#17324D',
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 36,
    marginTop: 10,
    textAlign: 'center',
  },
  provider: { color: '#6366F1', fontSize: 12, fontWeight: '700', marginTop: 7 },
  summary: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 11,
    textAlign: 'center',
  },
  metaCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    minHeight: 78,
    paddingHorizontal: 10,
  },
  metaItem: { alignItems: 'center', flex: 1 },
  metaValue: {
    color: '#17324D',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  metaLabel: { color: '#7B8D9B', fontSize: 10, marginTop: 4 },
  metaDivider: { backgroundColor: '#D9E3E9', height: 32, width: 1 },
  outcomeCard: {
    backgroundColor: '#17324D',
    borderRadius: 16,
    marginTop: 20,
    padding: 18,
  },
  outcomeEyebrow: {
    color: '#8DE4D6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  outcomeText: {
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
  modules: { gap: 9, marginTop: 13 },
  module: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 52,
    paddingHorizontal: 12,
  },
  moduleNumber: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderRadius: 9,
    height: 30,
    justifyContent: 'center',
    marginRight: 11,
    width: 30,
  },
  moduleNumberText: { color: '#0F766E', fontSize: 11, fontWeight: '800' },
  moduleText: { color: '#17324D', flex: 1, fontSize: 13, fontWeight: '700' },
  moduleArrow: { color: '#7B8D9B', fontSize: 22 },
  firstStepCard: {
    backgroundColor: '#EEF0FF',
    borderColor: '#D9DBFF',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 22,
    padding: 17,
  },
  firstStepEyebrow: {
    color: '#6366F1',
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
    color: '#5D7182',
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
  demoNote: {
    color: '#7B8D9B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 13,
    textAlign: 'center',
  },
});
