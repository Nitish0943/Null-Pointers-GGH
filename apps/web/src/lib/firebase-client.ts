import { FirebaseApp, getApp, getApps, initializeApp } from 'firebase/app';

export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

export function getFirebaseClientConfig(
  env: NodeJS.ProcessEnv = process.env,
): FirebaseClientConfig | null {
  const values = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  return Object.values(values).every(Boolean)
    ? (values as FirebaseClientConfig)
    : null;
}

export function getFirebaseClient(): FirebaseApp | null {
  const config = getFirebaseClientConfig();
  if (!config) {
    return null;
  }

  return getApps().length > 0 ? getApp() : initializeApp(config);
}
