/**
 * course-service.ts
 *
 * Pure catalogue helpers and Firestore persistence for courses.
 *
 * Pure functions operate entirely on the in-memory COURSES array imported from
 * course-catalog.ts and have no side-effects, making them straightforward to
 * unit-test.
 *
 * Firestore functions (saveCourse, unsaveCourse, getSavedCourses) require a
 * live Firebase project.
 */

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';

import type { CourseRecord } from '../../../shared/types/course';
import type { SavedCourseEntry } from '../../../shared/types/saved-course';
import { getFirebaseFirestore } from '../../../shared/services/firebase-client';
import { COURSES } from '../data/course-catalog';

// ---------------------------------------------------------------------------
// Exported filter / sort types
// ---------------------------------------------------------------------------

export type CourseFilter = {
  query?: string;        // case-insensitive substring match
  degree?: string;
  stream?: string;
  institution?: string; // matches institutionName
  city?: string;
  minFees?: number;
  maxFees?: number;
  studyMode?: string;
  eligibilityKeyword?: string;
};

export type CourseSortOrder =
  | 'relevance'
  | 'name-asc'
  | 'institution-asc'
  | 'fees-asc'
  | 'fees-desc'
  | 'duration-asc';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function lower(value: string | null | undefined): string {
  return (value ?? '').toLowerCase();
}

/** Parse a duration string like "3 Years" → numeric years for comparison */
function parseDurationYears(duration: string | null): number {
  if (!duration) return Infinity;
  const match = /(\d+(?:\.\d+)?)/u.exec(duration);
  return match ? parseFloat(match[1]) : Infinity;
}

// ---------------------------------------------------------------------------
// 1. getCourses
// ---------------------------------------------------------------------------

export function getCourses(
  filter: CourseFilter = {},
  sort: CourseSortOrder = 'relevance',
  page = 0,
  pageSize = 20,
): { results: CourseRecord[]; total: number } {
  const {
    query,
    degree,
    stream,
    institution,
    city,
    minFees,
    maxFees,
    studyMode,
    eligibilityKeyword,
  } = filter;

  const queryLower = lower(query);
  const degreeLower = lower(degree);
  const streamLower = lower(stream);
  const institutionLower = lower(institution);
  const cityLower = lower(city);
  const studyModeLower = lower(studyMode);
  const eligibilityLower = lower(eligibilityKeyword);

  const filtered = COURSES.filter((course) => {
    // --- full-text query (substring across multiple fields) ---
    if (query) {
      const haystack = [
        course.name,
        course.institutionName,
        course.degree,
        course.stream,
        course.specialization,
        course.location,
        ...course.keywords,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(queryLower)) return false;
    }

    // --- exact field filters (case-insensitive) ---
    if (degree && lower(course.degree) !== degreeLower) return false;
    if (stream && lower(course.stream) !== streamLower) return false;
    if (institution && lower(course.institutionName) !== institutionLower)
      return false;
    if (city && lower(course.city) !== cityLower) return false;
    if (studyMode && lower(course.studyMode) !== studyModeLower) return false;

    // --- eligibility keyword (substring) ---
    if (eligibilityKeyword && !lower(course.eligibility).includes(eligibilityLower))
      return false;

    // --- fee range (only applied when fees is non-null) ---
    if (minFees !== undefined && course.fees !== null && course.fees < minFees)
      return false;
    if (maxFees !== undefined && course.fees !== null && course.fees > maxFees)
      return false;

    return true;
  });

  // --- sort ---
  const sorted = [...filtered].sort((a, b) => {
    switch (sort) {
      case 'name-asc':
        return a.name.localeCompare(b.name);

      case 'institution-asc':
        return a.institutionName.localeCompare(b.institutionName);

      case 'fees-asc': {
        if (a.fees === null && b.fees === null) return 0;
        if (a.fees === null) return 1;  // null fees go last
        if (b.fees === null) return -1;
        return a.fees - b.fees;
      }

      case 'fees-desc': {
        if (a.fees === null && b.fees === null) return 0;
        if (a.fees === null) return 1;  // null fees go last
        if (b.fees === null) return -1;
        return b.fees - a.fees;
      }

      case 'duration-asc': {
        const da = parseDurationYears(a.duration);
        const db = parseDurationYears(b.duration);
        return da - db;
      }

      case 'relevance':
      default:
        return 0; // preserve catalogue order
    }
  });

  const total = sorted.length;
  const start = page * pageSize;
  const results = sorted.slice(start, start + pageSize);

  return { results, total };
}

