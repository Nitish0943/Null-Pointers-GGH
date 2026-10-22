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

type Props = NativeStackScreenProps<RootStackParamList, 'CareerExploration'>;

type Career = {
  id: string;
  title: string;
  category: string;
  description: string;
  color: string;
  icon: string;
  tags: string[];
};

const careers: Career[] = [
  {
    id: 'product-designer',
    title: 'Product Designer',
    category: 'Design & technology',
    description: 'Shape useful digital experiences around real human needs.',
    color: '#6366F1',
    icon: '◇',
    tags: ['Creative', 'People-aware'],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    category: 'Technology & insight',
    description: 'Turn patterns in information into clearer decisions.',
    color: '#0F766E',
    icon: '▥',
    tags: ['Curious', 'Problem-solving'],
  },
  {
    id: 'community-strategist',
    title: 'Community Strategist',
    category: 'People & impact',
    description: 'Build programmes that help people move forward together.',
    color: '#C26A1B',
    icon: '◎',
    tags: ['Empathetic', 'Organised'],
  },
  {
    id: 'software-developer',
    title: 'Software Developer',
    category: 'Technology & building',
    description: 'Create practical tools that solve meaningful problems.',
    color: '#17324D',
    icon: '</>',
    tags: ['Logical', 'Hands-on'],
  },
];

const categories = ['All', 'Technology', 'Design', 'Impact'];

export function CareerExplorationScreen({ navigation }: Props) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');

  const filteredCareers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return careers.filter((career) => {
      const matchesQuery =
        !normalizedQuery ||
        `${career.title} ${career.category} ${career.description}`
          .toLowerCase()
          .includes(normalizedQuery);
      const matchesCategory =
        category === 'All' ||
        career.category.toLowerCase().includes(category.toLowerCase());
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
            <Text style={styles.eyebrow}>EXPLORE POSSIBILITIES</Text>
            <Text style={styles.title}>Career exploration</Text>
          </View>
          <View style={styles.headerSpacer} />
        </View>

        <Text style={styles.description}>
          Browse paths that connect your strengths with work that matters to
          you.
        </Text>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            accessibilityLabel="Search careers"
            autoCapitalize="none"
            onChangeText={setQuery}
            placeholder="Search careers or skills"
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
          <Text style={styles.sectionTitle}>Paths for your curiosity</Text>
          <Text style={styles.sectionMeta}>{filteredCareers.length} paths</Text>
        </View>

        {filteredCareers.length ? (
          <View style={styles.list}>
            {filteredCareers.map((career) => (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Open ${career.title}`}
                key={career.id}
                onPress={() =>
                  navigation.navigate('CareerDetails', { careerId: career.id })
                }
                style={({ pressed }) => [
                  styles.careerCard,
                  pressed && styles.pressed,
                ]}
              >
                <View
                  style={[
                    styles.careerIcon,
                    { backgroundColor: `${career.color}18` },
                  ]}
                >
                  <Text
                    style={[styles.careerIconText, { color: career.color }]}
                  >
                    {career.icon}
                  </Text>
                </View>
                <View style={styles.careerCopy}>
                  <Text style={styles.careerTitle}>{career.title}</Text>
                  <Text style={styles.careerCategory}>{career.category}</Text>
                  <Text style={styles.careerDescription}>
                    {career.description}
                  </Text>
                  <View style={styles.tags}>
                    {career.tags.map((tag) => (
                      <Text key={tag} style={styles.tag}>
                        {tag}
                      </Text>
                    ))}
                  </View>
                </View>
                <Text style={styles.careerArrow}>→</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No paths found yet</Text>
            <Text style={styles.emptyText}>
              Try a different search or explore all categories.
            </Text>
          </View>
        )}

        <Text style={styles.demoNote}>
          Demo catalogue · Career matches will use your profile and live
          opportunity data when connected.
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
  headerSpacer: { width: 43 },
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
  careerCard: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    padding: 14,
  },
  careerIcon: {
    alignItems: 'center',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    marginRight: 12,
    width: 48,
  },
  careerIconText: { fontSize: 20, fontWeight: '800' },
  careerCopy: { flex: 1, paddingRight: 6 },
  careerTitle: { color: '#17324D', fontSize: 14, fontWeight: '800' },
  careerCategory: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3,
  },
  careerDescription: {
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
  careerArrow: { color: '#0F766E', fontSize: 20, marginTop: 14 },
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
