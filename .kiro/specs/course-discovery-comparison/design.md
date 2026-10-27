# Design Document

## Overview

This design describes the full Course Discovery, Institution Discovery, Course Comparison, and Saved Courses feature for the Mantrix React Native / Expo mobile app. The feature replaces the current demo-data screens with real data sourced from local JSON files bundled with the app (consistent with the existing `college-catalog.json` pattern) and uses Firestore only for user-specific saved-courses data.

The feature introduces a normalisation layer that maps three heterogeneous Chhattisgarh datasets into uniform `CourseRecord` and `InstitutionRecord` types, a `ComparisonContext` that owns the in-memory comparison basket, three new service modules, six screens (three existing screens replaced, three new screens), and five new shared components.

### Architecture Decision: Local JSON over Firestore Seeding

Firebase is only initialised when `EXPO_PUBLIC_FIREBASE_*` environment variables are present. Given that the three college/course datasets total fewer than 170 records and that the existing `CollegeFinderScreen` already bundles `college-catalog.json` locally, the same pattern is used here. Firestore is reserved for user-owned data (`user-data/{uid}/saved-courses`). A future admin seeder path is noted in Section 15.

---

## Architecture

### Data Flow

```
Local JSON files (bundled)
  data/chhattisgarh_college_comparison_dataset.json     (70 records)
  data/chhattisgarh_50_colleges_enrollment_template.json (50 records)
  data/chhattisgarh_50_college_course_comparison_dataset.json (50 records)
  data/scholarship_dataset.json                         (8 records)
        │
        ▼
  Normalisation layer
  features/courses/data/normalise-courses.ts
  features/colleges/data/normalise-institutions.ts
        │
        ▼
  Typed in-memory arrays: CourseRecord[], InstitutionRecord[], ScholarshipRecord[]
        │
        ├─── course-service.ts         (filter / sort / save / unsave / getSaved)
        ├─── institution-service.ts    (filter / sort / getById)
        └─── scholarship-service.ts    (filter by course fields, in-memory cache)
        │
        ▼
  Screen components (hooks call service functions, pass results down as props)
        │
        ├─── ComparisonContext           (in-memory basket, up to 4 CourseRecords)
        │
        └─── Firestore (getFirebaseFirestore())
               user-data/{uid}/saved-courses/{courseId}   ← read/write only
```

### Component Tree (simplified)

```
AppNavigator
  └─ ComparisonProvider           ← wraps all relevant screens
       ├─ CourseDiscoveryScreen
       ├─ CourseDetailsScreen
       ├─ CourseComparisonScreen
       ├─ InstitutionDiscoveryScreen  (new)
       ├─ InstitutionDetailsScreen   (new)
       └─ SavedCoursesScreen          (new)
```

---

## Components and Interfaces

### Shared Reusable Components

All new shared components live under `apps/mobile/src/shared/components/cards/` and `shared/components/ui/`.

#### `CourseCard`

```tsx
// apps/mobile/src/shared/components/cards/CourseCard.tsx
type CourseCardProps = {
  course: CourseRecord;
  isSaved: boolean;
  isInBasket: boolean;
  onPress: () => void;
  onSaveToggle: () => void;
  onAddToCompare: () => void;
};
```

Displays: course name, institution name, degree, city, duration, fees (or "Not specified"), eligibility summary (first 80 chars + ellipsis). Shows Save toggle and Add-to-Compare control. Used in `CourseDiscoveryScreen`, `InstitutionDetailsScreen`, and `SavedCoursesScreen`.

#### `InstitutionCard`

```tsx
// apps/mobile/src/shared/components/cards/InstitutionCard.tsx
type InstitutionCardProps = {
  institution: InstitutionRecord;
  courseCount: number;
  onPress: () => void;
};
```

Displays: institution name, city, management type, affiliation, course count.

#### `ScholarshipChip`

```tsx
// apps/mobile/src/shared/components/cards/ScholarshipChip.tsx
type ScholarshipChipProps = {
  scholarship: ScholarshipRecord;
  onPress: () => void;
};
```

Compact row showing scholarship name and eligibility summary. Tapping opens `official_portal` in the browser if it is a valid HTTPS URL; otherwise shows a "Link unavailable" notice.

#### `ComparisonBadge`

```tsx
// apps/mobile/src/shared/components/ui/ComparisonBadge.tsx
type ComparisonBadgeProps = {
  count: number; // current basket size
  onPress: () => void; // navigate to CourseComparison
};
```

Shown in the `CourseDiscoveryScreen` header when `count >= 2`. Hidden when `count < 2`.

#### `LoadingSkeleton`

```tsx
// apps/mobile/src/shared/components/feedback/LoadingSkeleton.tsx
type LoadingSkeletonProps = {
  rows?: number; // default 5
};
```

Renders animated placeholder rows matching the `CourseCard` height. Used in all list screens during the initial data-load frame.

---

## Data Models

### `CourseRecord`

Normalised from all three college/course JSON datasets.

