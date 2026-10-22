import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';
import { BrandLockup } from '../../../shared/components/branding/BrandLockup';

const { width } = Dimensions.get('window');

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

type Slide = {
  eyebrow: string;
  title: string;
  description: string;
  icon: string;
  accent: string;
};

const slides: Slide[] = [
  {
    eyebrow: '01  UNDERSTAND YOURSELF',
    title: 'Start with your strengths.',
    description:
      'Discover the subjects, habits, and possibilities that make your path uniquely yours.',
    icon: '◎',
    accent: '#0F766E',
  },
  {
    eyebrow: '02  EXPLORE WITH CLARITY',
    title: 'Make informed choices.',
    description:
      'Compare courses, colleges, scholarships, and real outcomes with guidance you can trust.',
    icon: '⌖',
    accent: '#6366F1',
  },
  {
    eyebrow: '03  MOVE FORWARD',
    title: 'Plan the future you want.',
    description:
      'Turn your direction into a practical roadmap, one confident step at a time.',
    icon: '↗',
    accent: '#0F766E',
  },
];

export function OnboardingSlidesScreen({ navigation }: Props) {
  const listRef = useRef<FlatList<Slide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const isLastSlide = activeIndex === slides.length - 1;

  function handleScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const nextIndex = Math.round(event.nativeEvent.contentOffset.x / width);
    setActiveIndex(Math.max(0, Math.min(nextIndex, slides.length - 1)));
  }

  function goToNext() {
    if (isLastSlide) {
      navigation.navigate('RoleSelection');
      return;
    }

    listRef.current?.scrollToIndex({
      animated: true,
      index: activeIndex + 1,
    });
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <BrandLockup />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Skip onboarding"
            onPress={() => navigation.navigate('RoleSelection')}
            hitSlop={12}
          >
            <Text style={styles.skip}>Skip</Text>
          </Pressable>
        </View>

        <FlatList
          data={slides}
          horizontal
          keyExtractor={(item) => item.eyebrow}
          onMomentumScrollEnd={handleScroll}
          pagingEnabled
          ref={listRef}
          renderItem={({ item }) => (
            <View style={styles.slide}>
              <View style={[styles.illustration, { borderColor: item.accent }]}>
                <View
                  style={[
                    styles.illustrationHalo,
                    { backgroundColor: item.accent },
                  ]}
                />
                <Text style={styles.illustrationIcon}>{item.icon}</Text>
                <View style={styles.illustrationGrid}>
                  <View style={styles.gridLine} />
                  <View style={[styles.gridLine, styles.gridLineShort]} />
                  <View style={styles.gridLine} />
                </View>
              </View>
              <Text style={styles.eyebrow}>{item.eyebrow}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          )}
          showsHorizontalScrollIndicator={false}
        />

        <View style={styles.footer}>
          <View
            style={styles.pagination}
            accessibilityLabel={`Slide ${activeIndex + 1} of ${slides.length}`}
          >
            {slides.map((slide, index) => (
              <View
                key={slide.eyebrow}
                style={[
                  styles.paginationDot,
                  index === activeIndex && styles.paginationDotActive,
                ]}
              />
            ))}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isLastSlide ? 'Choose your role' : 'Next onboarding slide'
            }
            onPress={goToNext}
            style={({ pressed }) => [
              styles.nextButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={styles.nextButtonText}>
              {isLastSlide ? 'Choose your role' : 'Continue'}
            </Text>
            <Text style={styles.nextArrow}>→</Text>
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
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
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
  skip: {
    color: '#6B8193',
    fontSize: 13,
    fontWeight: '700',
  },
  slide: {
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingBottom: 24,
    width,
  },
  illustration: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: '#E8F3F2',
    borderRadius: 28,
    borderWidth: 1,
    height: 230,
    justifyContent: 'center',
    marginBottom: 48,
    overflow: 'hidden',
    width: width - 48,
  },
  illustrationHalo: {
    borderRadius: 90,
    height: 160,
    opacity: 0.14,
    position: 'absolute',
    width: 160,
  },
  illustrationIcon: {
    color: '#17324D',
    fontSize: 92,
    fontWeight: '300',
  },
  illustrationGrid: {
    bottom: 30,
    flexDirection: 'row',
    gap: 5,
    position: 'absolute',
  },
  gridLine: {
    backgroundColor: '#17324D',
    borderRadius: 2,
    height: 4,
    opacity: 0.5,
    width: 28,
  },
  gridLineShort: {
    backgroundColor: '#0F766E',
    width: 14,
  },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 16,
  },
  title: {
    color: '#17324D',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1.4,
    lineHeight: 42,
    maxWidth: width - 48,
  },
  description: {
    color: '#5D7182',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 18,
    maxWidth: width - 64,
  },
  footer: {
    paddingBottom: 16,
  },
  pagination: {
    flexDirection: 'row',
    gap: 7,
    marginBottom: 20,
  },
  paginationDot: {
    backgroundColor: '#C9D4DC',
    borderRadius: 3,
    height: 6,
    width: 6,
  },
  paginationDotActive: {
    backgroundColor: '#0F766E',
    width: 26,
  },
  nextButton: {
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
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  nextArrow: {
    color: '#5EEAD4',
    fontSize: 22,
    marginLeft: 12,
  },
});
