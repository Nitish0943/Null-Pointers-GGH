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
  requestPasswordReset,
} from '../../../shared/services/auth-service';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function submit() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail || !normalizedEmail.includes('@')) {
      setError('Enter the email address used for your Mantrix account.');
      return;
    }

    setError('');
    setMessage('');
    setIsSubmitting(true);
    void requestPasswordReset(normalizedEmail)
      .then(() =>
        setMessage(
          'If an account uses this email, a password-reset link has been sent.',
        ),
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
            accessibilityRole="button"
            accessibilityLabel="Back to login"
            hitSlop={12}
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Text style={styles.backArrow}>←</Text>
            <Text style={styles.backText}>Back to sign in</Text>
          </Pressable>

          <BrandLockup />

          <View style={styles.heading}>
            <View style={styles.iconCircle}>
              <Text style={styles.icon}>?</Text>
            </View>
            <Text style={styles.eyebrow}>ACCOUNT ACCESS</Text>
            <Text style={styles.title}>Reset your password.</Text>
            <Text style={styles.description}>
              Enter your email and we’ll show the next step for getting back to
              your Mantrix journey.
            </Text>
          </View>

          <View style={styles.form}>
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
            {error ? (
              <Text accessibilityRole="alert" style={styles.error}>
                {error}
              </Text>
            ) : null}
            {message ? (
              <Text accessibilityRole="status" style={styles.message}>
                {message}
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
                {isSubmitting ? 'Sending…' : 'Send reset link'}
              </Text>
              {!isSubmitting && <Text style={styles.arrow}>→</Text>}
            </Pressable>
          </View>

          <Text style={styles.demoNote}>
            Password reset requests are handled by Firebase Authentication.
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
    marginTop: 48,
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderColor: '#C8E2DF',
    borderRadius: 28,
    borderWidth: 1,
    height: 56,
    justifyContent: 'center',
    marginBottom: 28,
    width: 56,
  },
  icon: {
    color: '#0F766E',
    fontSize: 28,
    fontWeight: '800',
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
    gap: 10,
    marginTop: 34,
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
  error: {
    color: '#B42318',
    fontSize: 12,
    lineHeight: 18,
  },
  message: {
    color: '#0F766E',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 12,
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
  demoNote: {
    color: '#9AAAB5',
    fontSize: 11,
    lineHeight: 16,
    marginTop: 32,
    textAlign: 'center',
  },
});