```ts
// apps/mobile/src/shared/types/course.ts
export type CourseRecord = {
  id: string; // derived: institutionId + '_' + slugified degree+stream
  institutionId: string; // derived from college_id / CG-prefixed id
  name: string; // programme_summary split item or courses_for_comparison
  institutionName: string;
  degree: string; // e.g. "B.Tech", "M.Sc."
  stream: string | null; // specialisation / sector
  specialization: string | null;
  location: string; // city_or_district / district_or_location
  city: string;
  state: string;
  duration: string | null; // typical_duration / course_duration
  fees: number | null; // course_fees_inr (INR)
  studyMode: string | null;
  eligibility: string | null; // career_opportunities used as proxy when dedicated field absent
  admissionProcess: string | null;
  applicationDeadline: string | null;
  accreditation: string | null; // management_type + university_affiliation
  officialUrl: string | null; // validated: must match ^https://[^\s]+$ or null
  category: string; // sector / college_type / course_categories[0]
  keywords: string[]; // derived from degree + stream + category + location
};
```

### `InstitutionRecord`

Normalised from `chhattisgarh_college_comparison_dataset.json` (primary) merged with `chhattisgarh_50_colleges_enrollment_template.json` (supplementary).

```ts
// apps/mobile/src/shared/types/institution.ts
export type InstitutionRecord = {
  id: string; // college_id (e.g. "CG001")
  name: string; // college_name
  city: string; // city_or_district
  state: string;
  type: string; // sector / college_type
  management: string; // management_type
  affiliation: string | null; // university_affiliation
  officialUrl: string | null; // official_website validated
  courseIds: string[]; // ids of all derived CourseRecords for this institution
  nirfRank: number | null;
  rating: number | null;
  programmeSummary: string; // courses.programme_summary
};
```

### `ScholarshipRecord`

```ts
// apps/mobile/src/shared/types/scholarship.ts
export type ScholarshipRecord = {
  id: string; // slugified name
  name: string;
  eligibility: string;
  requiredDocuments: string[];
  applicationPeriod: string;
  officialPortal: string | null; // validated HTTPS URL or null
};
```

### `SavedCourseEntry`

Firestore document at `user-data/{uid}/saved-courses/{courseId}`.

```ts
// apps/mobile/src/shared/types/saved-course.ts
export type SavedCourseEntry = {
  courseId: string;
  savedAt: unknown; // Firestore serverTimestamp()
  name: string;
  institutionName: string;
  degree: string;
  city: string;
};
```

### `ComparisonBasket`

```ts
// apps/mobile/src/features/courses/context/ComparisonContext.tsx
export type ComparisonContextValue = {
  basket: CourseRecord[]; // max 4 items
  add: (course: CourseRecord) => void;
  remove: (courseId: string) => void;
  clear: () => void;
};
```

---

## Normalisation Layer

### Source-to-Target Field Mapping

#### `CourseRecord` from `chhattisgarh_college_comparison_dataset.json`

| Source field                | Target field         | Transform                                              |
| --------------------------- | -------------------- | ------------------------------------------------------ |
| `id`                        | `institutionId`      | direct                                                 |
| `college_name`              | `institutionName`    | trim                                                   |
| `courses.programme_summary` | `name` + `degree`    | split on `;` to produce one CourseRecord per programme |
| `sector`                    | `stream`, `category` | direct                                                 |
| `courses.course_duration`   | `duration`           | `?? null`                                              |
| `courses.course_fees_inr`   | `fees`               | `?? null`                                              |
| `official_website`          | `officialUrl`        | `normaliseUrl()`                                       |
| `city_or_district`          | `city`, `location`   | direct                                                 |
| `state`                     | `state`              | direct                                                 |
| All other fields            | `null`               | sentinel                                               |

#### `CourseRecord` from `chhattisgarh_50_colleges_enrollment_template.json`

| Source field             | Target field                    | Transform                       |
| ------------------------ | ------------------------------- | ------------------------------- |
| `college_id`             | `institutionId`                 | direct                          |
| `college_name`           | `institutionName`               | trim                            |
| `course_categories[]`    | one `CourseRecord` per category | category becomes `degree` proxy |
| `college_type`           | `category`                      | direct                          |
| `district_or_location`   | `city`, `location`              | direct                          |
| `university_affiliation` | `accreditation`                 | direct                          |

#### `CourseRecord` from `chhattisgarh_50_college_course_comparison_dataset.json`

| Source field               | Target field       | Transform                 |
| -------------------------- | ------------------ | ------------------------- |
| `college_name`             | `institutionName`  | trim                      |
| `courses_for_comparison`   | `name`             | trim                      |
| `management_type`          | `category`         | direct                    |
| `typical_duration`         | `duration`         | direct                    |
| `career_opportunities`     | `eligibility`      | used as proxy description |
| `location_in_chhattisgarh` | `city`, `location` | direct                    |

#### `InstitutionRecord` merging

