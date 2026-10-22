import { onAuthStateChanged, type User } from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import { getFirebaseAuth, getFirebaseFirestore } from './firebase-client';
import { getUserProfile } from './auth-service';
import type { UserProfile } from '../types/auth';

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  profileError: string | null;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useMemo(() => getFirebaseAuth(), []);
  const isConfigured = Boolean(getFirebaseFirestore());
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  async function loadProfile(nextUser: User | null) {
    setUser(nextUser);
    if (!nextUser) {
      setProfile(null);
      setProfileError(null);
      setIsLoading(false);
      return;
    }
    try {
      setProfile(await getUserProfile(nextUser));
      setProfileError(null);
    } catch {
      setProfile(null);
      setProfileError(
        'We could not load your profile. Check your connection and try again.',
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    return onAuthStateChanged(auth, (nextUser) => {
      void loadProfile(nextUser);
    });
  }, [auth]);

  const value = useMemo(
    () => ({
      user,
      profile,
      isLoading,
      isConfigured,
      profileError,
      refreshProfile: async () => {
        if (user) {
          await loadProfile(user);
        }
      },
    }),
    [isConfigured, isLoading, profile, profileError, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return value;
}
