import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'PersonalizedCareerRoadmap'
>;

const roadmap = [
  {
    step: '01',
    title: 'Build your foundation',
    detail: 'Strengthen the skills that make your curiosity useful.',
    tag: 'NOW',
    color: '#0F766E',
  },
  {
    step: '02',
    title: 'Explore real pathways',
    detail: 'Compare courses and roles where ideas become impact.',
    tag: 'NEXT',
    color: '#6366F1',
  },
  {
    step: '03',
    title: 'Try before you decide',
    detail: 'Use projects and conversations to test what fits.',
    tag: 'LATER',
    color: '#C26A1B',
  },
];

export function PersonalizedCareerRoadmapScreen({ navigation }: Props) {
  const [isSaved, setIsSaved] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to AI assessment explanation"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <Text style={styles.headerTitle}>Your roadmap</Text>
          <View style={styles.headerSpacer} />
        </View>

        <View style={styles.heading}>
          <Text style={styles.eyebrow}>PERSONALIZED CAREER ROADMAP</Text>
          <Text style={styles.title}>A path with room to grow.</Text>
          <Text style={styles.description}>
            Based on your assessment, here is a simple starting sequence. Take
            it one step at a time—your direction can evolve.
          </Text>
        </View>

        <View style={styles.roadmapCard}>
          <View style={styles.roadmapHeader}>
            <View>
              <Text style={styles.roadmapEyebrow}>YOUR STARTING POINT</Text>
              <Text style={styles.roadmapTitle}>Curiosity → impact</Text>
            </View>
            <Text style={styles.roadmapMark}>↗</Text>
          </View>
          <View style={styles.path}>
            {roadmap.map((item, index) => (
              <View key={item.step} style={styles.pathRow}>
                <View style={styles.stepColumn}>
                  <View
                    style={[styles.stepCircle, { borderColor: item.color }]}
                  >
                    <Text style={[styles.stepText, { color: item.color }]}>
                      {item.step}
                    </Text>
                  </View>
                  {index < roadmap.length - 1 ? (
                    <View style={styles.connector} />
                  ) : null}
                </View>
                <View style={styles.pathCopy}>
                  <View style={styles.pathTitleRow}>
                    <Text style={styles.pathTitle}>{item.title}</Text>
                    <Text style={[styles.pathTag, { color: item.color }]}>
                      {item.tag}
                    </Text>
                  </View>
                  <Text style={styles.pathDetail}>{item.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.nextCard}>
          <Text style={styles.nextEyebrow}>RECOMMENDED FIRST MOVE</Text>
          <Text style={styles.nextTitle}>Start a small project.</Text>
          <Text style={styles.nextDetail}>
            Choose one question you are curious about and make something that
            helps you explore it this week.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Save first move"
            onPress={() => setIsSaved((saved) => !saved)}
            style={styles.saveButton}
          >
            <Text style={styles.saveText}>
              {isSaved ? 'Saved for later' : 'Save for later'}
            </Text>
          </Pressable>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to dashboard"
          onPress={() => navigation.replace('Home')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.primaryText}>Return to dashboard</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo roadmap · Course, college, and opportunity matches will be added
          when guidance data is connected.
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
  roadmapCard: {
    backgroundColor: '#17324D',
    borderRadius: 16,
    marginTop: 26,
    padding: 18,
  },
  roadmapHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roadmapEyebrow: {
    color: '#8DE4D6',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1.1,
  },
  roadmapTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '800',
    marginTop: 7,
  },
  roadmapMark: { color: '#5EEAD4', fontSize: 30 },
  path: { marginTop: 22 },
  pathRow: { flexDirection: 'row', minHeight: 82 },
  stepColumn: { alignItems: 'center', marginRight: 13, width: 34 },
  stepCircle: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 17,
    borderWidth: 2,
    height: 34,
    justifyContent: 'center',
    width: 34,
  },
  stepText: { fontSize: 10, fontWeight: '800' },
  connector: {
    backgroundColor: '#547080',
    flex: 1,
    marginVertical: 4,
    width: 1,
  },
  pathCopy: { flex: 1, paddingTop: 2 },
  pathTitleRow: { alignItems: 'center', flexDirection: 'row' },
  pathTitle: { color: '#FFFFFF', flex: 1, fontSize: 14, fontWeight: '800' },
  pathTag: { fontSize: 9, fontWeight: '800', letterSpacing: 0.8 },
  pathDetail: { color: '#C8D9E1', fontSize: 11, lineHeight: 17, marginTop: 5 },
  nextCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 15,
    borderWidth: 1,
    marginTop: 22,
    padding: 17,
  },
  nextEyebrow: {
    color: '#6366F1',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nextTitle: {
    color: '#17324D',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 8,
  },
  nextDetail: { color: '#6B8193', fontSize: 12, lineHeight: 18, marginTop: 6 },
  saveButton: { alignSelf: 'flex-start', marginTop: 13, paddingVertical: 5 },
  saveText: { color: '#0F766E', fontSize: 12, fontWeight: '800' },
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
