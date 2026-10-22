import { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type {
  FeatureRouteName,
  RootStackParamList,
} from '../../../app/AppNavigator';
import { BottomNavigation } from '../navigation/BottomNavigation';
import { colors, radii, spacing } from '../../theme';
import { useAuth } from '../../services/AuthProvider';
import { getAuthErrorMessage, signOutUser } from '../../services/auth-service';

type Props = NativeStackScreenProps<RootStackParamList, FeatureRouteName>;
type NextRoute =
  | FeatureRouteName
  | 'Home'
  | 'Explore'
  | 'Roadmap'
  | 'Applications'
  | 'Profile'
  | 'Login';

type Config = {
  eyebrow: string;
  title: string;
  description: string;
  items: string[];
  checklist?: string[];
  form?: string[];
  primary?: string;
  next?: NextRoute;
};

const configs: Record<FeatureRouteName, Config> = {
  AdmissionTimeline: {
    eyebrow: 'ADMISSIONS',
    title: 'Admission timeline',
    description: 'Track the milestones that matter for your next application.',
    items: [
      'Programme shortlist · Upcoming',
      'Application window · Upcoming',
      'Document review · Not started',
    ],
    primary: 'Open preparation',
    next: 'ApplicationPreparation',
  },
  ApplicationPreparation: {
    eyebrow: 'ADMISSIONS',
    title: 'Application preparation',
    description: 'A simple checklist for getting an application ready.',
    items: [],
    checklist: [
      'Confirm programme and institution',
      'Prepare academic records',
      'Review application deadline',
    ],
    primary: 'Open application form',
    next: 'ApplicationForm',
  },
  ApplicationForm: {
    eyebrow: 'APPLICATIONS',
    title: 'Application form',
    description:
      'Save a local draft while the application service is being connected.',
    items: [],
    form: ['Full name', 'Current level of study', 'Preferred programme'],
    primary: 'Save draft',
    next: 'DocumentUpload',
  },
  DocumentUpload: {
    eyebrow: 'APPLICATIONS',
    title: 'Documents',
    description:
      'Review required documents. File and camera integrations are not configured in this build.',
    items: [
      'Academic records · Required',
      'Identity document · Required',
      'Portfolio or supporting work · Optional',
    ],
    primary: 'Continue to preview',
    next: 'ApplicationPreview',
  },
  ApplicationPreview: {
    eyebrow: 'APPLICATIONS',
    title: 'Application preview',
    description:
      'Review the local draft before a real submission service is connected.',
    items: [
      'Personal details · Draft',
      'Academic details · Draft',
      'Documents · Not uploaded',
    ],
    primary: 'Open tracking',
    next: 'ApplicationTracking',
  },
  ApplicationTracking: {
    eyebrow: 'APPLICATIONS',
    title: 'Application tracking',
    description:
      'No submitted applications are available because submission is not connected.',
    items: ['Draft application · Local only'],
    primary: 'Return to preparation',
    next: 'ApplicationPreparation',
  },
  ScholarshipDiscovery: {
    eyebrow: 'SCHOLARSHIPS',
    title: 'Find scholarships',
    description:
      'Explore scholarship opportunities once verified opportunity data is connected.',
    items: ['No verified scholarships available in demo mode.'],
    primary: 'Check eligibility',
    next: 'ScholarshipEligibility',
  },
  ScholarshipDetails: {
    eyebrow: 'SCHOLARSHIPS',
    title: 'Scholarship details',
    description:
      'Verified award, deadline, and eligibility information will appear here.',
    items: [
      'Eligibility · Not verified',
      'Award amount · Not available',
      'Deadline · Not available',
    ],
    primary: 'Start eligibility check',
    next: 'ScholarshipEligibility',
  },
  ScholarshipEligibility: {
    eyebrow: 'SCHOLARSHIPS',
    title: 'Scholarship eligibility',
    description:
      'Answer only what is known. No eligibility decision is made without verified criteria.',
    items: [],
    checklist: [
      'Confirm current study level',
      'Confirm household or funding information',
      'Review scholarship criteria',
    ],
    primary: 'Open application',
    next: 'ScholarshipApplication',
  },
  ScholarshipApplication: {
    eyebrow: 'SCHOLARSHIPS',
    title: 'Scholarship application',
    description:
      'The application is unavailable until a verified scholarship provider is connected.',
    items: ['Application form · Not connected', 'Documents · Not connected'],
    primary: 'Open application tracking',
    next: 'ApplicationTracking',
  },
  LoanDiscovery: {
    eyebrow: 'FINANCIAL SUPPORT',
    title: 'Education loans',
    description:
      'Verified lender products will appear here when a lender data source is configured.',
    items: ['No verified loan products available in demo mode.'],
    primary: 'View loan details',
    next: 'LoanDetails',
  },
  LoanDetails: {
    eyebrow: 'FINANCIAL SUPPORT',
    title: 'Loan details',
    description:
      'Interest rates, repayment terms, and lender eligibility are intentionally not fabricated.',
    items: [
      'Lender · Not available',
      'Interest rate · Not verified',
      'Documents · Not available',
    ],
    primary: 'Return to loan discovery',
    next: 'LoanDiscovery',
  },
  LearningHub: {
    eyebrow: 'LEARNING',
    title: 'Learning hub',
    description: 'Find resources and continue learning at your own pace.',
    items: [
      'Career foundations · Resource collection',
      'Study skills · Resource collection',
      'Portfolio building · Resource collection',
    ],
    primary: 'Open resource details',
    next: 'LearningResourceDetails',
  },
  LearningResourceDetails: {
    eyebrow: 'LEARNING',
    title: 'Resource details',
    description:
      'This resource is a local catalogue entry; viewer and download services are not connected.',
    items: ['Format · Not available', 'Offline access · Not available'],
    primary: 'Open saved resources',
    next: 'SavedResources',
  },
  SavedResources: {
    eyebrow: 'LEARNING',
    title: 'Saved resources',
    description:
      'Your saved resources will appear here when persistence is connected.',
    items: ['No saved resources yet.'],
    primary: 'Browse learning hub',
    next: 'LearningHub',
  },
  DownloadedResources: {
    eyebrow: 'LEARNING',
    title: 'Downloaded resources',
    description: 'Saved bookmarks are not treated as downloaded files.',
    items: ['No downloaded resources available.'],
    primary: 'Open downloads manager',
    next: 'DownloadsManager',
  },
  MentorDiscovery: {
    eyebrow: 'MENTORSHIP',
    title: 'Find a mentor',
    description:
      'Mentor profiles and availability require a configured mentorship service.',
    items: ['No verified mentors available in demo mode.'],
    primary: 'Open mentor profile',
    next: 'MentorProfile',
  },
  MentorProfile: {
    eyebrow: 'MENTORSHIP',
    title: 'Mentor profile',
    description:
      'Verified biography, credentials, and availability will appear here.',
    items: ['Credentials · Not verified', 'Availability · Not available'],
    primary: 'View mentorship requests',
    next: 'MentorshipRequests',
  },
  MentorshipRequests: {
    eyebrow: 'MENTORSHIP',
    title: 'Mentorship requests',
    description:
      'Requests require the mentorship backend and are not simulated.',
    items: ['No mentorship requests available.'],
    primary: 'View sessions',
    next: 'MentorshipSessions',
  },
  MentorshipSessions: {
    eyebrow: 'MENTORSHIP',
    title: 'Mentorship sessions',
    description:
      'Sessions and meeting links appear only after a verified booking.',
    items: ['No upcoming sessions available.'],
    primary: 'Find a mentor',
    next: 'MentorDiscovery',
  },
  JobsInternships: {
    eyebrow: 'OPPORTUNITIES',
    title: 'Jobs and internships',
    description:
      'Verified opportunity listings will appear when the opportunities service is connected.',
    items: ['No verified jobs or internships available in demo mode.'],
    primary: 'Open job details',
    next: 'JobDetails',
  },
  JobDetails: {
    eyebrow: 'OPPORTUNITIES',
    title: 'Job details',
    description:
      'Role, organization, eligibility, and application links are not available without verified listing data.',
    items: ['Application · Not available'],
    primary: 'Return to opportunities',
    next: 'JobsInternships',
  },
  EventsCompetitions: {
    eyebrow: 'OPPORTUNITIES',
    title: 'Events and competitions',
    description:
      'Discover verified events when an events catalogue is configured.',
    items: ['No verified events available in demo mode.'],
    primary: 'Open event details',
    next: 'EventDetails',
  },
  EventDetails: {
    eyebrow: 'OPPORTUNITIES',
    title: 'Event details',
    description:
      'Registration links and event details are not fabricated without a verified source.',
    items: ['Registration · Not available'],
    primary: 'Return to events',
    next: 'EventsCompetitions',
  },
  Messages: {
    eyebrow: 'MESSAGES',
    title: 'Messages',
    description:
      'Messaging is unavailable because no messaging backend is configured.',
    items: ['No conversations available.'],
    primary: 'Return home',
    next: 'Home',
  },
  SavedOpportunities: {
    eyebrow: 'SAVED',
    title: 'Saved opportunities',
    description:
      'Saved items will use one shared persistence model when it is connected.',
    items: ['No saved opportunities yet.'],
    primary: 'Explore opportunities',
    next: 'Explore',
  },
  EditProfile: {
    eyebrow: 'PROFILE',
    title: 'Edit profile',
    description:
      'Update a local draft profile. Persistent profile services are not connected.',
    items: [],
    form: ['Full name', 'City or region', 'Primary interest'],
    primary: 'Save profile',
    next: 'Profile',
  },
  AccountSettings: {
    eyebrow: 'SETTINGS',
    title: 'Account settings',
    description:
      'Authentication and account persistence are currently demo-only.',
    items: [
      'Account email · Demo mode',
      'Password · Managed by authentication service when connected',
    ],
    primary: 'Privacy settings',
    next: 'PrivacySettings',
  },
  PrivacySettings: {
    eyebrow: 'SETTINGS',
    title: 'Privacy settings',
    description:
      'Only supported privacy controls should be enabled; no server-backed controls are active yet.',
    checklist: ['Review data use information', 'Review saved profile details'],
    items: [],
    primary: 'Accessibility settings',
    next: 'AccessibilitySettings',
  },
  AccessibilitySettings: {
    eyebrow: 'SETTINGS',
    title: 'Accessibility settings',
    description:
      'These preferences are local demo controls until settings persistence is connected.',
    checklist: [
      'Use larger text where supported',
      'Reduce motion where supported',
    ],
    items: [],
    primary: 'Language selection',
    next: 'LanguageSelection',
  },
  LanguageSelection: {
    eyebrow: 'SETTINGS',
    title: 'Language selection',
    description: 'Only English is currently supported by the application.',
    checklist: ['English (current language)'],
    items: [],
    primary: 'Notification preferences',
    next: 'NotificationPreferences',
  },
  NotificationPreferences: {
    eyebrow: 'SETTINGS',
    title: 'Notification preferences',
    description:
      'Notification delivery is not configured; these controls do not promise delivery.',
    checklist: ['Academic reminders', 'Opportunity updates'],
    items: [],
    primary: 'Downloads manager',
    next: 'DownloadsManager',
  },
  DownloadsManager: {
    eyebrow: 'DOWNLOADS',
    title: 'Downloads manager',
    description:
      'No download service is configured, so no files are represented as downloaded.',
    items: ['Storage usage · Not available', 'Queued downloads · None'],
    primary: 'Offline dashboard',
    next: 'OfflineDashboard',
  },
  OfflineDashboard: {
    eyebrow: 'OFFLINE',
    title: 'Offline dashboard',
    description: 'Offline caching and sync are not configured in this build.',
    items: ['Cached dashboard · Not available', 'Pending sync · None'],
    primary: 'Offline assessment',
    next: 'OfflineAssessment',
  },
  OfflineAssessment: {
    eyebrow: 'OFFLINE',
    title: 'Offline assessment',
    description:
      'Assessment content is not cached, so an offline attempt cannot start.',
    items: ['Download assessment content before using offline mode.'],
    primary: 'Offline results',
    next: 'OfflineAssessmentResults',
  },
  OfflineAssessmentResults: {
    eyebrow: 'OFFLINE',
    title: 'Offline assessment results',
    description:
      'No offline result is available because no offline assessment has been completed.',
    items: ['Pending synchronization · None'],
    primary: 'Pending sync queue',
    next: 'PendingSyncQueue',
  },
  PendingSyncQueue: {
    eyebrow: 'SYNC',
    title: 'Pending sync queue',
    description: 'No local operations are queued for synchronization.',
    items: ['Queue · Empty'],
    primary: 'Sync progress',
    next: 'SyncProgress',
  },
  SyncProgress: {
    eyebrow: 'SYNC',
    title: 'Sync progress',
    description:
      'Synchronization is unavailable because no sync service is configured.',
    items: ['Last sync · Not available', 'Current operation · None'],
    primary: 'Resolve conflicts',
    next: 'SyncConflictResolution',
  },
  SyncConflictResolution: {
    eyebrow: 'SYNC',
    title: 'Sync conflict resolution',
    description: 'No local or remote conflicts are available to resolve.',
    items: ['Conflicts · None'],
    primary: 'Return to offline dashboard',
    next: 'OfflineDashboard',
  },
  HelpSupport: {
    eyebrow: 'SUPPORT',
    title: 'Help and support',
    description:
      'Support content and contact details will be added from an approved source.',
    items: ['FAQ · Not configured', 'Contact support · Not configured'],
    primary: 'About Mantrix',
    next: 'AboutMantrix',
  },
  AboutMantrix: {
    eyebrow: 'ABOUT',
    title: 'About Mantrix',
    description:
      'Mantrix helps students discover a path and plan their future with clarity.',
    items: ['Version · 0.1.0', 'Build · Demo'],
    primary: 'Terms and conditions',
    next: 'TermsConditions',
  },
  TermsConditions: {
    eyebrow: 'LEGAL',
    title: 'Terms and conditions',
    description:
      'Approved legal content is not available in this build and must be reviewed before release.',
    items: ['Content pending legal approval.'],
    primary: 'Privacy policy',
    next: 'PrivacyPolicy',
  },
  PrivacyPolicy: {
    eyebrow: 'LEGAL',
    title: 'Privacy policy',
    description:
      'Approved privacy content is not available in this build and must be reviewed before release.',
    items: ['Content pending legal approval.'],
    primary: 'Privacy settings',
    next: 'PrivacySettings',
  },
  SessionExpired: {
    eyebrow: 'ACCOUNT ACCESS',
    title: 'Your session expired',
    description:
      'Sign in again to continue. Protected content is not available in this state.',
    items: ['No sensitive draft data was cleared by opening this screen.'],
    primary: 'Return to sign in',
    next: 'Login',
  },
  LogoutConfirmation: {
    eyebrow: 'ACCOUNT ACCESS',
    title: 'Sign out of Mantrix?',
    description:
      'Your account stays saved, but this device will no longer have an active session.',
    items: [
      'Cancel to return to your profile.',
      'You can sign in again at any time.',
    ],
    primary: 'Sign out',
    next: 'Profile',
  },
};

export function FeatureScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const config = configs[route.name];
  const [checked, setChecked] = useState<string[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [query, setQuery] = useState('');
  const filteredItems = useMemo(
    () =>
      config.items.filter((item) =>
        item.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [config.items, query],
  );

  function primaryAction() {
    if (config.form?.some((field) => !values[field]?.trim())) {
      Alert.alert(
        'Missing information',
        'Complete the required fields before continuing.',
      );
      return;
    }
    if (!config.next) {
      return;
    }
    if (route.name === 'LogoutConfirmation') {
      if (!user) {
        navigation.replace('Login');
        return;
      }
      void signOutUser()
        .then(() => undefined)
        .catch((error: unknown) =>
          Alert.alert('Unable to sign out', getAuthErrorMessage(error)),
        );
      return;
    }
    switch (config.next) {
      case 'Home':
      case 'Explore':
      case 'Roadmap':
      case 'Applications':
      case 'Profile':
      case 'Login':
        navigation.navigate(config.next);
        break;
      default:
        (navigation.navigate as (screen: string, params?: object) => void)(
          config.next,
          { featureId: config.next },
        );
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => navigation.goBack()}
          style={styles.back}
        >
          <Text style={styles.backText}>← Back</Text>
        </Pressable>
        <Text style={styles.eyebrow}>{config.eyebrow}</Text>
        <Text style={styles.title}>{config.title}</Text>
        <Text style={styles.description}>{config.description}</Text>

        {config.form?.map((field) => (
          <View key={field} style={styles.field}>
            <Text style={styles.label}>{field} *</Text>
            <TextInput
              accessibilityLabel={field}
              onChangeText={(value) =>
                setValues((current) => ({ ...current, [field]: value }))
              }
              placeholder={`Enter ${field.toLowerCase()}`}
              placeholderTextColor={colors.mutedText}
              style={styles.input}
              value={values[field] ?? ''}
            />
          </View>
        ))}

        {config.items.length > 2 ? (
          <TextInput
            accessibilityLabel="Search this section"
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors.mutedText}
            style={styles.input}
            value={query}
          />
        ) : null}

        <View style={styles.list}>
          {filteredItems.map((item) => (
            <View key={item} style={styles.card}>
              <Text style={styles.cardIcon}>•</Text>
              <Text style={styles.cardText}>{item}</Text>
            </View>
          ))}
        </View>

        {config.checklist?.map((item) => {
          const selected = checked.includes(item);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: selected }}
              key={item}
              onPress={() =>
                setChecked((current) =>
                  selected
                    ? current.filter((value) => value !== item)
                    : [...current, item],
                )
              }
              style={[styles.card, selected && styles.cardSelected]}
            >
              <Text style={styles.checkbox}>{selected ? '✓' : '○'}</Text>
              <Text style={styles.cardText}>{item}</Text>
            </Pressable>
          );
        })}

        {config.items.length === 0 && !config.checklist && !config.form ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Nothing to show yet</Text>
            <Text style={styles.emptyText}>
              This feature will become available when its supported service is
              connected.
            </Text>
          </View>
        ) : null}

        <Pressable
          accessibilityRole="button"
          onPress={primaryAction}
          style={styles.primary}
        >
          <Text style={styles.primaryText}>{config.primary ?? 'Continue'}</Text>
          <Text style={styles.arrow}>→</Text>
        </Pressable>
        <Text style={styles.note}>
          Demo state · No unsupported backend operation or success result is
          being simulated.
        </Text>
      </ScrollView>
      <BottomNavigation
        activeTab="Home"
        onTabPress={(tab) => navigation.navigate(tab)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.background, flex: 1 },
  container: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  back: { alignSelf: 'flex-start', paddingVertical: spacing.sm },
  backText: { color: colors.bodyText, fontSize: 14, fontWeight: '700' },
  eyebrow: {
    color: colors.secondary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: spacing.lg,
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
  field: { gap: spacing.sm, marginTop: spacing.lg },
  label: { color: colors.text, fontSize: 13, fontWeight: '700' },
  input: {
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    color: colors.text,
    minHeight: 48,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  list: { gap: spacing.md, marginTop: spacing.xl },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.md,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
  },
  cardSelected: {
    backgroundColor: colors.tealSurface,
    borderColor: colors.secondary,
  },
  cardIcon: { color: colors.secondary, fontSize: 24 },
  checkbox: { color: colors.secondary, fontSize: 20, fontWeight: '800' },
  cardText: { color: colors.text, flex: 1, fontSize: 14, lineHeight: 20 },
  empty: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    marginTop: spacing.xl,
    padding: spacing.xxxl,
  },
  emptyTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  emptyText: {
    color: colors.bodyText,
    fontSize: 13,
    lineHeight: 19,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  primary: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xxxl,
    minHeight: 54,
  },
  primaryText: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  arrow: { color: colors.accent, fontSize: 22, marginLeft: spacing.md },
  note: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 17,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
});
