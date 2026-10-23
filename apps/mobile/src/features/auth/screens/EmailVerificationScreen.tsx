import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { RootStackParamList } from '../../../app/AppNavigator';
import {
  getAuthErrorMessage,
  refreshUser,
  resendVerification,
} from '../../../shared/services/auth-service';
import { useAuth } from '../../../shared/services/AuthProvider';

type Props = NativeStackScreenProps<RootStackParamList, 'EmailVerification'>;

export function EmailVerificationScreen({ navigation, route }: Props) {
  const { user } = useAuth();
  const email = route.params?.email ?? user?.email ?? '';
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  function resend() {
    if (!user) {
      setError('Sign in again before requesting a verification email.');
      return;
    }
    setIsResending(true);
    setMessage('');
    setError('');
    void resendVerification(user)
      .then(() => setMessage('Verification email sent. Check your inbox.'))
      .catch((resendError: unknown) =>
        setError(getAuthErrorMessage(resendError)),
      )
      .finally(() => setIsResending(false));
  }

  function checkVerification() {
    if (!user) {
      navigation.replace('Login');
      return;
    }
    void refreshUser(user)
      .then((updatedUser) => {
        if (updatedUser.emailVerified) {
          navigation.replace('Home');
        } else {
          setError(
            'Your email is not verified yet. Open the link and try again.',
          );
        }
      })
      .catch((verificationError: unknown) =>
        setError(getAuthErrorMessage(verificationError)),
      );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back to forgot password"
          hitSlop={12}
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backArrow}>←</Text>
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={styles.content}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>✉</Text>
          </View>
          <Text style={styles.eyebrow}>CHECK YOUR INBOX</Text>
          <Text style={styles.title}>Verification link on its way.</Text>
          <Text style={styles.description}>
            In a connected account flow, we would send a verification link to:
          </Text>
          <View style={styles.emailCard}>
            <Text style={styles.email}>
              {email || 'your account email address'}
            </Text>
          </View>
          <Text style={styles.helper}>
            Open the link in your email to continue securely. Check your spam
            folder if you don’t see it in a few minutes.
          </Text>

          {message ? (
            <Text accessibilityRole="status" style={styles.message}>
              {message}
            </Text>
          ) : null}
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isResending }}
            disabled={isResending}
            onPress={resend}
            style={({ pressed }) => [
              styles.primaryButton,
              isResending && styles.buttonDisabled,
              pressed && !isResending && styles.buttonPressed,
            ]}
          >
            <Text style={styles.primaryText}>
              {isResending ? 'Resending…' : 'Resend verification email'}
            </Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={checkVerification}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>I verified my email</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Return to sign in"
            onPress={() => navigation.replace('Login')}
            style={styles.loginButton}
          >
            <Text style={styles.loginText}>Return to sign in</Text>
          </Pressable>
        </View>

        <Text style={styles.demoNote}>
          Verification is checked with Firebase; opening this screen does not
          mark the account as verified.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: '#F7FAFC',
    flex: 1,
  },
  container: {
    flex: 1,
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
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: '#E8F3F2',
    borderColor: '#C8E2DF',
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    justifyContent: 'center',
    marginBottom: 28,
    width: 68,
  },
  icon: {
    color: '#0F766E',
    fontSize: 30,
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
  emailCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9E3E9',
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 18,
    padding: 16,
  },
  email: {
    color: '#17324D',
    fontSize: 15,
    fontWeight: '800',
  },
  helper: {
    color: '#6B8193',
    fontSize: 13,
    lineHeight: 20,
    marginTop: 16,
  },
  message: {
    color: '#0F766E',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 18,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: '#17324D',
    borderRadius: 12,
    justifyContent: 'center',
    marginTop: 28,
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
    fontSize: 15,
    fontWeight: '800',
  },
  loginButton: {
    alignSelf: 'center',
    marginTop: 18,
    padding: 8,
  },
  loginText: {
    color: '#0F766E',
    fontSize: 13,
    fontWeight: '800',
  },
  error: {
    color: '#B42318',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 12,
    textAlign: 'center',
  },
  demoNote: {
    color: '#9AAAB5',
    fontSize: 11,
    lineHeight: 16,
    paddingBottom: 12,
    textAlign: 'center',
  },
});
