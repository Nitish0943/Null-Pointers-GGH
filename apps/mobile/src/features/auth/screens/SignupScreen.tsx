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
import { BrandLockup } from '../../../shared/components/branding/BrandLockup';
import {
  getAuthErrorMessage,
  registerUser,
} from '../../../shared/services/auth-service';

type Props = NativeStackScreenProps<RootStackParamList, 'Signup'>;

export function SignupScreen({ navigation, route }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function submit() {
    if (name.trim().length < 2) {
      setError('Enter your name to continue.');
      return;
    }
    if (!email.trim().includes('@')) {
      setError('Enter a valid email address.');
      return;
    }
    if (password.length < 6) {
      setError('Choose a password with at least 6 characters.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    void registerUser(name, email, password, route.params?.role)
      .then(() =>
        navigation.replace('EmailVerification', { email: email.trim() }),
      )
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
            accessibilityLabel="Back to login"
            accessibilityRole="button"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <BrandLockup />

          <View style={styles.heading}>
            <Text style={styles.eyebrow}>BEGIN WITH CLARITY</Text>
            <Text style={styles.title}>Create your account.</Text>
            <Text style={styles.description}>
              Set up your Mantrix profile and make your next academic decision
              with confidence.
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Your name</Text>
              <TextInput
                autoCapitalize="words"
                autoComplete="name"
                onChangeText={setName}
                placeholder="Enter your full name"
                placeholderTextColor="#9AAAB5"
                style={styles.input}
                value={name}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9AAAB5"
                style={styles.input}
                value={email}
              />
            </View>
            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.label}>Create a password</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                  onPress={() => setShowPassword((visible) => !visible)}
                >
                  <Text style={styles.fieldAction}>
                    {showPassword ? 'Hide' : 'Show'}
                  </Text>
                </Pressable>
              </View>
              <TextInput
                autoCapitalize="none"
                autoComplete="new-password"
                onChangeText={setPassword}
                placeholder="At least 6 characters"
                placeholderTextColor="#9AAAB5"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
              />
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
                {isSubmitting ? 'Creating…' : 'Create account'}
              </Text>
              {!isSubmitting && <Text style={styles.arrow}>→</Text>}
            </Pressable>
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginPrompt}>Already have an account?</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Sign in to Mantrix"
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginAction}>Sign in</Text>
            </Pressable>
          </View>

          <Text style={styles.demoNote}>
            Demo mode · Your details stay on this screen until backend
            authentication is connected.
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
  brandLockup: {
    alignItems: 'center',
    flexDirection: 'row',
    marginTop: 28,
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
  heading: {
    marginTop: 42,
  },
  eyebrow: {
    color: '#0F766E',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#17324D',
    fontSize: 36,
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
    gap: 18,
    marginTop: 30,
  },
  fieldGroup: {
    gap: 8,
  },
  labelRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    color: '#17324D',
    fontSize: 13,
    fontWeight: '800',
  },
  fieldAction: {
    color: '#0F766E',
    fontSize: 12,
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
  error: {
    color: '#B42318',
    fontSize: 12,
    lineHeight: 18,
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
    backgroundColor: '#8294A3',
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
  loginRow: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  loginPrompt: {
    color: '#6B8193',
    fontSize: 13,
  },
  loginAction: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 5,
  },
  demoNote: {
    color: '#9AAAB5',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 26,
    textAlign: 'center',
  },
});
