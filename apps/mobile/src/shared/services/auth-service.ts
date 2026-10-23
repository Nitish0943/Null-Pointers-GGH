import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

import { getFirebaseAuth, getFirebaseFirestore } from './firebase-client';
import type { UserProfile, UserRole } from '../types/auth';

function requireServices() {
  const auth = getFirebaseAuth();
  const db = getFirebaseFirestore();
  if (!auth || !db) {
    throw new Error(
      'Firebase is not configured. Add the EXPO_PUBLIC_FIREBASE_* variables.',
    );
  }
  return { auth, db };
}

export function getAuthErrorMessage(error: unknown): string {
  const authError = error as {
    code?: unknown;
    message?: unknown;
  };
  const code = typeof authError.code === 'string' ? authError.code : '';
  const message =
    typeof authError.message === 'string' ? authError.message : '';

  if (!code && !message) {
    return 'Something went wrong. Try again.';
  }

  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'The email or password is incorrect.';
    case 'auth/email-already-in-use':
      return 'An account already exists for this email.';
    case 'auth/weak-password':
      return 'Choose a stronger password with at least 6 characters.';
    case 'auth/invalid-email':
      return 'Enter a valid email address.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.';
    case 'auth/network-request-failed':
      return 'Network unavailable. Check your connection and try again.';
    case 'auth/operation-not-allowed':
      return 'Email and password sign-in is disabled in Firebase. Enable it in Firebase Console under Authentication → Sign-in method.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Contact support.';
    case 'auth/invalid-api-key':
    case 'auth/api-key-not-valid':
      return 'The Firebase API key is invalid. Check the mobile Firebase configuration.';
    case 'auth/app-not-authorized':
      return 'This app is not authorized for the Firebase project. Check the Firebase app configuration.';
    case 'auth/unauthorized-domain':
      return 'This app domain is not authorized in Firebase Authentication settings.';
    case 'auth/quota-exceeded':
      return 'Firebase has temporarily limited requests. Try again later.';
    case 'auth/internal-error':
      return 'Firebase returned an internal error. Restart the app and try again.';
    case 'unavailable':
    case 'failed-precondition':
      return 'Firebase is temporarily unavailable. Check your connection and try again.';
    case 'functions/not-found':
      return 'The assessment function is not deployed. Deploy Firebase Functions, then restart the app.';
    case 'functions/unauthenticated':
      return 'Your Firebase session is not available. Sign in again and retry.';
    case 'functions/failed-precondition':
      return 'The Gemini assessment service is not configured. Add GEMINI_API_KEY to Firebase Functions.';
    case 'permission-denied':
    case 'firestore/permission-denied':
      return 'You do not have permission to access this information.';
    default:
      if (message.includes('Firebase is not configured')) {
        return message;
      }
      return code
        ? `Firebase request failed (${code}). Check Firebase Console and try again.`
        : 'We could not complete that request. Try again.';
  }
}

function profileFromSnapshot(
  uid: string,
  data: Record<string, unknown> | undefined,
): UserProfile | null {
  if (!data) {
    return null;
  }
  return {
    uid,
    email: String(data.email ?? ''),
    displayName: String(data.displayName ?? ''),
    photoURL: typeof data.photoURL === 'string' ? data.photoURL : null,
    role: (data.role as UserRole) ?? 'student',
    emailVerified: Boolean(data.emailVerified),
    onboardingCompleted: Boolean(data.onboardingCompleted),
    preferredLanguage: String(data.preferredLanguage ?? 'en'),
    studyLevel: String(data.studyLevel ?? ''),
    schoolName: String(data.schoolName ?? ''),
    location: String(data.location ?? ''),
    address: String(data.address ?? ''),
    interest: String(data.interest ?? ''),
    assessmentCompleted: Boolean(data.assessmentCompleted),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export async function getUserProfile(user: User): Promise<UserProfile | null> {
  const { db } = requireServices();
  const snapshot = await getDoc(doc(db, 'users', user.uid));
  return profileFromSnapshot(user.uid, snapshot.data());
}

export async function signInUser(email: string, password: string) {
  const { auth } = requireServices();
  const credential = await signInWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  return credential.user;
}

export async function registerUser(
  displayName: string,
  email: string,
  password: string,
  role: Exclude<UserRole, 'admin'> = 'school_student',
) {
  const { auth, db } = requireServices();
  const credential = await createUserWithEmailAndPassword(
    auth,
    email.trim(),
    password,
  );
  await updateProfile(credential.user, { displayName: displayName.trim() });
  await setDoc(doc(db, 'users', credential.user.uid), {
    uid: credential.user.uid,
    email: credential.user.email ?? email.trim(),
    displayName: displayName.trim(),
    photoURL: credential.user.photoURL,
    role,
    emailVerified: credential.user.emailVerified,
    onboardingCompleted: false,
    preferredLanguage: 'en',
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  await sendEmailVerification(credential.user);
  return credential.user;
}

export async function requestPasswordReset(email: string) {
  const { auth } = requireServices();
  await sendPasswordResetEmail(auth, email.trim());
}

export async function resendVerification(user: User) {
  await sendEmailVerification(user);
}

export async function refreshUser(user: User) {
  await user.reload();
  return user;
}

export async function updateUserProfile(
  uid: string,
  changes: Partial<
    Pick<
      UserProfile,
      | 'displayName'
      | 'preferredLanguage'
      | 'onboardingCompleted'
      | 'studyLevel'
      | 'schoolName'
      | 'location'
      | 'address'
      | 'interest'
      | 'assessmentCompleted'
    >
  >,
) {
  const { db } = requireServices();
  await updateDoc(doc(db, 'users', uid), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function markAssessmentCompleted(uid: string) {
  await updateUserProfile(uid, { assessmentCompleted: true });
}

export async function signOutUser() {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
}
