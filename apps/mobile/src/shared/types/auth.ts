export type UserRole =
  | 'school_student'
  | 'college_student'
  | 'student'
  | 'mentor'
  | 'college'
  | 'admin';

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
  schoolName?: string;
  location?: string;
  address?: string;
  interest?: string;
  assessmentCompleted?: boolean;
  createdAt?: unknown;
  updatedAt?: unknown;
};
