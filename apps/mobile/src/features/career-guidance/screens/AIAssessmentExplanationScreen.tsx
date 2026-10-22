import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'AIAssessmentExplanation'
>;

const observations = [
  {
    label: 'You explore',
    text: 'You like seeing more than one possibility before deciding.',
    icon: '✦',
  },
  {
    label: 'You make it real',
    text: 'You learn best when ideas can become practical experiments.',
    icon: '↗',
  },
  {
    label: 'You notice people',
    text: 'You naturally consider the human side of a decision.',
    icon: '◎',
  },
];

export function AIAssessmentExplanationScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to assessment results"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>AI guidance</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.hero}>
          <View style={styles.aiMark}>
            <Text style={styles.aiMarkText}>✦</Text>
          </View>
          <Text style={styles.eyebrow}>YOUR AI GUIDE</Text>
          <Text style={styles.title}>Here’s what your answers tell us.</Text>
          <Text style={styles.description}>
            Your assessment is not a label. It is a starting point for asking
            better questions about your future.
          </Text>
        </View>

        <View style={styles.messageCard}>
          <View style={styles.messageHeader}>
            <View style={styles.messageDot} />
            <Text style={styles.messageLabel}>MANTRIX INSIGHT</Text>
          </View>
          <Text style={styles.messageText}>
            You seem to thrive where curiosity meets meaningful action. Look for
            pathways that let you keep learning, make visible progress, and
            create a positive impact.
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>The patterns we noticed</Text>
          <Text style={styles.sectionMeta}>3 signals</Text>
        </View>
        <View style={styles.observations}>
          {observations.map((observation) => (
            <View key={observation.label} style={styles.observation}>
              <View style={styles.observationIcon}>
                <Text style={styles.observationIconText}>
                  {observation.icon}
                </Text>
              </View>
              <View style={styles.observationCopy}>
                <Text style={styles.observationLabel}>{observation.label}</Text>
                <Text style={styles.observationText}>{observation.text}</Text>
              </View>
            </View>
          ))}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="See my personalized career roadmap"
          onPress={() => navigation.navigate('PersonalizedCareerRoadmap')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>See my career roadmap</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo guidance · AI recommendations will use your saved profile and
          assessment data when connected.
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
  aiMark: {
    alignItems: 'center',
    backgroundColor: '#EEF0FF',
    borderColor: '#D9DBFF',
    borderRadius: 37,
    borderWidth: 1,
    height: 74,
    justifyContent: 'center',
    width: 74,
  },
  aiMarkText: { color: '#6366F1', fontSize: 34 },
  eyebrow: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    marginTop: 22,
  },
  title: {
    color: '#17324D',
    fontSize: 29,
    fontWeight: '800',
    letterSpacing: -0.9,
    lineHeight: 36,
    marginTop: 11,
    textAlign: 'center',
  },
  description: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: 'center',
  },
  messageCard: {
    backgroundColor: '#17324D',
    borderRadius: 16,
    marginTop: 26,
    padding: 18,
  },
  messageHeader: { alignItems: 'center', flexDirection: 'row' },
  messageDot: {
    backgroundColor: '#5EEAD4',
    borderRadius: 5,
    height: 10,
    marginRight: 8,
    width: 10,
  },
  messageLabel: {
    color: '#8DE4D6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  messageText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginTop: 13,
  },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  sectionTitle: { color: '#17324D', fontSize: 17, fontWeight: '800' },
  sectionMeta: { color: '#7B8D9B', fontSize: 10, fontWeight: '700' },
  observations: { gap: 10, marginTop: 13 },
  observation: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 13,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 13,
  },
  observationIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderRadius: 11,
    height: 42,
    justifyContent: 'center',
    marginRight: 12,
    width: 42,
  },
  observationIconText: { color: '#0F766E', fontSize: 21, fontWeight: '700' },
  observationCopy: { flex: 1 },
  observationLabel: { color: '#17324D', fontSize: 13, fontWeight: '800' },
  observationText: {
    color: '#6B8193',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 4,
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
    marginTop: 14,
    textAlign: 'center',
  },
});