1. Start from `chhattisgarh_college_comparison_dataset.json` — provides `id`, `name`, `city`, `state`, `management`, `officialUrl`, `nirfRank`, `rating`, `programmeSummary`.
2. Merge `chhattisgarh_50_colleges_enrollment_template.json` by `college_id` — adds `affiliation`, `type` when absent.
3. `courseIds` is populated after all `CourseRecord`s are derived.

#### `institutionId` derivation

- If the source record has `college_id` (enrollment template), use it directly.
- If the source record has `id` (comparison dataset), use it directly.
- If only `college_name` is present (course-comparison dataset), generate a slug: `college_name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-')` and prefix with `"cg-"`.

#### Null handling

`normaliseUrl(raw: string | null | undefined): string | null` — returns the value if it matches `^https://[^\s]+$`, otherwise `null`.

All string fields: `value?.trim() ?? null`.  
All number fields: `value ?? null`.  
All array fields: `value ?? []`.

#### Deduplication

Within each source file, records sharing the same derived `institutionId` are merged (union of `courseIds`). Across files, records sharing `institutionId` are merged using the first file as primary.

---

## New and Modified Files

### New files

| Path                                                                       | Description                                                                                                                                           |
| -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/shared/types/course.ts`                                   | `CourseRecord` TypeScript type                                                                                                                        |
| `apps/mobile/src/shared/types/institution.ts`                              | `InstitutionRecord` TypeScript type                                                                                                                   |
| `apps/mobile/src/shared/types/scholarship.ts`                              | `ScholarshipRecord` TypeScript type                                                                                                                   |
| `apps/mobile/src/shared/types/saved-course.ts`                             | `SavedCourseEntry` Firestore document type                                                                                                            |
| `apps/mobile/src/features/courses/data/normalise-courses.ts`               | Normalisation functions: `normaliseCourses()`, `normaliseUrl()`, `deduplicateById()`                                                                  |
| `apps/mobile/src/features/colleges/data/normalise-institutions.ts`         | Normalisation functions: `normaliseInstitutions()`                                                                                                    |
| `apps/mobile/src/features/courses/data/course-catalog.ts`                  | Imports all three JSON files, calls normalisers, exports `COURSES: CourseRecord[]` and `INSTITUTIONS: InstitutionRecord[]` as module-level singletons |
| `apps/mobile/src/features/courses/data/scholarship-catalog.ts`             | Imports `scholarship_dataset.json`, normalises, exports `SCHOLARSHIPS: ScholarshipRecord[]`                                                           |
| `apps/mobile/src/features/courses/services/course-service.ts`              | Service module — all course read/write operations                                                                                                     |
| `apps/mobile/src/features/colleges/services/institution-service.ts`        | Service module — all institution read operations                                                                                                      |
| `apps/mobile/src/shared/services/scholarship-service.ts`                   | Service module — scholarship filtering with in-memory cache                                                                                           |
| `apps/mobile/src/features/courses/context/ComparisonContext.tsx`           | `ComparisonProvider` and `useComparison()` hook                                                                                                       |
| `apps/mobile/src/shared/components/cards/CourseCard.tsx`                   | Shared course card component                                                                                                                          |
| `apps/mobile/src/shared/components/cards/InstitutionCard.tsx`              | Shared institution card component                                                                                                                     |
| `apps/mobile/src/shared/components/cards/ScholarshipChip.tsx`              | Scholarship row component                                                                                                                             |
| `apps/mobile/src/shared/components/ui/ComparisonBadge.tsx`                 | Floating compare button for discovery screen header                                                                                                   |
| `apps/mobile/src/shared/components/feedback/LoadingSkeleton.tsx`           | Animated placeholder rows                                                                                                                             |
| `apps/mobile/src/features/colleges/screens/InstitutionDiscoveryScreen.tsx` | New institution search/filter screen                                                                                                                  |
| `apps/mobile/src/features/colleges/screens/InstitutionDetailsScreen.tsx`   | New institution detail screen                                                                                                                         |
| `apps/mobile/src/features/courses/screens/SavedCoursesScreen.tsx`          | New saved courses list screen                                                                                                                         |

### Modified files

| Path                                                                  | Change                                                                                                                                                                           |
| --------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/mobile/src/app/AppNavigator.tsx`                                | Add `InstitutionDiscovery`, `InstitutionDetails`, `SavedCourses` to `CoreStackParamList` and register `Stack.Screen` entries; wrap navigator body in `ComparisonProvider`        |
| `apps/mobile/src/features/dashboard/screens/HomeScreen.tsx`           | Replace `quickActions` with `Discover Courses`, `Explore Institutions`, `Saved Courses`; wire `navigation.navigate` calls                                                        |
| `apps/mobile/src/features/courses/screens/CourseDiscoveryScreen.tsx`  | Replace hardcoded `courses[]` with `useCourseDiscovery()` hook; add filter controls, pagination, `ComparisonBadge`, save/compare actions                                         |
| `apps/mobile/src/features/courses/screens/CourseDetailsScreen.tsx`    | Replace hardcoded `detailsByCourse{}` with `getCourseById(courseId)`; add all `CourseRecord` fields, related/similar courses sections, scholarship section, save/compare buttons |
| `apps/mobile/src/features/courses/screens/CourseComparisonScreen.tsx` | Replace hardcoded `courses[]` with `ComparisonContext`; implement side-by-side table, slot filling, clear/remove, scholarship section                                            |
| `apps/mobile/src/features/colleges/screens/CollegeFinderScreen.tsx`   | Kept as-is for backward compatibility; not removed                                                                                                                               |
| `firebase/firestore/firestore.rules`                                  | Add `match /scholarships/{docId}` rule                                                                                                                                           |