// ---------------------------------------------------------------------------
// 2. getCourseById
// ---------------------------------------------------------------------------

export function getCourseById(id: string): CourseRecord | undefined {
  return COURSES.find((course) => course.id === id);
}

// ---------------------------------------------------------------------------
// 3. getRelatedCourses
// ---------------------------------------------------------------------------

export function getRelatedCourses(
  institutionId: string,
  excludeId: string,
): CourseRecord[] {
  return COURSES.filter(
    (course) =>
      course.institutionId === institutionId && course.id !== excludeId,
  ).slice(0, 5);
}

// ---------------------------------------------------------------------------
// 4. getSimilarCourses
// ---------------------------------------------------------------------------

export function getSimilarCourses(
  degree: string,
  stream: string | null,
  excludeInstitutionId: string,
): CourseRecord[] {
  const degreeLower = lower(degree);
  const streamLower = lower(stream);

  return COURSES.filter((course) => {
    if (lower(course.degree) !== degreeLower) return false;
    if (stream && lower(course.stream) !== streamLower) return false;
    if (course.institutionId === excludeInstitutionId) return false;
    return true;
  }).slice(0, 5);
}

// ---------------------------------------------------------------------------
// 5. toSavedEntry
// ---------------------------------------------------------------------------

export function toSavedEntry(
  _uid: string,
  course: CourseRecord,
): SavedCourseEntry {
  return {
    courseId: course.id,
    savedAt: null, // replaced with serverTimestamp() on write
    name: course.name,
    institutionName: course.institutionName,
    degree: course.degree,
    city: course.city,
  };
}

// ---------------------------------------------------------------------------
// 6. saveCourse
// ---------------------------------------------------------------------------

export async function saveCourse(
  uid: string,
  course: CourseRecord,
): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error(
      'saveCourse: Firestore is not initialised. Check your Firebase configuration.',
    );
  }

  const entry = toSavedEntry(uid, course);
  const docRef = doc(db, 'user-data', uid, 'saved-courses', course.id);

  await setDoc(docRef, {
    ...entry,
    savedAt: serverTimestamp(),
  });
}

// ---------------------------------------------------------------------------
// 7. unsaveCourse
// ---------------------------------------------------------------------------

export async function unsaveCourse(
  uid: string,
  courseId: string,
): Promise<void> {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error(
      'unsaveCourse: Firestore is not initialised. Check your Firebase configuration.',
    );
  }

  const docRef = doc(db, 'user-data', uid, 'saved-courses', courseId);
  await deleteDoc(docRef);
}

// ---------------------------------------------------------------------------
// 8. getSavedCourses
// ---------------------------------------------------------------------------

export function getSavedCourses(
  uid: string,
  onChange: (entries: SavedCourseEntry[]) => void,
  onError: (err: Error) => void,
): () => void {
  const db = getFirebaseFirestore();
  if (!db) {
    throw new Error(
      'getSavedCourses: Firestore is not initialised. Check your Firebase configuration.',
    );
  }

  const colRef = collection(db, 'user-data', uid, 'saved-courses');

  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const entries: SavedCourseEntry[] = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        return {
          courseId: data['courseId'] as string,
          savedAt: data['savedAt'] ?? null,
          name: data['name'] as string,
          institutionName: data['institutionName'] as string,
          degree: data['degree'] as string,
          city: data['city'] as string,
        } satisfies SavedCourseEntry;
      });
      onChange(entries);
    },
    (err) => onError(err),
  );

  return unsubscribe;
}
