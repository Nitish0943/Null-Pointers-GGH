import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';
import {
  Auth,
  getAuth,
  initializeAuth,
  // Firebase exposes this through its React Native conditional export.
  // The web-oriented TypeScript entrypoint omits that conditional export.
  // @ts-expect-error -- resolved by Metro's React Native Firebase condition.
  getReactNativePersistence,
} from 'firebase/auth';
import { Firestore, getFirestore } from 'firebase/firestore';
import { Functions, getFunctions } from 'firebase/functions';

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

let firebaseAuth: Auth | null = null;

function getConfig(): FirebaseClientConfig | null {
  const configuredFirebase = Constants.expoConfig?.extra?.firebase as
    Partial<FirebaseClientConfig> | undefined;
  const values = {
    apiKey:
      process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? configuredFirebase?.apiKey,
    authDomain:
      process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ??
      configuredFirebase?.authDomain,
    projectId:
      process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ??
      configuredFirebase?.projectId,
    storageBucket:
      process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ??
      configuredFirebase?.storageBucket,
    messagingSenderId:
      process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ??
      configuredFirebase?.messagingSenderId,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? configuredFirebase?.appId,
  };

  return Object.values(values).every(Boolean)
    ? (values as FirebaseClientConfig)
    : null;
}

export function getFirebaseClient(): FirebaseApp | null {
  const config = getConfig();
  if (!config) {
    return null;
  }

  return getApps().length > 0 ? getApp() : initializeApp(config);
}

export function getFirebaseAuth(): Auth | null {
  if (firebaseAuth) {
    return firebaseAuth;
  }

  const app = getFirebaseClient();
  if (!app) {
    return null;
  }

  try {
    firebaseAuth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
    return firebaseAuth;
  } catch (error) {
    const firebaseError = error as { code?: string; message?: string };
    if (
      firebaseError.code === 'auth/already-initialized' ||
      firebaseError.message?.includes('already initialized') ||
      firebaseError.message?.includes('already exists')
    ) {
      firebaseAuth = getAuth(app);
      return firebaseAuth;
    }
    throw error;
  }
}

export function getFirebaseFirestore(): Firestore | null {
  const app = getFirebaseClient();
  return app ? getFirestore(app) : null;
}

export function getFirebaseFunctions(): Functions | null {
  const app = getFirebaseClient();
  return app ? getFunctions(app, 'us-central1') : null;
}
