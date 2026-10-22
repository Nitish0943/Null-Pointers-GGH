import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';
import {
  BottomNavigation,
  type PrimaryTab,
} from '../../../shared/components/navigation/BottomNavigation';
import { colors, radii, spacing } from '../../../shared/theme';

type Navigation = NativeStackNavigationProp<RootStackParamList>;
type Hub = Exclude<PrimaryTab, 'Home'>;

type Props = {
  navigation: Navigation;
  hub: Hub;
};

type Link = {
  title: string;
  description: string;
  icon: string;
  action: (navigation: Navigation) => void;
};

const links: Record<Hub, Link[]> = {
  Explore: [
    {
      title: 'Career exploration',
      description: 'Browse paths that match your interests.',
      icon: '◇',
      action: (navigation) => navigation.navigate('CareerExploration'),
    },
    {
      title: 'Course discovery',
      description: 'Compare learning options and providers.',
      icon: '▣',
      action: (navigation) => navigation.navigate('CourseDiscovery'),
    },
    {
      title: 'College finder',
      description: 'Search and compare places to study.',
      icon: '▥',
      action: (navigation) => navigation.navigate('CollegeFinder'),
    },
    {
      title: 'Learning hub',
      description: 'Find resources for your next step.',
      icon: '▤',
      action: (navigation) =>
        navigation.navigate('LearningHub', { featureId: 'LearningHub' }),
    },
    {
      title: 'Mentors',
      description: 'Mentor discovery is available from this hub.',
      icon: '○',
      action: (navigation) =>
        navigation.navigate('MentorDiscovery', {
          featureId: 'MentorDiscovery',
        }),
    },
    {
      title: 'Jobs and internships',
      description: 'Browse verified opportunities when connected.',
      icon: '↗',
      action: (navigation) =>
        navigation.navigate('JobsInternships', {
          featureId: 'JobsInternships',
        }),
    },
    {
      title: 'Events and competitions',
      description: 'Find upcoming opportunities when connected.',
      icon: '◇',
      action: (navigation) =>
        navigation.navigate('EventsCompetitions', {
          featureId: 'EventsCompetitions',
        }),
    },
    {
      title: 'Messages',
      description: 'Messaging availability and status.',
      icon: '·',
      action: (navigation) =>
        navigation.navigate('Messages', { featureId: 'Messages' }),
    },
  ],
  Roadmap: [
    {
      title: 'Start assessment',
      description: 'Build a clearer picture of your strengths.',
      icon: '✦',
      action: (navigation) => navigation.navigate('CognitiveAssessmentIntro'),
    },
    {
      title: 'Assessment results',
      description: 'Review your latest guidance snapshot.',
      icon: '◎',
      action: (navigation) => navigation.navigate('AssessmentResults'),
    },
    {
      title: 'Personalized roadmap',
      description: 'Turn your insights into practical next moves.',
      icon: '≋',
      action: (navigation) => navigation.navigate('PersonalizedCareerRoadmap'),
    },
    {
      title: 'AI assessment explanation',
      description: 'Understand how your guidance is framed.',
      icon: '✦',
      action: (navigation) => navigation.navigate('AIAssessmentExplanation'),
    },
    {
      title: 'Offline assessment',
      description: 'Check whether offline content is available.',
      icon: '○',
      action: (navigation) =>
        navigation.navigate('OfflineAssessment', {
          featureId: 'OfflineAssessment',
        }),
    },
  ],
  Applications: [
    {
      title: 'College preparation',
      description: 'Check what to prepare before applying.',
      icon: '▤',
      action: (navigation) =>
        navigation.navigate('AdmissionTimeline', {
          featureId: 'AdmissionTimeline',
        }),
    },
    {
      title: 'Application form',
      description: 'Save a local application draft.',
      icon: '▣',
      action: (navigation) =>
        navigation.navigate('ApplicationForm', {
          featureId: 'ApplicationForm',
        }),
    },
    {
      title: 'Application tracking',
      description: 'Review draft and submitted application status.',
      icon: '≋',
      action: (navigation) =>
        navigation.navigate('ApplicationTracking', {
          featureId: 'ApplicationTracking',
        }),
    },
    {
      title: 'Scholarships',
      description: 'Explore verified scholarship data when connected.',
      icon: '$',
      action: (navigation) =>
        navigation.navigate('ScholarshipDiscovery', {
          featureId: 'ScholarshipDiscovery',
        }),
    },
  ],
  Profile: [
    {
      title: 'View profile',
      description: 'Update your student setup and interests.',
      icon: '○',
      action: (navigation) => navigation.navigate('StudentProfileSetup'),
    },
    {
      title: 'Notifications',
      description: 'Review updates and reminders.',
      icon: '♢',
      action: (navigation) => navigation.navigate('Notifications'),
    },
    {
      title: 'Account settings',
      description:
        'Settings will be connected when account persistence is enabled.',
      icon: '≡',
      action: () =>
        Alert.alert(
          'Account settings',
          'Account settings are not connected in demo mode yet.',
        ),
    },
    {
      title: 'Edit profile',
      description: 'Update your local profile draft.',
      icon: '✎',
      action: (navigation) =>
        navigation.navigate('EditProfile', { featureId: 'EditProfile' }),
    },
    {
      title: 'Saved opportunities',
      description: 'Review saved items across feature areas.',
      icon: '+',
      action: (navigation) =>
        navigation.navigate('SavedOpportunities', {
          featureId: 'SavedOpportunities',
        }),
    },
    {
      title: 'Accessibility settings',
      description: 'Review supported accessibility preferences.',
      icon: '◌',
      action: (navigation) =>
        navigation.navigate('AccessibilitySettings', {
          featureId: 'AccessibilitySettings',
        }),
    },
    {
      title: 'Help and support',
      description: 'Review support availability.',
      icon: '?',
      action: (navigation) =>
        navigation.navigate('HelpSupport', { featureId: 'HelpSupport' }),
    },
  ],
};

