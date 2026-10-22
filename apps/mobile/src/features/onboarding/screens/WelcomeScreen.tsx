import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export function WelcomeScreen({ navigation }: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topRow}>
          <View style={styles.brandLockup}>
            <View style={styles.miniMark}>
              <View style={styles.miniBar} />
              <View style={[styles.miniBar, styles.miniBarAccent]} />
            </View>
            <Text style={styles.brand}>Mantrix</Text>
          </View>
          <Text style={styles.version}>ACADEMIC NAVIGATOR</Text>
        </View>

        <View style={styles.hero}>
          <View style={styles.eyebrowRow}>
            <View style={styles.eyebrowDot} />
            <Text style={styles.eyebrow}>YOUR NEXT CHAPTER STARTS HERE</Text>
          </View>
          <Text style={styles.title}>
            Discover Your Path.{'\n'}Plan Your Future.
          </Text>
          <Text style={styles.description}>
            Trusted guidance for every academic decision, from your first
            assessment to the career you want to build.
          </Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.cardIcon}>
            <Text style={styles.cardIconText}>✦</Text>
          </View>
          <View style={styles.cardCopy}>
            <Text style={styles.cardTitle}>Guidance grounded in you</Text>
            <Text style={styles.cardDescription}>
              Explore your strengths, compare real opportunities, and move
              forward with clarity.
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Start your Mantrix journey"
            accessibilityState={{ disabled: false }}
            onPress={() => navigation.navigate('Onboarding')}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryButtonText}>Start your journey</Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
          <Text style={styles.privacy}>
            Your choices stay yours. Mantrix is built for guidance, not limits.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FAFC',
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 24,
  },
  topRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  miniMark: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
    height: 19,
    marginRight: 8,
    width: 22,
  },
  miniBar: {
    backgroundColor: '#17324D',
    borderRadius: 2,
    height: 16,
    transform: [{ rotate: '-18deg' }],
    width: 7,
  },
  miniBarAccent: {
    backgroundColor: '#0F766E',
    height: 19,
    transform: [{ rotate: '18deg' }],
  },
  brand: {
    color: '#17324D',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  version: {
    color: '#6B8193',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1,
  },
  hero: {
    marginTop: 52,
  },
  eyebrowRow: {
    alignItems: 'center',
    flexDirection: 'row',
    marginBottom: 18,
  },
  eyebrowDot: {
    backgroundColor: '#0F766E',
    borderRadius: 4,
    height: 8,
    marginRight: 8,
    width: 8,
  },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#17324D',
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.6,
    lineHeight: 45,
  },
  description: {
    color: '#5D7182',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 22,
    maxWidth: 340,
  },
  infoCard: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderColor: '#C8E2DF',
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  cardIcon: {
    alignItems: 'center',
    backgroundColor: '#0F766E',
    borderRadius: 12,
    height: 44,
    justifyContent: 'center',
    marginRight: 14,
    width: 44,
  },
  cardIconText: {
    color: '#FFFFFF',
    fontSize: 22,
  },
  cardCopy: {
    flex: 1,
  },
  cardTitle: {
    color: '#17324D',
    fontSize: 14,
    fontWeight: '800',
  },
  cardDescription: {
    color: '#527170',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  actions: {
    marginTop: 28,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 20,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  arrow: {
    color: '#5EEAD4',
    fontSize: 22,
    marginLeft: 12,
  },
  privacy: {
    color: '#7B8D9B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 14,
    textAlign: 'center',
  },
});
