import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'AssessmentProgress'>;

const stages = [
  'Reviewing your responses',
  'Finding your strongest patterns',
  'Preparing your guidance',
];

export function AssessmentProgressScreen({ navigation }: Props) {
  const [stageIndex, setStageIndex] = useState(0);
  const isReady = stageIndex === stages.length - 1;

  useEffect(() => {
    const timer = setInterval(() => {
      setStageIndex((current) => Math.min(current + 1, stages.length - 1));
    }, 650);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    const timer = setTimeout(
      () => navigation.replace('AssessmentResults'),
      700,
    );
    return () => clearTimeout(timer);
  }, [isReady, navigation]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.visual}>
          <View style={styles.outerRing}>
            <View style={styles.middleRing}>
              <View style={styles.innerCircle}>
                <Text style={styles.spark}>✦</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.eyebrow}>ASSESSMENT PROGRESS</Text>
        <Text style={styles.title}>Making sense of your answers.</Text>
        <Text style={styles.description}>
          We’re turning your responses into a clearer starting point for your
          journey.
        </Text>

        <View style={styles.stageList}>
          {stages.map((stage, index) => {
            const complete = index < stageIndex;
            const active = index === stageIndex;
            return (
              <View key={stage} style={styles.stage}>
                <View
                  style={[
                    styles.stageIcon,
                    (complete || active) && styles.stageIconActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.stageIconText,
                      (complete || active) && styles.stageIconTextActive,
                    ]}
                  >
                    {complete ? '✓' : active ? '•' : '○'}
                  </Text>
                </View>
                <Text
                  style={[styles.stageText, active && styles.stageTextActive]}
                >
                  {stage}
                </Text>
              </View>
            );
          })}
        </View>

        {isReady ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="View assessment results"
            onPress={() => navigation.replace('AssessmentResults')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.pressed,
            ]}
          >
            <Text style={styles.primaryText}>View results</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
        ) : null}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Return to assessment"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        >
          <Text style={styles.cancelText}>Back to assessment</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7FAFC', flex: 1 },
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  visual: { alignItems: 'center', marginBottom: 42 },
  outerRing: {
    alignItems: 'center',
    borderColor: '#D9DBFF',
    borderRadius: 86,
    borderWidth: 1,
    height: 172,
    justifyContent: 'center',
    width: 172,
  },
  middleRing: {
    alignItems: 'center',
    borderColor: '#AEB2FF',
    borderRadius: 64,
    borderWidth: 1,
    height: 128,
    justifyContent: 'center',
    width: 128,
  },
  innerCircle: {
    alignItems: 'center',
    backgroundColor: '#6366F1',
    borderRadius: 43,
    height: 86,
    justifyContent: 'center',
    width: 86,
  },
  spark: { color: '#FFFFFF', fontSize: 39 },
  eyebrow: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  title: {
    color: '#17324D',
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 37,
    marginTop: 14,
    textAlign: 'center',
  },
  description: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 14,
    textAlign: 'center',
  },
  stageList: { gap: 13, marginTop: 30 },
  stage: { alignItems: 'center', flexDirection: 'row' },
  stageIcon: {
    alignItems: 'center',
    borderColor: '#C9D4DC',
    borderRadius: 12,
    borderWidth: 1,
    height: 24,
    justifyContent: 'center',
    marginRight: 11,
    width: 24,
  },
  stageIconActive: { backgroundColor: '#E8F3F2', borderColor: '#0F766E' },
  stageIconText: { color: '#AABBC6', fontSize: 13, fontWeight: '800' },
  stageIconTextActive: { color: '#0F766E' },
  stageText: { color: '#7B8D9B', fontSize: 13 },
  stageTextActive: { color: '#17324D', fontWeight: '800' },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    minHeight: 56,
  },
  pressed: { opacity: 0.78 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  arrow: { color: '#5EEAD4', fontSize: 22, marginLeft: 12 },
  cancelButton: { alignItems: 'center', marginTop: 16, padding: 8 },
  cancelText: { color: '#5D7182', fontSize: 13, fontWeight: '700' },
});
