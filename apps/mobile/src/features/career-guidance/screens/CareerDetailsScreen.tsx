import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CareerDetails'>;

const detailsByCareer: Record<
  string,
  {
    title: string;
    category: string;
    color: string;
    icon: string;
    summary: string;
    fit: string;
    skills: string[];
    firstStep: string;
  }
> = {
  'product-designer': {
    title: 'Product Designer',
    category: 'Design & technology',
    color: '#6366F1',
    icon: '◇',
    summary: 'Design digital products that make complex things feel simple.',
    fit: 'A strong fit if you enjoy understanding people, exploring options, and making ideas visible.',
    skills: [
      'User research',
      'Visual thinking',
      'Prototyping',
      'Communication',
    ],
    firstStep:
      'Redesign one everyday app screen and explain the choices you made.',
  },
  'data-analyst': {
    title: 'Data Analyst',
    category: 'Technology & insight',
    color: '#0F766E',
    icon: '▥',
    summary: 'Find useful signals in information and turn them into decisions.',
    fit: 'A strong fit if you enjoy patterns, thoughtful questions, and practical problem-solving.',
    skills: ['Curiosity', 'Data literacy', 'Critical thinking', 'Storytelling'],
    firstStep:
      'Choose a small dataset and write three questions it could help answer.',
  },
  'community-strategist': {
    title: 'Community Strategist',
    category: 'People & impact',
    color: '#C26A1B',
    icon: '◎',
    summary:
      'Create programmes that help people connect, participate, and grow.',
    fit: 'A strong fit if you notice people’s needs and enjoy turning ideas into shared action.',
    skills: ['Listening', 'Planning', 'Facilitation', 'Empathy'],
    firstStep:
      'Speak with three people about a challenge your community shares.',
  },
  'software-developer': {
    title: 'Software Developer',
    category: 'Technology & building',
    color: '#17324D',
    icon: '</>',
    summary: 'Build practical tools that solve meaningful problems.',
    fit: 'A strong fit if you like breaking problems down and learning by building.',
    skills: ['Logic', 'Persistence', 'Systems thinking', 'Collaboration'],
    firstStep: 'Build a tiny tool that makes one repeated task easier.',
  },
};

export function CareerDetailsScreen({ navigation, route }: Props) {
  const [isSaved, setIsSaved] = useState(false);
  const career =
    detailsByCareer[route.params.careerId] ??
    detailsByCareer['product-designer'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to career exploration"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Career details</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View
            style={[styles.heroIcon, { backgroundColor: `${career.color}18` }]}
          >
            <Text style={[styles.heroIconText, { color: career.color }]}>
              {career.icon}
            </Text>
          </View>
          <Text style={styles.eyebrow}>{career.category.toUpperCase()}</Text>
          <Text style={styles.title}>{career.title}</Text>
          <Text style={styles.summary}>{career.summary}</Text>
        </View>

        <View style={styles.fitCard}>
          <Text style={styles.fitEyebrow}>WHY IT MAY FIT YOU</Text>
          <Text style={styles.fitText}>{career.fit}</Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Skills to explore</Text>
          <Text style={styles.sectionMeta}>Start small</Text>
        </View>
        <View style={styles.skills}>
          {career.skills.map((skill) => (
            <View key={skill} style={styles.skill}>
              <Text style={styles.skillCheck}>✓</Text>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>

        <View style={styles.firstStepCard}>
          <Text style={styles.firstStepEyebrow}>YOUR FIRST EXPERIMENT</Text>
          <Text style={styles.firstStepTitle}>Try it before you decide.</Text>
          <Text style={styles.firstStepText}>{career.firstStep}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSaved ? 'Remove saved career' : 'Save career'}
          onPress={() => setIsSaved((saved) => !saved)}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>
            {isSaved ? 'Saved to my paths' : 'Save to my paths'}
          </Text>
          <Text style={styles.arrow}>{isSaved ? '✓' : '+'}</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo career profile · Course, salary, and opportunity data will be
          added when career services are connected.
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
  hero: { alignItems: 'center', marginTop: 26 },
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
    marginTop: 20,
  },
  title: {
    color: '#17324D',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 10,
    textAlign: 'center',
  },
  summary: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  fitCard: {
    backgroundColor: '#17324D',
    borderRadius: 16,
    marginTop: 26,
    padding: 18,
  },
  fitEyebrow: {
    color: '#8DE4D6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  fitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 10,
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  sectionTitle: { color: '#17324D', fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: '#7B8D9B', fontSize: 10, fontWeight: '700' },
  skills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 13 },
  skill: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 10,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  skillCheck: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
    marginRight: 6,
  },
  skillText: { color: '#5D7182', fontSize: 11, fontWeight: '700' },
  firstStepCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 24,
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
  demoNote: {
    color: '#7B8D9B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 13,
    textAlign: 'center',
  },
});
