import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { colors } from '../shared/theme';
import { HomeScreen } from '../features/dashboard/screens/HomeScreen';
import {
  ApplicationsScreen,
  ExploreScreen,
  ProfileScreen,
  RoadmapScreen,
} from '../features/dashboard/screens/StudentHubScreen';
import { AssessmentScreen } from '../features/assessment/screens/AssessmentScreen';
import { AssessmentProgressScreen } from '../features/assessment/screens/AssessmentProgressScreen';
import { AssessmentResultsScreen } from '../features/assessment/screens/AssessmentResultsScreen';
import { AIAssessmentExplanationScreen } from '../features/career-guidance/screens/AIAssessmentExplanationScreen';
import { CareerDetailsScreen } from '../features/career-guidance/screens/CareerDetailsScreen';
import { CareerExplorationScreen } from '../features/career-guidance/screens/CareerExplorationScreen';
import { CourseDetailsScreen } from '../features/courses/screens/CourseDetailsScreen';
import { CourseDiscoveryScreen } from '../features/courses/screens/CourseDiscoveryScreen';
import { CourseComparisonScreen } from '../features/courses/screens/CourseComparisonScreen';
import { CollegeFinderScreen } from '../features/colleges/screens/CollegeFinderScreen';
import { CollegeDetailsScreen } from '../features/colleges/screens/CollegeDetailsScreen';
import { CollegeComparisonScreen } from '../features/colleges/screens/CollegeComparisonScreen';
import { AdmissionEligibilityScreen } from '../features/colleges/screens/AdmissionEligibilityScreen';
import { PersonalizedCareerRoadmapScreen } from '../features/career-guidance/screens/PersonalizedCareerRoadmapScreen';
import { CognitiveAssessmentIntroScreen } from '../features/assessment/screens/CognitiveAssessmentIntroScreen';
import { EmailVerificationScreen } from '../features/auth/screens/EmailVerificationScreen';
import { ForgotPasswordScreen } from '../features/auth/screens/ForgotPasswordScreen';
import { LoginScreen } from '../features/auth/screens/LoginScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { OnboardingSlidesScreen } from '../features/onboarding/screens/OnboardingSlidesScreen';
import { RoleSelectionScreen } from '../features/onboarding/screens/RoleSelectionScreen';
import { SignupScreen } from '../features/auth/screens/SignupScreen';
import { SplashScreen } from '../features/splash/screens/SplashScreen';
import { StudentOnboardingScreen } from '../features/onboarding/screens/StudentOnboardingScreen';
import { StudentProfileSetupScreen } from '../features/profile/screens/StudentProfileSetupScreen';
import { WelcomeScreen } from '../features/onboarding/screens/WelcomeScreen';
import { FeatureScreen } from '../shared/components/feedback/FeatureScreen';
import { useAuth } from '../shared/services/AuthProvider';

export type FeatureRouteName =
  | 'AdmissionTimeline'
  | 'ApplicationPreparation'
  | 'ApplicationForm'
  | 'DocumentUpload'
  | 'ApplicationPreview'
  | 'ApplicationTracking'
  | 'ScholarshipDiscovery'
  | 'ScholarshipDetails'
  | 'ScholarshipEligibility'
  | 'ScholarshipApplication'
  | 'LoanDiscovery'
  | 'LoanDetails'
  | 'LearningHub'
  | 'LearningResourceDetails'
  | 'SavedResources'
  | 'DownloadedResources'
  | 'MentorDiscovery'
  | 'MentorProfile'
  | 'MentorshipRequests'
  | 'MentorshipSessions'
  | 'JobsInternships'
  | 'JobDetails'
  | 'EventsCompetitions'
  | 'EventDetails'
  | 'Messages'
  | 'SavedOpportunities'
  | 'EditProfile'
  | 'AccountSettings'
  | 'PrivacySettings'
  | 'AccessibilitySettings'
  | 'LanguageSelection'
  | 'NotificationPreferences'
  | 'DownloadsManager'
  | 'OfflineDashboard'
  | 'OfflineAssessment'
  | 'OfflineAssessmentResults'
  | 'PendingSyncQueue'
  | 'SyncProgress'
  | 'SyncConflictResolution'
  | 'HelpSupport'
  | 'AboutMantrix'
  | 'TermsConditions'
  | 'PrivacyPolicy'
  | 'SessionExpired'
  | 'LogoutConfirmation';

type CoreStackParamList = {
  Splash: undefined;
  Welcome: undefined;
  Onboarding: undefined;
  RoleSelection: undefined;
  Login: undefined;
  Signup: undefined;
  ForgotPassword: undefined;
  EmailVerification: { email: string };
  StudentOnboarding: undefined;
  StudentProfileSetup: undefined;
  Home: undefined;
  Explore: undefined;
  Roadmap: undefined;
  Applications: undefined;
  Profile: undefined;
  Notifications: undefined;
  CognitiveAssessmentIntro: undefined;
  Assessment: undefined;
  AssessmentProgress: undefined;
  AssessmentResults: undefined;
  AIAssessmentExplanation: undefined;
  PersonalizedCareerRoadmap: undefined;
  CareerExploration: undefined;
  CareerDetails: { careerId: string };
  CourseDiscovery: undefined;
  CourseDetails: { courseId: string };
  CourseComparison: undefined;
  CollegeFinder: undefined;
  CollegeDetails: { collegeId: string };
  CollegeComparison: undefined;
  AdmissionEligibility: { collegeId: string };
};