const headings: Record<
  Hub,
  { eyebrow: string; title: string; description: string }
> = {
  Explore: {
    eyebrow: 'EXPLORE',
    title: 'Find your next direction.',
    description:
      'Move from curiosity to a shortlist of paths, courses, and colleges.',
  },
  Roadmap: {
    eyebrow: 'YOUR ROADMAP',
    title: 'Keep moving with clarity.',
    description:
      'Return to your assessment insights and the next steps built around you.',
  },
  Applications: {
    eyebrow: 'APPLICATIONS',
    title: 'Prepare with confidence.',
    description:
      'Keep your college preparation and future application support in one place.',
  },
  Profile: {
    eyebrow: 'YOUR PROFILE',
    title: 'Make Mantrix yours.',
    description:
      'Keep your student context current so every recommendation stays useful.',
  },
};

export function StudentHubScreen({ hub, navigation }: Props) {
  const heading = headings[hub];

  function selectTab(tab: PrimaryTab) {
    if (tab === 'Home') {
      navigation.navigate('Home');
      return;
    }
    navigation.navigate(tab);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>{heading.eyebrow}</Text>
        <Text style={styles.title}>{heading.title}</Text>
        <Text style={styles.description}>{heading.description}</Text>

        <View style={styles.list}>
          {links[hub].map((link) => (
            <Pressable
              accessibilityLabel={link.title}
              accessibilityRole="button"
              key={link.title}
              onPress={() => link.action(navigation)}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <View style={styles.icon}>
                <Text style={styles.iconText}>{link.icon}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={styles.cardTitle}>{link.title}</Text>
                <Text style={styles.cardDescription}>{link.description}</Text>
              </View>
              <Text style={styles.arrow}>→</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.note}>
          Demo navigation · Live data and account persistence will be connected
          when the corresponding services are configured.
        </Text>
      </ScrollView>
      <BottomNavigation activeTab={hub} onTabPress={selectTab} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  eyebrow: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: spacing.sm,
  },
  title: {
    color: colors.text,
    fontSize: 31,
    fontWeight: '800',
    letterSpacing: -1,
    lineHeight: 38,
    marginTop: spacing.md,
  },
  description: {
    color: colors.bodyText,
    fontSize: 15,
    lineHeight: 22,
    marginTop: spacing.md,
  },
  list: { gap: spacing.md, marginTop: spacing.xxxl },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 92,
    padding: spacing.lg,
  },
  icon: {
    alignItems: 'center',
    backgroundColor: colors.tealSurface,
    borderRadius: radii.md,
    height: 44,
    justifyContent: 'center',
    marginRight: spacing.md,
    width: 44,
  },
  iconText: { color: colors.secondary, fontSize: 22 },
  copy: { flex: 1 },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  cardDescription: {
    color: colors.bodyText,
    fontSize: 12,
    lineHeight: 18,
    marginTop: spacing.xs,
  },
  arrow: { color: colors.secondary, fontSize: 21, marginLeft: spacing.sm },
  note: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.xxxl,
  },
  pressed: { opacity: 0.78 },
});

export function ExploreScreen({ navigation }: { navigation: Navigation }) {
  return <StudentHubScreen hub="Explore" navigation={navigation} />;
}

export function RoadmapScreen({ navigation }: { navigation: Navigation }) {
  return <StudentHubScreen hub="Roadmap" navigation={navigation} />;
}

export function ApplicationsScreen({ navigation }: { navigation: Navigation }) {
  return <StudentHubScreen hub="Applications" navigation={navigation} />;
}

export function ProfileScreen({ navigation }: { navigation: Navigation }) {
  return <StudentHubScreen hub="Profile" navigation={navigation} />;
}
