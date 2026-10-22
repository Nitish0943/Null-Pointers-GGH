import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';

type FirebaseClientConfig = {
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