---

## ComparisonContext

```tsx
// apps/mobile/src/features/courses/context/ComparisonContext.tsx

import React, { createContext, useCallback, useContext, useState } from 'react';
import type { CourseRecord } from '../../../shared/types/course';

export type ComparisonContextValue = {
  basket: CourseRecord[];
  add: (course: CourseRecord) => void;
  remove: (courseId: string) => void;
  clear: () => void;
};

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function ComparisonProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [basket, setBasket] = useState<CourseRecord[]>([]);

  const add = useCallback((course: CourseRecord) => {
    setBasket((prev) => {
      if (prev.length >= 4) return prev;
      if (prev.some((c) => c.id === course.id)) return prev; // idempotent
      return [...prev, course];
    });
  }, []);

  const remove = useCallback((courseId: string) => {
    setBasket((prev) => prev.filter((c) => c.id !== courseId));
  }, []);

  const clear = useCallback(() => setBasket([]), []);

  return (
    <ComparisonContext.Provider value={{ basket, add, remove, clear }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext);
  if (!ctx)
    throw new Error('useComparison must be used inside ComparisonProvider');
  return ctx;
}
```

`ComparisonProvider` wraps the `Stack.Navigator` inside `AppNavigator` so basket state persists across all navigation transitions without clearing on unmount.

---

## Service Modules

### `course-service.ts`

```ts
// apps/mobile/src/features/courses/services/course-service.ts
import { COURSES } from '../data/course-catalog';
import type { CourseRecord } from '../../../shared/types/course';
import type { SavedCourseEntry } from '../../../shared/types/saved-course';
import {
  collection, deleteDoc, doc, onSnapshot,
  serverTimestamp, setDoc,
} from 'firebase/firestore';
import { getFirebaseFirestore } from '../../../shared/services/firebase-client';

export type CourseFilter = {
  query?: string;          // case-insensitive substring
  degree?: string;
  stream?: string;
  institution?: string;
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

/** Returns filtered + sorted slice of the local catalogue. Pure function. */
export function getCourses(
  filter?: CourseFilter,
  sort?: CourseSortOrder,
  page?: number,        // 0-indexed
  pageSize?: number,    // default 20
): { results: CourseRecord[]; total: number } { ... }

/** Returns a single CourseRecord or undefined. Pure function. */
export function getCourseById(id: string): CourseRecord | undefined { ... }

/** Returns up to 5 courses from the same institution, excluding the given id. */
export function getRelatedCourses(institutionId: string, excludeId: string): CourseRecord[] { ... }

/** Returns up to 5 courses with matching degree+stream from other institutions. */
export function getSimilarCourses(
  degree: string,
  stream: string | null,
  excludeInstitutionId: string,
): CourseRecord[] { ... }

/** Writes a SavedCourseEntry to Firestore. Throws on Firestore error. */
export async function saveCourse(uid: string, course: CourseRecord): Promise<void> { ... }

/** Deletes a SavedCourseEntry from Firestore. Throws on Firestore error. */
export async function unsaveCourse(uid: string, courseId: string): Promise<void> { ... }

/**
 * Subscribes to user's saved courses via onSnapshot.
 * Returns the unsubscribe function.
 */
export function getSavedCourses(
  uid: string,
  onChange: (entries: SavedCourseEntry[]) => void,
  onError: (err: Error) => void,
): () => void { ... }

/** Produces a SavedCourseEntry object from a CourseRecord (pure, no I/O). */
export function toSavedEntry(uid: string, course: CourseRecord): SavedCourseEntry { ... }
```

`getCourses`, `getCourseById`, `getRelatedCourses`, `getSimilarCourses`, and `toSavedEntry` are pure functions that operate on the in-memory `COURSES` array — no Firestore reads. Only `saveCourse`, `unsaveCourse`, and `getSavedCourses` touch Firestore.

### `institution-service.ts`

```ts
// apps/mobile/src/features/colleges/services/institution-service.ts
import { INSTITUTIONS } from '../data/course-catalog';
import { COURSES } from '../../courses/data/course-catalog';
import type { InstitutionRecord } from '../../../shared/types/institution';
import type { CourseRecord } from '../../../shared/types/course';

export type InstitutionFilter = {
  query?: string;
  city?: string;
  management?: string;
  type?: string;
  affiliation?: string;
};

/** Returns filtered + sorted page of institutions. Pure function. */
export function getInstitutions(
  filter?: InstitutionFilter,
  page?: number,
  pageSize?: number,
): { results: InstitutionRecord[]; total: number } { ... }

/** Returns a single InstitutionRecord or undefined. Pure function. */
export function getInstitutionById(id: string): InstitutionRecord | undefined { ... }

/** Returns all CourseRecords whose institutionId matches. Pure function. */
export function getCoursesByInstitution(institutionId: string): CourseRecord[] { ... }
```

