import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';

type Props = NativeStackScreenProps<RootStackParamList, 'CourseDiscovery'>;

type Course = {
  id: string;
  title: string;
  provider: string;
  mode: string;
  duration: string;
  category: string;
  description: string;
  color: string;
  icon: string;
  tags: string[];
};

const courses: Course[] = [
  {
    id: 'design-thinking',
    title: 'Design Thinking Foundations',
    provider: 'Mantrix Learning Studio',
    mode: 'Self-paced',
    duration: '4 weeks',
    category: 'Design',
    description: 'Learn to turn human needs into thoughtful solutions.',
    color: '#6366F1',
    icon: '◇',
    tags: ['Beginner', 'Project-based'],
  },
  {
    id: 'data-storytelling',
    title: 'Data and Storytelling',
    provider: 'Open Skills Academy',
    mode: 'Live cohort',
    duration: '6 weeks',
    category: 'Technology',
    description: 'Find patterns and communicate insights with clarity.',
    color: '#0F766E',
    icon: '▥',
    tags: ['Beginner', 'Practical'],
  },
  {
    id: 'community-projects',
    title: 'Community Project Lab',
    provider: 'Impact Works',
    mode: 'Mentored',
    duration: '8 weeks',
    category: 'Impact',
    description: 'Design and test a small project for your community.',
    color: '#C26A1B',
    icon: '◎',
    tags: ['Team-based', 'Portfolio'],
  },
  {
    id: 'coding-starter',
    title: 'Build with Code',
    provider: 'Future Builders',
    mode: 'Self-paced',
    duration: '5 weeks',
    category: 'Technology',
    description: 'Create your first useful tool through guided practice.',
    color: '#17324D',
    icon: '</>',
    tags: ['Hands-on', 'Beginner'],
  },
];

const categories = ['All', 'Technology', 'Design', 'Impact'];

export function CourseDiscoveryScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filteredCourses = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery =
        !normalizedQuery ||
        `${course.title} ${course.provider} ${course.description} ${course.tags.join(' ')}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        category === 'All' ||
        course.category.toLowerCase() === category.toLowerCase();
      return matchesQuery && matchesCategory;
    });
  }, [category, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to home"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>LEARN WITH PURPOSE</Text>
            <Text style={styles.title}>Course discovery</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Compare courses"
            onPress={() => navigation.navigate('CourseComparison')}
            style={styles.compareButton}
          >
            <Text style={styles.compareText}>Compare</Text>
          </Pressable>
        </View>

        <Text style={styles.description}>
          Find courses that help you turn curiosity into skills and real
          progress.
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Search courses"
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Search courses or skills"
            placeholderTextColor="#9AAAB5"
            style={styles.searchInput}
            value={query}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.filterContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map((item) => {
            const selected = category === item;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={item}
                onPress={() => setCategory(item)}
                style={[styles.filter, selected && styles.filterSelected]}
              >
                <Text
                  style={[
                    styles.filterText,
                    selected && styles.filterTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recommended to explore</Text>
          <Text style={styles.sectionMeta}>
            {filteredCourses.length} courses
          </Text>
        </View>

        {filteredCourses.length ? (
          <View style={styles.list}>
            {filteredCourses.map((course) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${course.title}`}
                key={course.id}
                onPress={() =>
                  navigation.navigate('CourseDetails', { courseId: course.id })
                }
                style={({ pressed }) => [
                  styles.courseCard,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.courseIcon,
                    { backgroundColor: `${course.color}18` },
                  ]}
                >
                  <Text
                    style={[styles.courseIconText, { color: course.color }]}
                  >
                    {course.icon}
                  </Text>
                </View>
                <View style={styles.courseCopy}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <Text style={styles.provider}>{course.provider}</Text>
                  <View style={styles.metaRow}>
                    <Text style={styles.meta}>{course.mode}</Text>
                    <Text style={styles.metaDivider}>•</Text>
                    <Text style={styles.meta}>{course.duration}</Text>
                  </View>
                  <Text style={styles.courseDescription}>
                    {course.description}
                  </Text>
                  <View style={styles.tags}>
                    {course.tags.map((tag) => (
                      <Text key={tag} style={styles.tag}>
                        {tag}
                      </Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.courseArrow}>→</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No courses found yet</Text>
            <Text style={styles.emptyText}>
              Try a different search or explore all categories.
            </Text>
          </View>
        )}

        <Text style={styles.demoNote}>
          Demo catalogue · Course availability and recommendations will use
          connected education data when available.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: '#F7FAFC', flex: 1 },
  container: { padding: 20, paddingBottom: 32 },
  header: { alignItems: 'center', flexDirection: 'row', minHeight: 48 },
  backButton: { padding: 8 },
  backArrow: { color: '#17324D', fontSize: 27 },
  headerCopy: { flex: 1, marginLeft: 8 },
  compareButton: { padding: 8 },
  compareText: { color: '#0F766E', fontSize: 11, fontWeight: '800' },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: { color: '#17324D', fontSize: 27, fontWeight: '800', marginTop: 5 },
  description: {
    color: '#5D7182',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 20,
  },
  searchBox: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    marginTop: 20,
    minHeight: 50,
    paddingHorizontal: 14,
  },
  searchIcon: { color: '#7B8D9B', fontSize: 24, marginRight: 8 },
  searchInput: { color: '#17324D', flex: 1, fontSize: 14 },
  filterContent: { gap: 8, paddingVertical: 16 },
  filter: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 15,
    paddingVertical: 9,
  },
  filterSelected: { backgroundColor: '#E8F3F2', borderColor: '#0F766E' },
  filterText: { color: '#6B8193', fontSize: 12, fontWeight: '700' },
  filterTextSelected: { color: '#0F766E' },
  sectionHeader: {
    alignItems: 'baseline',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  sectionTitle: { color: '#17324D', fontSize: 18, fontWeight: '800' },
  sectionMeta: { color: '#7B8D9B', fontSize: 10, fontWeight: '700' },
  list: { gap: 10, marginTop: 13 },
  courseCard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  courseIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  courseIconText: { fontSize: 19, fontWeight: '800' },
  courseCopy: { flex: 1, paddingRight: 4 },
  courseTitle: { color: '#17324D', fontSize: 14, fontWeight: '800' },
  provider: { color: '#0F766E', fontSize: 10, fontWeight: '700', marginTop: 3 },
  metaRow: { alignItems: 'center', flexDirection: 'row', marginTop: 5 },
  meta: { color: '#7B8D9B', fontSize: 10, fontWeight: '700' },
  metaDivider: { color: '#B2C0C9', fontSize: 10, marginHorizontal: 5 },
  courseDescription: {
    color: '#6B8193',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginTop: 8 },
  tag: {
    backgroundColor: '#F0F4F6',
    borderRadius: 8,
    color: '#5D7182',
    fontSize: 9,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  courseArrow: { color: '#0F766E', fontSize: 20, marginTop: 14 },
  pressed: { opacity: 0.78 },
  empty: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 13,
    padding: 24,
  },
  emptyTitle: { color: '#17324D', fontSize: 15, fontWeight: '800' },
  emptyText: {
    color: '#6B8193',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
  },
  demoNote: {
    color: '#7B8D9B',
    fontSize: 10,
    lineHeight: 16,
    marginTop: 24,
    textAlign: 'center',
  },
});
