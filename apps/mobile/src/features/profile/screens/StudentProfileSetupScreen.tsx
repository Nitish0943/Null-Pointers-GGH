import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { useAuth } from '../../../shared/services/AuthProvider';
import {
  getAuthErrorMessage,
  updateUserProfile,
} from '../../../shared/services/auth-service';

type Props = NativeStackScreenProps<RootStackParamList, 'StudentProfileSetup'>;

const gradeOptions = ['9th', '10th', '11th', '12th', 'College'];
const interestOptions = ['Technology', 'Design', 'Business', 'Science'];

export function StudentProfileSetupScreen({ navigation }: Props) {
  const { profile, refreshProfile, user } = useAuth();
  const [grade, setGrade] = useState(profile?.studyLevel ?? '');
  const [schoolName, setSchoolName] = useState(profile?.schoolName ?? '');
  const [location, setLocation] = useState(profile?.location ?? '');
  const [address, setAddress] = useState(profile?.address ?? '');
  const [interest, setInterest] = useState(profile?.interest ?? '');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function submit() {
    if (!grade) {
      setError('Enter your current standard or education level.');
      return;
    }
    if (!schoolName.trim()) {
      setError('Enter the school or college you currently attend.');
      return;
    }
    if (!location.trim()) {
      setError('Add your city or region to continue.');
      return;
    }
    if (!address.trim()) {
      setError('Add your current address to continue.');
      return;
    }
    if (!interest.trim()) {
      setError('Tell us what you are interested in.');
      return;
    }

    if (!user) {
      setError('Sign in before completing your profile.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    void updateUserProfile(user.uid, {
      studyLevel: grade,
      schoolName: schoolName.trim(),
      location: location.trim(),
      address: address.trim(),
      interest,
      onboardingCompleted: true,
    })
      .then(async () => {
        await refreshProfile();
        navigation.replace('Home');
      })
      .catch((submissionError: unknown) => {
        setError(getAuthErrorMessage(submissionError));
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back to student onboarding"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.heading}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepText}>01</Text>
            </View>
            <Text style={styles.eyebrow}>YOUR STUDENT PROFILE</Text>
            <Text style={styles.title}>Let’s make this personal.</Text>
            <Text style={styles.description}>
              A few details help us shape guidance around where you are today.
              You can update them later.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Your name</Text>
              <View style={styles.readOnlyField}>
                <Text style={styles.readOnlyText}>
                  {profile?.displayName ||
                    user?.displayName ||
                    'Your account name'}
                </Text>
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Where are you in your journey?</Text>
              <View style={styles.options}>
                {gradeOptions.map((option) => {
                  const selected = option === grade;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={option}
                      onPress={() => setGrade(option)}
                      style={[styles.option, selected && styles.optionSelected]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>School or college</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={setSchoolName}
                placeholder="Write your school or college"
                placeholderTextColor="#9AAAB5"
                style={styles.input}
                value={schoolName}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>City or region</Text>
              <TextInput
                autoCapitalize="words"
                onChangeText={setLocation}
                placeholder="Where do you study?"
                placeholderTextColor="#9AAAB5"
                style={styles.input}
                value={location}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Complete address</Text>
              <TextInput
                autoCapitalize="sentences"
                multiline
                onChangeText={setAddress}
                placeholder="House, street, city, state"
                placeholderTextColor="#9AAAB5"
                style={[styles.input, styles.multilineInput]}
                value={address}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>What are you curious about?</Text>
              <TextInput
                onChangeText={setInterest}
                placeholder="Write your own interest"
                placeholderTextColor="#9AAAB5"
                style={styles.input}
                value={interest}
              />
              <View style={styles.options}>
                {interestOptions.map((option) => {
                  const selected = option === interest;
                  return (
                    <Pressable
                      accessibilityRole="radio"
                      accessibilityState={{ selected }}
                      key={option}
                      onPress={() => setInterest(option)}
                      style={[styles.option, selected && styles.optionSelected]}
                    >
                      <Text
                        style={[
                          styles.optionText,
                          selected && styles.optionTextSelected,
                        ]}
                      >
                        {option}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Pressable
              accessibilityRole="button"
              accessibilityState={{
                busy: isSubmitting,
                disabled: isSubmitting,
              }}
              disabled={isSubmitting}
              onPress={submit}
              style={({ pressed }) => [
                styles.primaryButton,
                isSubmitting && styles.buttonDisabled,
                pressed && !isSubmitting && styles.buttonPressed,
              ]}
            >
              <Text style={styles.primaryText}>
                {isSubmitting ? 'Saving…' : 'Continue to Mantrix'}
              </Text>
              {!isSubmitting && <Text style={styles.arrow}>→</Text>}
            </Pressable>
          </View>

          <Text style={styles.demoNote}>
            Your profile is saved securely to your Mantrix account.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FAFC',
    flex: 1,
  },
  keyboard: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    padding: 24,
  },
  backButton: {
    alignItems: 'center',
    alignSelf: 'flex-start',
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
  heading: {
    marginTop: 38,
  },
  stepBadge: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderColor: '#C8E2DF',
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  stepText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
  },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 24,
  },
  title: {
    color: '#17324D',
    fontSize: 35,
    fontWeight: '800',
    letterSpacing: -1.2,
    lineHeight: 40,
    marginTop: 14,
  },
  description: {
    color: '#5D7182',
    fontSize: 15,
    lineHeight: 23,
    marginTop: 16,
  },
  form: {
    gap: 22,
    marginTop: 32,
  },
  fieldGroup: {
    gap: 10,
  },
  label: {
    color: '#17324D',
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 12,
    borderWidth: 1,
    color: '#17324D',
    fontSize: 15,
    minHeight: 52,
    paddingHorizontal: 16,
  },
  readOnlyField: {
    backgroundColor: '#EEF3F6',
    borderColor: '#D9E3E9',
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 16,
  },
  readOnlyText: {
    color: '#5D7182',
    fontSize: 15,
  },
  multilineInput: {
    minHeight: 84,
    paddingTop: 14,
    textAlignVertical: 'top',
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  option: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  optionSelected: {
    backgroundColor: '#E8F3F2',
    borderColor: '#0F766E',
  },
  optionText: {
    color: '#5D7182',
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: '#0F766E',
  },
  error: {
    color: '#B42318',
    fontSize: 13,
    lineHeight: 19,
    marginTop: -8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: 56,
  },
  buttonDisabled: {
    backgroundColor: '#AABBC6',
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
  demoNote: {
    color: '#7B8D9B',
    fontSize: 11,
    lineHeight: 17,
    marginTop: 24,
    textAlign: 'center',
  },
});
