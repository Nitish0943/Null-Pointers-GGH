import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';
import {
  BottomNavigation,
  type PrimaryTab,
} from '../../../shared/components/navigation/BottomNavigation';
import { useAuth } from '../../../shared/services/AuthProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

const quickActions = [
  { icon: '◎', label: 'Take assessment', detail: 'Discover your strengths' },
  { icon: '↗', label: 'Explore careers', detail: 'See where you could go' },
  { icon: '▣', label: 'Find courses', detail: 'Compare your options' },
];

export function HomeScreen({ navigation }: Props) {
  const { profile, user } = useAuth();
  const [selectedAction, setSelectedAction] = useState('');
  const profileFields = [
    profile?.displayName || user?.displayName,
    profile?.studyLevel,
    profile?.schoolName,
    profile?.location,
    profile?.address,
    profile?.interest,
  ];
  const completedProfileFields = profileFields.filter(Boolean).length;
  const profilePercent = Math.round(
    (completedProfileFields / profileFields.length) * 100,
  );
  const assessmentCompleted = Boolean(profile?.assessmentCompleted);
  const availableActions = quickActions.filter(
    (action) => !assessmentCompleted || action.label !== 'Take assessment',
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>STUDENT DASHBOARD</Text>
            <Text style={styles.greeting}>
              Good morning,{' '}
              {profile?.displayName || user?.displayName || 'Student'}
            </Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Open notifications"
            onPress={() => navigation.navigate('Notifications')}
            style={styles.notificationButton}
          >
            <Text style={styles.notificationIcon}>♢</Text>
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>3</Text>
            </View>
          </Pressable>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressCopy}>
            <Text style={styles.progressEyebrow}>YOUR JOURNEY</Text>
            <Text style={styles.progressTitle}>
              {profilePercent === 100
                ? 'Your profile is complete'
                : 'Complete your profile'}
            </Text>
            <Text style={styles.progressDescription}>
              {profilePercent === 100
                ? 'Your guidance can now be shaped around your saved details.'
                : 'Complete your profile to unlock guidance made for you.'}
            </Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Continue setting up your profile"
              onPress={() => navigation.navigate('StudentProfileSetup')}
              style={styles.progressAction}
            >
              <Text style={styles.progressActionText}>
                {profilePercent === 100 ? 'Update profile' : 'Continue setup'}
              </Text>
              <Text style={styles.progressArrow}>→</Text>
            </Pressable>
          </View>
          <View style={styles.progressRing}>
            <Text style={styles.progressValue}>{profilePercent}%</Text>
            <Text style={styles.progressLabel}>complete</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Start exploring</Text>
          <Text style={styles.sectionMeta}>
            {availableActions.length}{' '}
            {availableActions.length === 1 ? 'way' : 'ways'} to begin
          </Text>
        </View>
        <View style={styles.actions}>
          {availableActions.map((action) => (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={action.label}
              key={action.label}
              onPress={() => {
                if (action.label === 'Take assessment') {
                  navigation.navigate('CognitiveAssessmentIntro');
                  return;
                }
                if (action.label === 'Explore careers') {
                  navigation.navigate('CareerExploration');
                  return;
                }
                if (action.label === 'Find courses') {
                  navigation.navigate('CourseDiscovery');
                  return;
                }
                setSelectedAction(action.label);
              }}
              style={({ pressed }) => [
                styles.actionCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>{action.icon}</Text>
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
              <Text style={styles.actionDetail}>{action.detail}</Text>
              <Text style={styles.actionArrow}>↗</Text>
            </Pressable>
          ))}
        </View>

        {!assessmentCompleted ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your next step</Text>
              <Text style={styles.sectionMeta}>This week</Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Open career assessment"
              onPress={() => navigation.navigate('CognitiveAssessmentIntro')}
              style={({ pressed }) => [
                styles.assessmentCard,
                pressed && styles.pressed,
              ]}
            >
              <View style={styles.assessmentIcon}>
                <Text style={styles.assessmentIconText}>✦</Text>
              </View>
              <View style={styles.assessmentCopy}>
                <Text style={styles.assessmentEyebrow}>
                  RECOMMENDED FOR YOU
                </Text>
                <Text style={styles.assessmentTitle}>
                  Understand your strengths
                </Text>
                <Text style={styles.assessmentDescription}>
                  A short assessment can help shape your first roadmap.
                </Text>
              </View>
              <Text style={styles.assessmentArrow}>→</Text>
            </Pressable>
          </>
        ) : (
          <View style={styles.completedCard}>
            <Text style={styles.completedIcon}>✓</Text>
            <View style={styles.assessmentCopy}>
              <Text style={styles.assessmentEyebrow}>COMPLETED</Text>
              <Text style={styles.assessmentTitle}>
                Cognitive assessment complete
              </Text>
              <Text style={styles.assessmentDescription}>
                Your results are saved. Reassessment can be added later.
              </Text>
            </View>
          </View>
        )}
        {selectedAction ? (
          <Text style={styles.actionStatus}>
            {selectedAction} is ready for the next feature batch.
          </Text>
        ) : null}

        <Text style={styles.demoNote}>
          Demo dashboard · Recommendations will use your saved profile and
          assessment results when connected.
        </Text>
      </ScrollView>
      <BottomNavigation
        activeTab="Home"
        onTabPress={(tab: PrimaryTab) => navigation.navigate(tab)}
      />
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
    paddingTop: 8,
  },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  greeting: {
    color: '#17324D',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginTop: 7,
  },
  notificationButton: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 22,
    borderWidth: 1,
    height: 44,
    justifyContent: 'center',
    width: 44,
  },
  notificationIcon: {
    color: '#17324D',
    fontSize: 25,
    transform: [{ rotate: '45deg' }],
  },
  notificationBadge: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderColor: '#F7FAFC',
    borderRadius: 9,
    borderWidth: 2,
    height: 18,
    justifyContent: 'center',
    position: 'absolute',
    right: -2,
    top: -3,
    width: 18,
  },
  notificationBadgeText: { color: '#FFFFFF', fontSize: 9, fontWeight: '800' },
  progressCard: {
    backgroundColor: '#17324D',
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    minHeight: 190,
    overflow: 'hidden',
    padding: 20,
  },
  progressCopy: { flex: 1, paddingRight: 12 },
  progressEyebrow: {
    color: '#8DE4D6',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  progressTitle: {
    color: '#FFFFFF',
    fontSize: 23,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 28,
    marginTop: 10,
  },
  progressDescription: {
    color: '#C8D9E1',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8,
  },
  progressAction: { alignItems: 'center', flexDirection: 'row', marginTop: 18 },
  progressActionText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  progressArrow: { color: '#5EEAD4', fontSize: 19, marginLeft: 8 },
  progressRing: {
    alignItems: 'center',
    borderColor: '#5EEAD4',
    borderRadius: 48,
    borderWidth: 7,
    height: 96,
    justifyContent: 'center',
    marginTop: 12,
    width: 96,
  },
  progressValue: { color: '#FFFFFF', fontSize: 19, fontWeight: '800' },
  progressLabel: { color: '#AFC7D0', fontSize: 10, marginTop: 2 },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 28,
  },
  sectionTitle: { color: '#17324D', fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: '#7B8D9B', fontSize: 11, fontWeight: '700' },
  actions: { gap: 10, marginTop: 13 },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    minHeight: 80,
    padding: 14,
    paddingLeft: 68,
  },
  actionIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderRadius: 11,
    height: 40,
    justifyContent: 'center',
    left: 14,
    position: 'absolute',
    top: 18,
    width: 40,
  },
  actionIconText: { color: '#0F766E', fontSize: 22, fontWeight: '700' },
  actionLabel: { color: '#17324D', fontSize: 14, fontWeight: '800' },
  actionDetail: { color: '#6B8193', fontSize: 12, marginTop: 4 },
  actionArrow: {
    color: '#0F766E',
    fontSize: 18,
    position: 'absolute',
    right: 16,
    top: 29,
  },
  assessmentCard: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 13,
    minHeight: 112,
    padding: 14,
  },
  completedCard: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderColor: '#B9DDD7',
    borderRadius: 16,
    flexDirection: 'row',
    marginTop: 4,
    padding: 18,
  },
  completedIcon: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 22,
    color: '#FFFFFF',
    fontSize: 22,
    height: 44,
    lineHeight: 44,
    marginRight: 14,
    textAlign: 'center',
    width: 44,
  },
  assessmentIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF0FF',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  assessmentIconText: { color: '#6366F1', fontSize: 24 },
  assessmentCopy: { flex: 1, paddingRight: 8 },
  assessmentEyebrow: {
    color: '#6366F1',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  assessmentTitle: {
    color: '#17324D',
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  assessmentDescription: {
    color: '#6B8193',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 4,
  },
  assessmentArrow: { color: '#6366F1', fontSize: 20 },
  pressed: { opacity: 0.78 },
  actionStatus: {
    color: '#0F766E',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
  },
  demoNote: {
    color: '#7B8D9B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 26,
    textAlign: 'center',
  },
});
