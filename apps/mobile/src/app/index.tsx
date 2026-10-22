import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Index() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.eyebrow}>Education and career guidance</Text>
      <Text style={styles.title}>Mantrix</Text>
      <Text style={styles.tagline}>Discover Your Path. Plan Your Future.</Text>
      <Text style={styles.description}>
        A future-ready place for assessment-led guidance, education discovery,
        and career planning.
      </Text>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Coming together in one place</Text>
        <Text style={styles.cardCopy}>
          This Expo foundation is ready for onboarding, student guidance, and
          shared platform features.
        </Text>
      </View>
      <Text style={styles.sectionTitle}>Planned areas</Text>
      {[
        'Assessment and career guidance',
        'Courses and colleges',
        'Scholarships and education loans',
        'Mentors, jobs, and opportunities',
      ].map((area) => (
        <View key={area} style={styles.item}>
          <Text style={styles.itemMark}>↗</Text>
          <Text style={styles.itemText}>{area}</Text>
        </View>
      ))}
      <Text style={styles.status}>
        Development foundation · Features not implemented
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#0c1222',
    flexGrow: 1,
    padding: 28,
    paddingTop: 72,
  },
  eyebrow: {
    color: '#9eaeff',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    color: '#ffffff',
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
    marginTop: 20,
  },
  tagline: {
    color: '#d6dcff',
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 31,
    marginTop: 10,
  },
  description: {
    color: '#bec6d8',
    fontSize: 16,
    lineHeight: 25,
    marginTop: 20,
  },
  card: {
    backgroundColor: '#1d2848',
    borderColor: '#2e3a5c',
    borderRadius: 16,
    borderWidth: 1,
    marginTop: 36,
    padding: 20,
  },
  cardTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  cardCopy: {
    color: '#bec6d8',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 8,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '700',
    marginTop: 42,
  },
  item: {
    alignItems: 'center',
    borderBottomColor: '#29324b',
    borderBottomWidth: 1,
    flexDirection: 'row',
    paddingVertical: 16,
  },
  itemMark: {
    color: '#8494ff',
    fontSize: 18,
    marginRight: 12,
  },
  itemText: {
    color: '#d5dcf0',
    flex: 1,
    fontSize: 15,
  },
  status: {
    color: '#75809a',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 32,
  },
});
