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

type Props = NativeStackScreenProps<RootStackParamList, 'CollegeFinder'>;

type College = {
  id: string;
  name: string;
  city: string;
  type: string;
  highlight: string;
  courses: string;
  color: string;
  icon: string;
};

const colleges: College[] = [
  {
    id: 'northstar',
    name: 'Northstar Institute of Design',
    city: 'Bengaluru',
    type: 'Design school',
    highlight: 'Project-led learning and studio mentorship.',
    courses: 'Design, interaction, innovation',
    color: '#6366F1',
    icon: '◇',
  },
  {
    id: 'civic-tech',
    name: 'Civic Technology University',
    city: 'Pune',
    type: 'University',
    highlight: 'Technology pathways with community impact.',
    courses: 'Computing, data, public systems',
    color: '#0F766E',
    icon: '◎',
  },
  {
    id: 'horizon',
    name: 'Horizon College of Applied Science',
    city: 'Hyderabad',
    type: 'College',
    highlight: 'Hands-on learning with industry projects.',
    courses: 'Technology, analytics, business',
    color: '#C26A1B',
    icon: '▥',
  },
];

const filters = ['All', 'Bengaluru', 'Pune', 'Hyderabad'];

export function CollegeFinderScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('All');
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const filteredColleges = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return colleges.filter((college) => {
      const matchesQuery =
        !normalizedQuery ||
        `${college.name} ${college.city} ${college.type} ${college.courses}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesFilter = filter === 'All' || college.city === filter;
      return matchesQuery && matchesFilter;
    });
  }, [filter, query]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to course comparison"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
          </Pressable>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>FIND YOUR PLACE</Text>
            <Text style={styles.title}>Search results</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Compare colleges"
            onPress={() => navigation.navigate('CollegeComparison')}
            style={styles.compareButton}
          >
            <Text style={styles.compareText}>Compare</Text>
          </Pressable>
        </View>

        <Text style={styles.description}>
          Explore institutions where your interests can become a learning
          experience.
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Search colleges"
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Search colleges or cities"
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
          {filters.map((item) => {
            const selected = filter === item;
            return (
              <Pressable
                accessibilityRole="radio"
                accessibilityState={{ selected }}
                key={item}
                onPress={() => setFilter(item)}
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
          <Text style={styles.sectionTitle}>Suggested for your path</Text>
          <Text style={styles.sectionMeta}>
            {filteredColleges.length} places
          </Text>
        </View>

        {filteredColleges.length ? (
          <View style={styles.list}>
            {filteredColleges.map((college) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open details for ${college.name}`}
                key={college.id}
                onPress={() =>
                  navigation.navigate('CollegeDetails', {
                    collegeId: college.id,
                  })
                }
                style={({ pressed }) => [
                  styles.collegeCard,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.collegeIcon,
                    { backgroundColor: `${college.color}18` },
                  ]}
                >
                  <Text
                    style={[styles.collegeIconText, { color: college.color }]}
                  >
                    {college.icon}
                  </Text>
                </View>
                <View style={styles.collegeCopy}>
                  <Text style={styles.collegeName}>{college.name}</Text>
                  <Text style={styles.collegeMeta}>
                    {college.city} · {college.type}
                  </Text>
                  <Text style={styles.collegeHighlight}>
                    {college.highlight}
                  </Text>
                  <Text style={styles.collegeCourses}>{college.courses}</Text>
                </View>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    savedIds.includes(college.id)
                      ? `Remove ${college.name} from saved colleges`
                      : `Save ${college.name}`
                  }
                  onPress={() =>
                    setSavedIds((ids) =>
                      ids.includes(college.id)
                        ? ids.filter((id) => id !== college.id)
                        : [...ids, college.id],
                    )
                  }
                  style={styles.saveButton}
                >
                  <Text style={styles.saveIcon}>
                    {savedIds.includes(college.id) ? '✓' : '+'}
                  </Text>
                </Pressable>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No colleges found yet</Text>
            <Text style={styles.emptyText}>
              Try another city or search term.
            </Text>
          </View>
        )}

        <Text style={styles.demoNote}>
          Demo directory · College programmes, admission details, and location
          data will be connected in a later batch.
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
  collegeCard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  collegeIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  collegeIconText: { fontSize: 21, fontWeight: '800' },
  collegeCopy: { flex: 1, paddingRight: 4 },
  collegeName: { color: '#17324D', fontSize: 14, fontWeight: '800' },
  collegeMeta: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  collegeHighlight: {
    color: '#6B8193',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 5,
  },
  collegeCourses: { color: '#7B8D9B', fontSize: 10, marginTop: 7 },
  saveButton: { padding: 5 },
  saveIcon: { color: '#0F766E', fontSize: 22, fontWeight: '700' },
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