All functions are pure — they filter/sort the in-memory arrays.

### `scholarship-service.ts`

```ts
// apps/mobile/src/shared/services/scholarship-service.ts
import { SCHOLARSHIPS } from '../../features/courses/data/scholarship-catalog';
import type { ScholarshipRecord } from '../types/scholarship';

// Module-level cache: key = `${degree}|${stream ?? ''}|${category}`
const cache = new Map<string, ScholarshipRecord[]>();

/** Returns all scholarships whose eligibility overlaps degree/stream/category. */
export function getRelevantScholarships(
  degree: string,
  stream: string | null,
  category: string,
): ScholarshipRecord[] { ... }

/** Returns all scholarships. Pure function. */
export function getScholarships(): ScholarshipRecord[] { return SCHOLARSHIPS; }

/** Deduplicates scholarship arrays by id. Pure function. */
export function deduplicateScholarships(records: ScholarshipRecord[]): ScholarshipRecord[] { ... }
```

The in-memory `cache` avoids repeated filter passes within the same app process (satisfies Requirement 9.6).

---

## Screen Inventory

### 1. `CourseDiscoveryScreen` (modified)

| Property            | Value                                                                                                                                                                                                 |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Route name          | `CourseDiscovery`                                                                                                                                                                                     |
| Component path      | `apps/mobile/src/features/courses/screens/CourseDiscoveryScreen.tsx`                                                                                                                                  |
| Route params        | none                                                                                                                                                                                                  |
| Primary data source | `getCourses()` from `course-service.ts` (local JSON)                                                                                                                                                  |
| Key interactions    | Text search, category/degree/city/fees/mode filters, sort selector, paginated list, Save toggle (Firestore), Add-to-Compare (ComparisonContext), View Details navigation, `ComparisonBadge` in header |

