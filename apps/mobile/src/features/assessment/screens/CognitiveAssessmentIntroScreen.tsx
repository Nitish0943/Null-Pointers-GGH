import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<
  RootStackParamList,
  'CognitiveAssessmentIntro'
>;

const details = [
  { icon: '◷', title: '10–15 minutes', detail: 'Go at your own pace' },
  { icon: '◎', title: 'No right answers', detail: 'Be honest and curious' },
  { icon: '✦', title: 'Made for you', detail: 'See your strengths clearly' },
];

export function CognitiveAssessmentIntroScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to home"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back to home</Text>
        </Pressable>

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <Text style={styles.heroIconText}>✦</Text>
          </View>
          <Text style={styles.eyebrow}>COGNITIVE ASSESSMENT</Text>
          <Text style={styles.title}>Understand how you think.</Text>
          <Text style={styles.description}>
            This short assessment helps reveal the ways you learn, solve
            problems, and make decisions. Your answers help shape guidance that
            feels like yours.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>A thoughtful first step</Text>
          <Text style={styles.infoDescription}>
            Find a quiet moment and answer each question based on what feels
            most natural to you.
          </Text>
          <View style={styles.details}>
            {details.map((detail) => (
              <View key={detail.title} style={styles.detail}>
                <View style={styles.detailIcon}>
                  <Text style={styles.detailIconText}>{detail.icon}</Text>
                </View>
                <View style={styles.detailCopy}>
                  <Text style={styles.detailTitle}>{detail.title}</Text>
                  <Text style={styles.detailText}>{detail.detail}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Begin cognitive assessment"
          onPress={() => navigation.navigate('Assessment')}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && styles.buttonPressed,
          ]}
        >
          <Text style={styles.primaryText}>Begin assessment</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Text style={styles.demoNote}>
          Demo assessment · Results will be saved when assessment services are
          connected.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7FAFC', flex: 1 },
  container: { flexGrow: 1, padding: 24 },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  backArrow: { color: '#17324D', fontSize: 22, marginRight: 8 },
  backText: { color: '#5D7182', fontSize: 14, fontWeight: '700' },
  hero: { alignItems: 'center', marginTop: 48 },
  heroIcon: {
    alignItems: 'center',
    backgroundColor: '#EEF0FF',
    borderColor: '#D9DBFF',
    borderRadius: 42,
    borderWidth: 1,
    height: 84,
    justifyContent: 'center',
    marginBottom: 28,
    width: 84,
  },
  heroIconText: { color: '#6366F1', fontSize: 38 },
  eyebrow: {
    color: '#6366F1',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#17324D',
    fontSize: 35,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 40,
    marginTop: 14,
    textAlign: 'center',
  },
  description: {
    color: '#5D7182',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 16,
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 34,
    padding: 18,
  },
  infoTitle: { color: '#17324D', fontSize: 16, fontWeight: '800' },
  infoDescription: {
    color: '#6B8193',
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
  },
  details: { gap: 14, marginTop: 20 },
  detail: { alignItems: 'center', flexDirection: 'row' },
  detailIcon: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderRadius: 10,
    height: 36,
    justifyContent: 'center',
    marginRight: 11,
    width: 36,
  },
  detailIconText: { color: '#0F766E', fontSize: 18 },
  detailCopy: { flex: 1 },
  detailTitle: { color: '#17324D', fontSize: 13, fontWeight: '800' },
  detailText: { color: '#7B8D9B', fontSize: 11, marginTop: 2 },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    minHeight: 56,
  },
  buttonPressed: { opacity: 0.82 },
  primaryText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  arrow: { color: '#5EEAD4', fontSize: 22, marginLeft: 12 },
  demoNote: {
    color: '#7B8D9B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 18,
    textAlign: 'center',
  },
});
