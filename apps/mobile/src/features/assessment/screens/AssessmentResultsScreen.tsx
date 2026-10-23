import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';
import { useAuth } from '../../../shared/services/AuthProvider';
import {
  getAuthErrorMessage,
  markAssessmentCompleted,
} from '../../../shared/services/auth-service';
import { useEffect, useState } from 'react';
import { getSavedAssessmentResult } from '../../../shared/services/assessment-service';

type Props = NativeStackScreenProps<RootStackParamList, 'AssessmentResults'>;

const strengths = [
  {
    title: 'Curious thinker',
    detail: 'You enjoy exploring possibilities before choosing a direction.',
    color: '#6366F1',
    icon: '✦',
  },
  {
    title: 'Practical learner',
    detail: 'You grow fastest when ideas become something you can try.',
    color: '#0F766E',
    icon: '◎',
  },
  {
    title: 'People-aware',
    detail: 'You notice how decisions affect the people around you.',
    color: '#C26A1B',
    icon: '◌',
  },
];

export function AssessmentResultsScreen({ navigation }: Props) {
  const { profile, refreshProfile, user } = useAuth();
  const [saveError, setSaveError] = useState('');
  const [aiResult, setAiResult] = useState<{
    summary?: string;
    strengths?: string[];
    interestAreas?: string[];
    careerDirections?: string[];
  } | null>(null);

  useEffect(() => {
    if (!user || profile?.assessmentCompleted) {
      return;
    }
    void markAssessmentCompleted(user.uid)
      .then(refreshProfile)
      .catch((error: unknown) => setSaveError(getAuthErrorMessage(error)));
  }, [profile?.assessmentCompleted, refreshProfile, user]);

  useEffect(() => {
    if (!user) return;
    void getSavedAssessmentResult(user.uid)
      .then((result) => setAiResult(result as typeof aiResult))
      .catch(() => undefined);
  }, [user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to assessment progress"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          {saveError ? <Text style={styles.demoNote}>{saveError}</Text> : null}
          <Text style={styles.headerTitle}>Your results</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View style={styles.scoreCircle}>
            <Text style={styles.score}>3</Text>
            <Text style={styles.scoreLabel}>insights</Text>
          </View>
          <Text style={styles.eyebrow}>YOUR COGNITIVE SNAPSHOT</Text>
          <Text style={styles.title}>A thoughtful explorer.</Text>
          <Text style={styles.description}>
            You bring curiosity, practical energy, and awareness of people into
            the way you approach new possibilities.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Your strengths</Text>
          <Text style={styles.sectionMeta}>From this assessment</Text>
        </View>
        <View style={styles.strengths}>
          {strengths.map((strength) => (
            <View key={strength.title} style={styles.strengthCard}>
              <View
                style={[
                  styles.strengthIcon,
                  { backgroundColor: `${strength.color}18` },
                ]}
              >
                <Text
                  style={[styles.strengthIconText, { color: strength.color }]}
                >
                  {strength.icon}
                </Text>
              </View>
              <View style={styles.strengthCopy}>
                <Text style={styles.strengthTitle}>{strength.title}</Text>
                <Text style={styles.strengthDetail}>{strength.detail}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.guidanceCard}>
          <Text style={styles.guidanceEyebrow}>WHAT THIS MEANS</Text>
          <Text style={styles.guidanceTitle}>
            Follow the questions that keep you curious.
          </Text>
          <Text style={styles.guidanceText}>
            {aiResult?.summary ??
              'Start by exploring pathways where creativity, problem-solving, and people impact meet.'}
          </Text>
        </View>
        {aiResult?.careerDirections?.length ? (
          <View style={styles.guidanceCard}>
            <Text style={styles.guidanceEyebrow}>
              CAREER DIRECTIONS TO EXPLORE
            </Text>
            {aiResult.careerDirections.map((direction) => (
              <Text key={direction} style={styles.guidanceText}>
                • {direction}
              </Text>
            ))}
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Explore my guidance"
          onPress={() => navigation.navigate('AIAssessmentExplanation')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>Explore my guidance</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Retake assessment"
          onPress={() => navigation.replace('CognitiveAssessmentIntro')}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryText}>Retake assessment</Text>
        </Pressable>

        <Text style={styles.demoNote}>
          Demo results · Your insights will be recalculated from saved
          assessment data when the backend is connected.
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
  hero: { alignItems: 'center', marginTop: 28 },
  scoreCircle: {
    alignItems: 'center',
    backgroundColor: '#EEF0FF',
    borderColor: '#6366F1',
    borderRadius: 63,
    borderWidth: 6,
    height: 126,
    justifyContent: 'center',
    width: 126,
  },
  score: { color: '#6366F1', fontSize: 38, fontWeight: '800' },
  scoreLabel: {
    color: '#6366F1',
    fontSize: 11,
    fontWeight: '800',
    marginTop: -2,
  },
  eyebrow: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 27,
  },
  title: {
    color: '#17324D',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -1,
    marginTop: 12,
    textAlign: 'center',
  },
  description: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  sectionTitle: { color: '#17324D', fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: '#7B8D9B', fontSize: 10, fontWeight: '700' },
  strengths: { gap: 10, marginTop: 13 },
  strengthCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 13,
  },
  strengthIcon: {
    alignItems: 'center',
    borderRadius: 11,
    height: 43,
    justifyContent: 'center',
    marginRight: 12,
    width: 43,
  },
  strengthIconText: { fontSize: 22, fontWeight: '700' },
  strengthCopy: { flex: 1 },
  strengthTitle: { color: '#17324D', fontSize: 14, fontWeight: '800' },
  strengthDetail: {
    color: '#6B8193',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
  },
  guidanceCard: {
    backgroundColor: '#17324D',
    borderRadius: 15,
    marginTop: 24,
    padding: 18,
  },
  guidanceEyebrow: {
    color: '#8DE4D6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  guidanceTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 23,
    marginTop: 8,
  },
  guidanceText: {
    color: '#C8D9E1',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 7,
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
    marginTop: 8,
    textAlign: 'center',
  },
});
