import AsyncStorage from '@react-native-async-storage/async-storage';
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

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function getConfig(): FirebaseClientConfig | null {
  const values = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
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
  const app = getFirebaseClient();
  if (!app) {
    return null;
  }

  try {
    return initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes('already exists')) {
      return getAuth(app);
    }
    throw error;
  }
}

export function getFirebaseFirestore(): Firestore | null {
  const app = getFirebaseClient();
  return app ? getFirestore(app) : null;
}
