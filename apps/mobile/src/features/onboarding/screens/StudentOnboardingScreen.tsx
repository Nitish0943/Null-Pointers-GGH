import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentOnboarding'>;

type Slide = {
  eyebrow: string;
  title: string;
  description: string;
  mark: string;
  accent: string;
};

const slides: Slide[] = [
  {
    eyebrow: 'YOUR JOURNEY',
    title: 'Start with what makes you, you.',
    description:
      'Tell us a little about your interests and goals so Mantrix can make your next steps feel more focused.',
    mark: '◎',
    accent: '#0F766E',
  },
  {
    eyebrow: 'CLEARER CHOICES',
    title: 'Turn questions into direction.',
    description:
      'Explore pathways, courses, and opportunities that connect your strengths with a future you can see.',
    mark: '↗',
    accent: '#6366F1',
  },
  {
    eyebrow: 'BUILT FOR YOU',
    title: 'Your plan grows with you.',
    description:
      'Begin with a simple student profile. You can refine it anytime as your interests and plans evolve.',
    mark: '✦',
    accent: '#0F766E',
  },
];

export function StudentOnboardingScreen({ navigation }: Props) {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex];
  const isLastSlide = slideIndex === slides.length - 1;

  function continueToNext() {
    if (isLastSlide) {
      navigation.navigate('StudentProfileSetup');
      return;
    }
    setSlideIndex((index) => index + 1);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to sign in"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip student onboarding"
            onPress={() => navigation.navigate('StudentProfileSetup')}
            style={styles.skipButton}
          >
            <Text style={styles.skipText}>Skip</Text>
          </Pressable>
        </View>

        <View style={styles.brandLockup}>
          <View style={styles.brandMark}>
            <View style={styles.brandBar} />
            <View style={[styles.brandBar, styles.brandBarAccent]} />
          </View>
          <Text style={styles.brand}>Mantrix</Text>
        </View>

        <View style={styles.content}>
          <View style={[styles.illustration, { borderColor: slide.accent }]}>
            <View
              style={[
                styles.illustrationCore,
                { backgroundColor: slide.accent },
              ]}
            >
              <Text style={styles.illustrationMark}>{slide.mark}</Text>
            </View>
            <View style={[styles.orbit, { borderColor: slide.accent }]} />
            <View
              style={[styles.orbitDot, { backgroundColor: slide.accent }]}
            />
          </View>

          <Text style={[styles.eyebrow, { color: slide.accent }]}>
            {slide.eyebrow}
          </Text>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        <View style={styles.footer}>
          <View
            accessibilityLabel={`Onboarding slide ${slideIndex + 1} of ${slides.length}`}
            accessibilityRole="progressbar"
            style={styles.progress}
          >
            {slides.map((item, index) => (
              <View
                key={item.eyebrow}
                style={[
                  styles.progressItem,
                  index === slideIndex && {
                    backgroundColor: slide.accent,
                    flex: 1.8,
                  },
                ]}
              />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isLastSlide ? 'Set up student profile' : 'Continue'
            }
            onPress={continueToNext}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryText}>
              {isLastSlide ? 'Set up my profile' : 'Continue'}
            </Text>
            <Text style={styles.arrow}>→</Text>
          </Pressable>
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
    padding: 24,
  },
  topBar: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButton: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingVertical: 8,
  },
  backArrow: {
    color: '#17324D',
    fontSize: 22,
    marginRight: 8,
  },
  backText: {
    color: '#5D7182',
    fontSize: 14,
    fontWeight: '700',
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: '#5D7182',
    fontSize: 14,
    fontWeight: '800',
  },
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 26,
  },
  brandMark: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 2,
    height: 19,
    marginRight: 8,
    width: 22,
  },
  brandBar: {
    backgroundColor: '#17324D',
    borderRadius: 2,
    height: 16,
    transform: [{ rotate: '-18deg' }],
    width: 7,
  },
  brandBarAccent: {
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
  content: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingBottom: 28,
  },
  illustration: {
    alignItems: 'center',
    borderRadius: 92,
    borderWidth: 1,
    height: 184,
    justifyContent: 'center',
    marginBottom: 48,
    width: 184,
  },
  illustrationCore: {
    alignItems: 'center',
    borderRadius: 44,
    height: 88,
    justifyContent: 'center',
    width: 88,
  },
  illustrationMark: {
    color: '#FFFFFF',
    fontSize: 42,
    fontWeight: '700',
  },
  orbit: {
    borderRadius: 30,
    borderWidth: 1,
    height: 60,
    position: 'absolute',
    transform: [{ rotate: '35deg' }],
    width: 132,
  },
  orbitDot: {
    borderRadius: 6,
    height: 12,
    position: 'absolute',
    right: 20,
    top: 25,
    width: 12,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#17324D',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.1,
    lineHeight: 40,
    marginTop: 14,
    textAlign: 'center',
  },
  description: {
    color: '#5D7182',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 16,
    maxWidth: 340,
    textAlign: 'center',
  },
  footer: {
    paddingBottom: 12,
  },
  progress: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 18,
  },
  progressItem: {
    backgroundColor: '#D9E3E9',
    borderRadius: 3,
    flex: 1,
    height: 5,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonPressed: {
    opacity: 0.82,
  },
  primaryText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  arrow: {
    color: '#5EEAD4',
    fontSize: 22,
    marginLeft: 12,
  },
});