Loading state: `LoadingSkeleton` (5 rows) while first `getCourses()` resolves (it's synchronous from local data, so the skeleton shows for at most one render frame — kept for offline/error consistency).  
Empty state: `AppEmptyState` with "Clear filters" `Pressable`.  
Error state: error card with "Retry" button.  
Offline: "Offline — showing cached results" banner when `getCourses()` returns stale data and network is unavailable; save toggle is disabled.

### 2. `CourseDetailsScreen` (modified)

| Property            | Value                                                                                                                 |
| ------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Route name          | `CourseDetails`                                                                                                       |
| Component path      | `apps/mobile/src/features/courses/screens/CourseDetailsScreen.tsx`                                                    |
| Route params        | `{ courseId: string }`                                                                                                |
| Primary data source | `getCourseById(courseId)`, `getRelatedCourses()`, `getSimilarCourses()`, `getRelevantScholarships()` — all local JSON |
| Firestore           | `getSavedCourses()` onSnapshot listener for save-state initialisation; `saveCourse` / `unsaveCourse` on toggle        |

Sections: full CourseRecord fields (null → "Not specified"), Related courses (up to 5), Similar courses (up to 5), Relevant scholarships (up to 4 `ScholarshipChip` rows), Add to Compare button.

### 3. `CourseComparisonScreen` (modified)

| Property            | Value                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| Route name          | `CourseComparison`                                                    |
| Component path      | `apps/mobile/src/features/courses/screens/CourseComparisonScreen.tsx` |
| Route params        | none                                                                  |
| Primary data source | `useComparison()` basket                                              |

Side-by-side table with horizontal scroll when 3–4 courses. Null cells → "—". Column header has dismiss control. "+ Add course" slots navigate to `CourseDiscovery`. "Clear all" shows confirmation dialog. Scholarship section below table.

### 4. `InstitutionDiscoveryScreen` (new)

| Property            | Value                                                                      |
| ------------------- | -------------------------------------------------------------------------- |
| Route name          | `InstitutionDiscovery`                                                     |
| Component path      | `apps/mobile/src/features/colleges/screens/InstitutionDiscoveryScreen.tsx` |
| Route params        | none                                                                       |
| Primary data source | `getInstitutions()` from `institution-service.ts`                          |

300 ms debounced search input. Filter chips for city, management, type, affiliation. Infinite scroll (append 20 per page when within 200px of bottom). `InstitutionCard` per record. Empty and error states.

### 5. `InstitutionDetailsScreen` (new)

| Property            | Value                                                                    |
| ------------------- | ------------------------------------------------------------------------ |
| Route name          | `InstitutionDetails`                                                     |
| Component path      | `apps/mobile/src/features/colleges/screens/InstitutionDetailsScreen.tsx` |
| Route params        | `{ institutionId: string }`                                              |
| Primary data source | `getInstitutionById()`, `getCoursesByInstitution()`                      |

Institution metadata (null → "Not specified"), list of `CourseCard` components for all institution courses, official URL opener, "Compare courses from this institution" button navigates to `CourseComparison`.

### 6. `SavedCoursesScreen` (new)

| Property            | Value                                                             |
| ------------------- | ----------------------------------------------------------------- |
| Route name          | `SavedCourses`                                                    |
| Component path      | `apps/mobile/src/features/courses/screens/SavedCoursesScreen.tsx` |
| Route params        | none                                                              |
| Primary data source | `getSavedCourses(uid, ...)` Firestore onSnapshot listener         |

Lists saved courses as `CourseCard` components (with unsave action). Empty state links to `CourseDiscovery`. Requires authenticated user (redirect to `Login` if `user` is null).

---

## AppNavigator Changes

### `CoreStackParamList` additions

```ts
// Add to CoreStackParamList in AppNavigator.tsx:
InstitutionDiscovery: undefined;
InstitutionDetails: {
  institutionId: string;
}
SavedCourses: undefined;
```

### New `Stack.Screen` registrations

```tsx
<Stack.Screen component={InstitutionDiscoveryScreen} name="InstitutionDiscovery" />
<Stack.Screen component={InstitutionDetailsScreen} name="InstitutionDetails" />
<Stack.Screen component={SavedCoursesScreen} name="SavedCourses" />
```

All three are added alongside the existing `CourseDiscovery`, `CourseDetails`, `CourseComparison` registrations. The existing `CollegeFinder`, `CollegeDetails`, `CollegeComparison`, and `AdmissionEligibility` routes remain registered and unchanged.

### `ComparisonProvider` wrapping

```tsx
// In AppNavigator.tsx, wrap Stack.Navigator:
<ComparisonProvider>
  <Stack.Navigator ...>
    {/* all screens */}
  </Stack.Navigator>
</ComparisonProvider>
```

This ensures basket state persists across all navigation transitions.

---

## HomeScreen Changes

Replace the current `quickActions` array (3 entries: Take assessment, Explore careers, Find courses) with:

```ts
const quickActions = [
  {
    icon: '▣',
    label: 'Discover Courses',
    detail: 'Search programmes across Chhattisgarh',
    route: 'CourseDiscovery',
  },
  {
    icon: '◎',
    label: 'Explore Institutions',
    detail: 'Browse colleges and universities',
    route: 'InstitutionDiscovery',
  },
  {
    icon: '✦',
    label: 'Saved Courses',
    detail: 'View your bookmarked programmes',
    route: 'SavedCourses',
  },
];
```

The `Take assessment` and `Explore careers` actions move to a second section ("Continue your journey") rather than being removed, so existing functionality is preserved.

---

## Firestore Integration

### Scope

Only `user-data/{uid}/saved-courses/{courseId}` is read from or written to Firestore. All catalogue data (courses, institutions, scholarships) is served from local JSON.

### Document shape

```ts
// user-data/{uid}/saved-courses/{courseId}
{
  courseId: string,          // == document id
  savedAt: Timestamp,        // serverTimestamp()
  name: string,
  institutionName: string,
  degree: string,
  city: string,
}
```

### Read pattern

`getSavedCourses(uid, onChange, onError)` calls `onSnapshot` on `collection(db, 'user-data', uid, 'saved-courses')`. The listener is established when `SavedCoursesScreen` mounts and cleaned up on unmount. `CourseDiscoveryScreen` and `CourseDetailsScreen` establish their own listeners scoped to their mount lifetime, so save-state is always consistent across screens without manual refresh.

### Write pattern

`saveCourse(uid, course)`: `setDoc(doc(db, 'user-data', uid, 'saved-courses', course.id), toSavedEntry(uid, course))`.  
`unsaveCourse(uid, courseId)`: `deleteDoc(doc(db, 'user-data', uid, 'saved-courses', courseId))`.

Both are called after an optimistic UI toggle. On failure the calling screen catches the error and reverts the toggle state, displaying a 3-second toast notification.

### Security rules

The existing rule `match /user-data/{uid} { allow read, write: if isOwner(uid); }` covers `user-data/{uid}/saved-courses` as a subcollection. No change required to existing rules.

Add `scholarships` collection rule:

```
match /scholarships/{docId} {
  allow read: if signedIn();
  allow write: if isAdmin();
}
```

---

## Comparison Flow

### Slot-filling from ComparisonScreen → CourseDiscovery → back

1. Student taps an empty "+ Add course" slot in `CourseComparisonScreen`.
2. `CourseComparisonScreen` navigates to `CourseDiscovery` via `navigation.navigate('CourseDiscovery')`.
3. On `CourseDiscovery`, the "Add to Compare" control on each `CourseCard` calls `comparison.add(course)`, which updates the shared `ComparisonContext` basket.
4. Student navigates back (hardware back or `navigation.goBack()`). `ComparisonContext` state is preserved because `ComparisonProvider` is mounted above both screens in the tree.
5. `CourseComparisonScreen` re-reads `basket` from context and renders the updated columns.

There is no slot-index parameter passed to `CourseDiscovery`. The comparison basket append-order determines which column the new course occupies. The student can reorder by removing and re-adding.

### Duplicate prevention

`ComparisonContext.add` checks `basket.some(c => c.id === course.id)` before pushing. If the course is already present, the function is a no-op (idempotent). The UI shows "Add to Compare" in selected/active state for any course whose `id` is already in the basket.

### Full basket (4 courses)

`add` is gated on `basket.length < 4`. When full, `CourseDiscoveryScreen` and `CourseDetailsScreen` display an inline notice: "Remove a course from your comparison to add a new one." The `ComparisonBadge` continues to show the count.

---

## Offline and Error States

### Detection

The app uses Firestore's built-in offline cache. Network status is detected via `@react-native-community/netinfo` (already a transitive dependency of Expo). A `useNetworkStatus()` hook in `shared/hooks/useNetworkStatus.ts` subscribes to `NetInfo.addEventListener` and exposes `isConnected: boolean`.

### Per-screen behaviour

| Screen               | Loading                   | Empty                                        | Error                | Offline (cached)                          | Offline (no cache)                          |
| -------------------- | ------------------------- | -------------------------------------------- | -------------------- | ----------------------------------------- | ------------------------------------------- |
| CourseDiscovery      | `LoadingSkeleton`         | `AppEmptyState` + "Clear filters"            | Error card + "Retry" | "Offline — showing cached results" banner | "Offline — no cached data" notice, no cards |
| InstitutionDiscovery | `LoadingSkeleton`         | `AppEmptyState` + "Clear filters"            | Error card + "Retry" | Banner                                    | Notice                                      |
| CourseDetails        | Activity indicator        | N/A (courseId always valid)                  | Error card + "Retry" | Serve from local JSON (always available)  | Serve from local JSON                       |
| InstitutionDetails   | Activity indicator        | "No courses found" notice                    | Error card + "Retry" | Serve from local JSON                     | Serve from local JSON                       |
| SavedCourses         | Activity indicator        | "No saved courses" + link to CourseDiscovery | Error card + "Retry" | Serve Firestore cache                     | "Offline — saved courses unavailable"       |
| CourseComparison     | N/A (basket is in-memory) | "Add at least 2 courses" prompt              | N/A                  | N/A                                       | N/A                                         |

### Save disabled offline

When `isConnected === false`, the Save toggle is visually disabled (`opacity: 0.4`, `pointerEvents: 'none'`). If a student attempts to tap it, a toast displays: "Saving unavailable offline."

---

## Correctness Properties

_A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees._

### Property 1: Normalisation produces no undefined fields

_For any_ raw source record from any of the three datasets (with arbitrary null or missing fields), `normaliseCourses(record)` and `normaliseInstitutions(record)` shall return objects where every declared field is present (not `undefined`) — either with its actual value or the appropriate sentinel (`null` for strings/numbers, `[]` for arrays).

**Validates: Requirements 1.2**

---

### Property 2: URL normalisation is safe

_For any_ string input (including empty string, null, undefined, arbitrary text, or a valid HTTPS URL), `normaliseUrl(input)` shall return either the exact input string (when it matches `^https://[^\s]+$`) or `null` — never throwing and never returning an invalid partial URL.

**Validates: Requirements 1.5, 4.7, 5.1**

---

### Property 3: Deduplication is idempotent

_For any_ array of records that may contain repeated `id` values, `deduplicateById(records)` shall return a list where every `id` appears exactly once; applying `deduplicateById` a second time to the result shall return an identical list.

**Validates: Requirements 1.3, 7.9**

---

### Property 4: Course filter is sound

_For any_ array of `CourseRecord`s and any non-empty `CourseFilter`, every record returned by `filterCourses(courses, filter)` shall satisfy all active filter predicates simultaneously (logical AND); no record in the result shall fail any active predicate.

**Validates: Requirements 2.1, 2.4**

---

### Property 5: Sort produces a totally ordered result

_For any_ non-empty array of `CourseRecord`s and any valid `CourseSortOrder`, `sortCourses(courses, order)` shall return a list where for every adjacent pair `[a, b]` the ordering relation for that criterion holds (e.g., `a.name <= b.name` for `name-asc`, `a.fees <= b.fees` for `fees-asc` where `null` fees sort last).

**Validates: Requirements 2.2, 2.6**

---

### Property 6: Comparison basket add is bounded and idempotent

_For any_ basket of size 0–4 and any `CourseRecord`:

- If `basket.length < 4` and the course is not already in the basket, `add(course)` increases basket length by exactly 1.
- If the course is already in the basket, `add(course)` leaves the basket unchanged (idempotence).
- If `basket.length === 4`, `add(course)` leaves the basket unchanged regardless of which course is passed.

**Validates: Requirements 3.7, 3.8, 7.9**

---

### Property 7: Scholarship relevance filter is sound

_For any_ array of `ScholarshipRecord`s and any course with given `degree`, `stream`, and `category`, every record returned by `getRelevantScholarships(degree, stream, category)` shall have at least one term from `{degree, stream, category}` present (case-insensitive substring) in its `eligibility` field; no irrelevant scholarship shall appear in the result.

**Validates: Requirements 9.1, 9.4**

---

### Property 8: `toSavedEntry` produces a complete document

_For any_ `CourseRecord` and any non-empty `uid`, `toSavedEntry(uid, course)` shall return a `SavedCourseEntry` containing non-null values for `courseId`, `name`, `institutionName`, `degree`, and `city` — matching the corresponding fields from the input `CourseRecord`.

**Validates: Requirements 8.1**

---

## Error Handling

### Firestore write failures

`saveCourse` and `unsaveCourse` are async functions that may throw a Firebase error. The calling screen wraps the call in `try/catch`, reverts the optimistic toggle state, and shows a 3-second non-blocking toast.

### Missing `courseId` route param

If `getCourseById(courseId)` returns `undefined` (e.g., a stale deep link), `CourseDetailsScreen` renders an error card: "Course not found" with a "Go back" action.

### Missing `institutionId` route param

Same pattern in `InstitutionDetailsScreen`.

### Unauthenticated save attempt

Checked before calling `saveCourse`. If `user` is null, a sign-in prompt modal is shown; no Firestore write is attempted.

### Scholarship URL open failure

`Linking.openURL()` is wrapped in `try/catch`. On failure, or when `officialPortal` is null or fails `normaliseUrl`, a "Link unavailable" notice replaces the tap target.

---

## Testing Strategy

This project has no test suite configured yet. The testing strategy below defines what to set up and what to test.

### Recommended test framework

**Jest** with `@testing-library/react-native` for unit and component tests. **fast-check** for property-based tests (pure TypeScript functions). Configuration: `jest.config.js` at `apps/mobile/` level with `preset: 'jest-expo'`.

### Unit tests (example-based)

- `CourseDetailsScreen` renders "Not specified" for null fields.
- Pressing Save when authenticated calls `saveCourse` and sets toggle to active.
- Pressing Save when unauthenticated shows sign-in prompt without Firestore write.
- `ComparisonBadge` is visible when basket count ≥ 2 and hidden when count < 2.
- Navigating Back from `CourseDetailsScreen` does not clear the comparison basket.

### Property-based tests

Each property test uses **fast-check** and is configured with at minimum 100 runs per property (`fc.assert(..., { numRuns: 100 })`). Each test is tagged with a comment in the format:

```ts
// Feature: course-discovery-comparison, Property N: <property_text>
```

| Property                               | Test file                     | Generator                                                           |
| -------------------------------------- | ----------------------------- | ------------------------------------------------------------------- |
| Property 1 (normalisation)             | `normalise-courses.test.ts`   | `fc.record` with optional/nullable fields                           |
| Property 2 (URL normalisation)         | `normalise-courses.test.ts`   | `fc.string()`, `fc.webUrl()`, `fc.constant(null)`                   |
| Property 3 (deduplication idempotence) | `normalise-courses.test.ts`   | `fc.array(fc.record({ id: fc.string() }))` with duplicates          |
| Property 4 (filter soundness)          | `course-service.test.ts`      | `fc.array(arbitraryCourseRecord())`, `fc.record(arbitraryFilter())` |
| Property 5 (sort ordering)             | `course-service.test.ts`      | `fc.array(arbitraryCourseRecord(), { minLength: 2 })`               |
| Property 6 (basket invariants)         | `ComparisonContext.test.ts`   | `fc.array(arbitraryCourseRecord(), { maxLength: 4 })`               |
| Property 7 (scholarship filter)        | `scholarship-service.test.ts` | `fc.array(arbitraryScholarshipRecord())`, `fc.string()`             |
| Property 8 (toSavedEntry)              | `course-service.test.ts`      | `arbitraryCourseRecord()`, `fc.string({ minLength: 1 })`            |

### Type checking

`tsc --noEmit` run against `apps/mobile/tsconfig.json` as part of CI (existing `.github/workflows/validate.yml`). All new files must pass without errors.

### Linting

ESLint with the existing project config. Run `npx eslint apps/mobile/src/features/courses apps/mobile/src/features/colleges apps/mobile/src/shared`.

### Future Firestore seeder note

When a live Firestore-backed deployment is needed, a `scripts/seed-courses.ts` Node.js script should be added following the same pattern as `scripts/import-college-comparison-dataset.ts`. It would call `normaliseInstitutions()` and `normaliseCourses()` from the normalisation layer (reusing the same logic), then write to Firestore in batches of ≤ 500 using the Admin SDK. The `scholarships` Firestore collection would be seeded from `data/scholarship_dataset.json`. No mobile app code change would be required; the service layer would be switched from local JSON to Firestore reads by swapping the data source in `course-catalog.ts`.
