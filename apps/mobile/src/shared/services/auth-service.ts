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
  if (!(error instanceof Error)) {
    return 'Something went wrong. Try again.';
  }

  switch ((error as { code?: string }).code) {
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
    case 'permission-denied':
      return 'You do not have permission to access this information.';
    default:
      return error.message.includes('Firebase is not configured')
        ? error.message
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
    role: 'student' satisfies UserRole,
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
      | 'location'
      | 'interest'
    >
  >,
) {
  const { db } = requireServices();
  await updateDoc(doc(db, 'users', uid), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}

export async function signOutUser() {
  const auth = getFirebaseAuth();
  if (auth) {
    await signOut(auth);
  }
}
