import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AdmissionEligibility'>;

const collegeNames: Record<string, string> = {
  northstar: 'Northstar Institute of Design',
  'civic-tech': 'Civic Technology University',
  horizon: 'Horizon College of Applied Science',
};

const checks = [
  {
    id: 'level',
    title: 'Current level of study',
    detail: 'Confirm your latest completed or current grade.',
  },
  {
    id: 'subjects',
    title: 'Relevant subjects',
    detail: 'Review the subjects expected for your chosen programme.',
  },
  {
    id: 'portfolio',
    title: 'Portfolio or project work',
    detail: 'Some programmes may ask to see how you think and make.',
  },
];

export function AdmissionEligibilityScreen({ navigation, route }: Props) {
  const [confirmed, setConfirmed] = useState<string[]>([]);
  const collegeName =
    collegeNames[route.params.collegeId] ?? collegeNames.northstar;
  const isReady = confirmed.length === checks.length;
  const progress = useMemo(
    () => confirmed.length / checks.length,
    [confirmed.length],
  );

  function toggleCheck(id: string) {
    setConfirmed((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to college details"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Admission check</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>ADMISSION ELIGIBILITY</Text>
          <Text style={styles.title}>Could this be your next place?</Text>
          <Text style={styles.description}>
            Use this quick checklist to prepare your questions for {collegeName}
            . It is a guide, not an admissions decision.
          </Text>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Your preparation</Text>
            <Text style={styles.progressValue}>
              {confirmed.length}/{checks.length}
            </Text>
          </View>
          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress * 100}%` }]}
            />
          </View>
          <Text style={styles.progressText}>
            {isReady
              ? 'You have a useful starting checklist.'
              : 'Confirm what you already know.'}
          </Text>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Things to check</Text>
          <Text style={styles.sectionMeta}>Local guide</Text>
        </View>
        <View style={styles.checks}>
          {checks.map((check) => {
            const selected = confirmed.includes(check.id);
            return (
              <Pressable
                accessibilityRole="checkbox"
                accessibilityState={{ checked: selected }}
                key={check.id}
                onPress={() => toggleCheck(check.id)}
                style={({ pressed }) => [
                  styles.checkCard,
                  selected && styles.checkCardSelected,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[styles.checkbox, selected && styles.checkboxSelected]}
                >
                  {selected && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.checkCopy}>
                  <Text style={styles.checkTitle}>{check.title}</Text>
                  <Text style={styles.checkDetail}>{check.detail}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        <View style={styles.noteCard}>
          <Text style={styles.noteEyebrow}>GOOD TO KNOW</Text>
          <Text style={styles.noteText}>
            Requirements vary by programme and intake. Use this checklist to
            start a conversation with the institution.
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Save admission checklist"
          onPress={() =>
            Alert.alert(
              'Checklist saved',
              'Your preparation checklist is ready for a future admissions workflow.',
            )
          }
          style={({ pressed }) => [
            styles.primaryButton,
            !isReady && styles.primaryButtonDisabled,
            pressed && isReady && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>
            {isReady ? 'Save checklist' : 'Complete checklist'}
          </Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo eligibility guide · Verified requirements and application
          deadlines will be connected later.
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
  heading: { marginTop: 30 },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  title: {
    color: '#17324D',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 38,
    marginTop: 13,
  },
  description: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 13,
  },
  progressCard: {
    backgroundColor: '#17324D',
    borderRadius: 15,
    marginTop: 24,
    padding: 17,
  },
  progressHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTitle: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  progressValue: { color: '#8DE4D6', fontSize: 13, fontWeight: '800' },
  progressTrack: {
    backgroundColor: '#3D5A6B',
    borderRadius: 3,
    height: 6,
    marginTop: 14,
    overflow: 'hidden',
  },
  progressFill: { backgroundColor: '#5EEAD4', borderRadius: 3, height: 6 },
  progressText: { color: '#C8D9E1', fontSize: 11, marginTop: 10 },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  sectionTitle: { color: '#17324D', fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: '#7B8D9B', fontSize: 10, fontWeight: '700' },
  checks: { gap: 10, marginTop: 13 },
  checkCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  checkCardSelected: { backgroundColor: '#FCFFFE', borderColor: '#0F766E' },
  checkbox: {
    alignItems: 'center',
    borderColor: '#AABBC6',
    borderRadius: 7,
    borderWidth: 2,
    height: 24,
    justifyContent: 'center',
    marginRight: 12,
    width: 24,
  },
  checkboxSelected: { backgroundColor: '#0F766E', borderColor: '#0F766E' },
  checkmark: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  checkCopy: { flex: 1 },
  checkTitle: { color: '#17324D', fontSize: 14, fontWeight: '800' },
  checkDetail: { color: '#6B8193', fontSize: 11, lineHeight: 17, marginTop: 4 },
  noteCard: {
    backgroundColor: '#EEF0FF',
    borderColor: '#D9DBFF',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 22,
    padding: 16,
  },
  noteEyebrow: {
    color: '#6366F1',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  noteText: { color: '#5D7182', fontSize: 12, lineHeight: 18, marginTop: 7 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 56,
  },
  primaryButtonDisabled: { backgroundColor: '#AABBC6' },
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
