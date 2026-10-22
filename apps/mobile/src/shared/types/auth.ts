export type UserRole =
  'student' | 'mentor' | 'college' | 'scholarship_authority' | 'bank' | 'admin';

export type UserProfile = {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  emailVerified: boolean;
  onboardingCompleted: boolean;
  preferredLanguage: string;
  studyLevel?: string;
  location?: string;
  interest?: string;
  createdAt?: unknown;
  updatedAt?: unknown;
};
