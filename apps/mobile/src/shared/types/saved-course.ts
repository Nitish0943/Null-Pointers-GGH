export type SavedCourseEntry = {
  courseId: string;
  savedAt: unknown; // Firestore serverTimestamp()
  name: string;
  institutionName: string;
  degree: string;
  city: string;
};