export type RootStackParamList = CoreStackParamList & {
  [K in FeatureRouteName]: { featureId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const featureRoutes: FeatureRouteName[] = [
  'AdmissionTimeline',
  'ApplicationPreparation',
  'ApplicationForm',
  'DocumentUpload',
  'ApplicationPreview',
  'ApplicationTracking',
  'ScholarshipDiscovery',
  'ScholarshipDetails',
  'ScholarshipEligibility',
  'ScholarshipApplication',
  'LoanDiscovery',
  'LoanDetails',
  'LearningHub',
  'LearningResourceDetails',
  'SavedResources',
  'DownloadedResources',
  'MentorDiscovery',
  'MentorProfile',
  'MentorshipRequests',
  'MentorshipSessions',
  'JobsInternships',
  'JobDetails',
  'EventsCompetitions',
  'EventDetails',
  'Messages',
  'SavedOpportunities',
  'EditProfile',
  'AccountSettings',
  'PrivacySettings',
  'AccessibilitySettings',
  'LanguageSelection',
  'NotificationPreferences',
  'DownloadsManager',
  'OfflineDashboard',
  'OfflineAssessment',
  'OfflineAssessmentResults',
  'PendingSyncQueue',
  'SyncProgress',
  'SyncConflictResolution',
  'HelpSupport',
  'AboutMantrix',
  'TermsConditions',
  'PrivacyPolicy',
  'SessionExpired',
  'LogoutConfirmation',
];

export function AppNavigator() {
  const { isLoading, profile, user } = useAuth();
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <Stack.Navigator
      key={user ? 'authenticated' : 'public'}
      initialRouteName={
        user
          ? user.emailVerified
            ? profile?.onboardingCompleted
              ? 'Home'
              : 'StudentOnboarding'
            : 'EmailVerification'
          : 'Welcome'
      }
      screenOptions={{
        contentStyle: { backgroundColor: colors.primary },
        headerShown: false,
      }}
    >
      {!user ? (
        <>
          <Stack.Screen component={WelcomeScreen} name="Welcome" />
          <Stack.Screen component={OnboardingSlidesScreen} name="Onboarding" />
          <Stack.Screen component={RoleSelectionScreen} name="RoleSelection" />
          <Stack.Screen component={LoginScreen} name="Login" />
          <Stack.Screen component={SignupScreen} name="Signup" />
          <Stack.Screen
            component={ForgotPasswordScreen}
            name="ForgotPassword"
          />
          <Stack.Screen
            component={EmailVerificationScreen}
            name="EmailVerification"
          />
          <Stack.Screen
            component={StudentOnboardingScreen}
            name="StudentOnboarding"
          />
        </>
      ) : null}
      {user ? (
        <>
          <Stack.Screen
            component={EmailVerificationScreen}
            name="EmailVerification"
          />
          <Stack.Screen
            component={StudentOnboardingScreen}
            name="StudentOnboarding"
          />
          <Stack.Screen
            component={StudentProfileSetupScreen}
            name="StudentProfileSetup"
          />
        </>
      ) : null}
      <Stack.Screen component={HomeScreen} name="Home" />
      <Stack.Screen component={ExploreScreen} name="Explore" />
      <Stack.Screen component={RoadmapScreen} name="Roadmap" />
      <Stack.Screen component={ApplicationsScreen} name="Applications" />
      <Stack.Screen component={ProfileScreen} name="Profile" />
      <Stack.Screen component={NotificationsScreen} name="Notifications" />
      <Stack.Screen
        component={CognitiveAssessmentIntroScreen}
        name="CognitiveAssessmentIntro"
      />
      <Stack.Screen component={AssessmentScreen} name="Assessment" />
      <Stack.Screen
        component={AssessmentProgressScreen}
        name="AssessmentProgress"
      />
      <Stack.Screen
        component={AssessmentResultsScreen}
        name="AssessmentResults"
      />
      <Stack.Screen
        component={AIAssessmentExplanationScreen}
        name="AIAssessmentExplanation"
      />
      <Stack.Screen
        component={PersonalizedCareerRoadmapScreen}
        name="PersonalizedCareerRoadmap"
      />
      <Stack.Screen
        component={CareerExplorationScreen}
        name="CareerExploration"
      />
      <Stack.Screen component={CareerDetailsScreen} name="CareerDetails" />
      <Stack.Screen component={CourseDiscoveryScreen} name="CourseDiscovery" />
      <Stack.Screen component={CourseDetailsScreen} name="CourseDetails" />
      <Stack.Screen
        component={CourseComparisonScreen}
        name="CourseComparison"
      />
      <Stack.Screen component={CollegeFinderScreen} name="CollegeFinder" />
      <Stack.Screen component={CollegeDetailsScreen} name="CollegeDetails" />
      <Stack.Screen
        component={CollegeComparisonScreen}
        name="CollegeComparison"
      />
      <Stack.Screen
        component={AdmissionEligibilityScreen}
        name="AdmissionEligibility"
      />
      {featureRoutes.map((name) => (
        <Stack.Screen component={FeatureScreen} key={name} name={name} />
      ))}
    </Stack.Navigator>
  );
}
