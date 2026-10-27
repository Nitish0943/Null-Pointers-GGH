# Implementation Plan: Course Discovery & Comparison

## Overview

Replace the three demo-data course/comparison screens with live Firestore-backed and local-JSON-powered screens; add three new screens (InstitutionDiscovery, InstitutionDetails, SavedCourses); wire everything together through a shared `ComparisonContext` and three service modules. Data for courses, institutions, and scholarships is served from bundled JSON files. Only `user-data/{uid}/saved-courses` touches Firestore.

---

## Tasks

### Group 1 — Foundation (types · normalisation · services)

- [x] 1. Create TypeScript domain types
  - [x] 1.1 Create `apps/mobile/src/shared/types/course.ts`
    - Export `CourseRecord` with all fields from the design: `id`, `institutionId`, `name`, `institutionName`, `degree`, `stream`, `specialization`, `location`, `city`, `state`, `duration`, `fees`, `studyMode`, `eligibility`, `admissionProcess`, `applicationDeadline`, `accreditation`, `officialUrl`, `category`, `keywords`
    - All optional text fields typed `string | null`; `fees` typed `number | null`; `keywords` typed `string[]`
    - _Requirements: 1.6_

  - [x] 1.2 Create `apps/mobile/src/shared/types/institution.ts`
    - Export `InstitutionRecord` with fields: `id`, `name`, `city`, `state`, `type`, `management`, `affiliation`, `officialUrl`, `courseIds`, `nirfRank`, `rating`, `programmeSummary`
    - _Requirements: 1.7_

  - [x] 1.3 Create `apps/mobile/src/shared/types/scholarship.ts`
    - Export `ScholarshipRecord` with fields: `id`, `name`, `eligibility`, `requiredDocuments`, `applicationPeriod`, `officialPortal`
    - _Requirements: 9.1_

  - [x] 1.4 Create `apps/mobile/src/shared/types/saved-course.ts`
    - Export `SavedCourseEntry` with fields: `courseId`, `savedAt` (`unknown` for Firestore `serverTimestamp()`), `name`, `institutionName`, `degree`, `city`
    - _Requirements: 8.1_

- [x] 2. Create normalisation layer
  - [x] 2.1 Create `apps/mobile/src/features/courses/data/normalise-courses.ts`
    - Implement `normaliseUrl(raw: string | null | undefined): string | null` — returns value only when it matches `^https://[^\s]+$`, otherwise `null`; never throws
    - Implement `deduplicateById<T extends { id: string }>(records: T[]): T[]` — keeps first occurrence per `id`, idempotent
    - Implement `normaliseCourseRecord(raw: unknown): CourseRecord` — maps all three source JSON schemas to `CourseRecord`; substitutes `null` for missing string/number fields and `[]` for missing array fields; no field is ever `undefined`
    - Implement `normaliseCourses(rawRecords: unknown[]): CourseRecord[]` — applies `normaliseCourseRecord` to every element, then `deduplicateById`
    - _Requirements: 1.2, 1.3, 1.5, 1.6_

  - [ ]* 2.2 Write property test for `normaliseUrl`
    - **Property 2: URL normalisation is safe** — for any string/null/undefined input, `normaliseUrl` returns the exact input or `null`, never throws, never returns a partial URL
    - File: `apps/mobile/src/__tests__/normalise-courses.test.ts`; use `fast-check`; `fc.string()`, `fc.webUrl()`, `fc.constant(null)`, `fc.constant(undefined)` generators; `numRuns: 100`
    - Tag: `// Feature: course-discovery-comparison, Property 2: URL normalisation is safe`
    - **Validates: Requirements 1.5, 4.7, 5.1**

  - [ ]* 2.3 Write property test for `deduplicateById`
    - **Property 3: Deduplication is idempotent** — for any array with possible duplicate `id` values, every `id` appears exactly once; applying `deduplicateById` twice returns the same list
    - File: `apps/mobile/src/__tests__/normalise-courses.test.ts`; generator: `fc.array(fc.record({ id: fc.string() }))` with appended duplicates
    - Tag: `// Feature: course-discovery-comparison, Property 3: Deduplication is idempotent`
    - **Validates: Requirements 1.3, 7.9**

  - [ ]* 2.4 Write property test for `normaliseCourseRecord`
    - **Property 1: Normalisation produces no undefined fields** — for any raw record with arbitrary null/missing fields, every declared `CourseRecord` field is present and not `undefined`
    - File: `apps/mobile/src/__tests__/normalise-courses.test.ts`; generator: `fc.record` with optional/nullable fields for all three source schemas
    - Tag: `// Feature: course-discovery-comparison, Property 1: Normalisation produces no undefined fields`
    - **Validates: Requirements 1.2**

  - [x] 2.5 Create `apps/mobile/src/features/colleges/data/normalise-institutions.ts`
    - Implement `normaliseInstitutionRecord(raw: unknown): InstitutionRecord` — maps `chhattisgarh_college_comparison_dataset.json` schema and merges supplementary fields from `chhattisgarh_50_colleges_enrollment_template.json`; all fields `null`-safe; derives `institutionId` slug when `college_id` absent
    - Implement `normaliseInstitutions(rawRecords: unknown[]): InstitutionRecord[]` — applies normaliser then deduplicates by `id`
    - _Requirements: 1.2, 1.7_

  - [x] 2.6 Create `apps/mobile/src/features/courses/data/course-catalog.ts`
    - Import all three JSON source files from `../../../../../../../data/` using `require` (consistent with existing `college-catalog.json` pattern)
    - Call `normaliseCourses()` and `normaliseInstitutions()` to produce module-level singletons `COURSES: CourseRecord[]` and `INSTITUTIONS: InstitutionRecord[]`
    - Populate each `InstitutionRecord.courseIds` by cross-referencing `COURSES`
    - _Requirements: 1.1, 1.6, 1.7_

  - [x] 2.7 Create `apps/mobile/src/features/courses/data/scholarship-catalog.ts`
    - Import `data/scholarship_dataset.json`
    - Normalise each record to `ScholarshipRecord`; apply `normaliseUrl` to `officialPortal`; export `SCHOLARSHIPS: ScholarshipRecord[]`
    - _Requirements: 1.1_

- [x] 3. Create `course-service.ts`
  - [x] 3.1 Create `apps/mobile/src/features/courses/services/course-service.ts` — pure functions
    - Export `CourseFilter` and `CourseSortOrder` types as defined in the design
    - Implement `getCourses(filter?, sort?, page?, pageSize?): { results: CourseRecord[]; total: number }` — operates on `COURSES` array; filters by all `CourseFilter` fields simultaneously (logical AND, case-insensitive substring for query); sorts per `CourseSortOrder` (null fees sort last for fee orders); paginates 20 per page
    - Implement `getCourseById(id: string): CourseRecord | undefined` — pure lookup
    - Implement `getRelatedCourses(institutionId, excludeId): CourseRecord[]` — up to 5 same-institution courses
    - Implement `getSimilarCourses(degree, stream, excludeInstitutionId): CourseRecord[]` — up to 5 matching degree+stream from other institutions
    - Implement `toSavedEntry(uid, course): SavedCourseEntry` — pure, maps `CourseRecord` fields to `SavedCourseEntry` snapshot; all fields non-null
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.6, 4.3, 4.4, 8.1_

  - [ ]* 3.2 Write property test for `getCourses` filter soundness
    - **Property 4: Course filter is sound** — every record returned by `getCourses` satisfies all active filter predicates simultaneously
    - File: `apps/mobile/src/__tests__/course-service.test.ts`; generators: `fc.array(arbitraryCourseRecord())`, `fc.record(arbitraryFilter())`; `numRuns: 100`
    - Tag: `// Feature: course-discovery-comparison, Property 4: Course filter is sound`
    - **Validates: Requirements 2.1, 2.4**

  - [ ]* 3.3 Write property test for `getCourses` sort ordering
    - **Property 5: Sort produces a totally ordered result** — for any non-empty array and any valid `CourseSortOrder`, adjacent pairs satisfy the ordering relation; null fees appear after all non-null fees for fee-based sorts
    - File: `apps/mobile/src/__tests__/course-service.test.ts`; generator: `fc.array(arbitraryCourseRecord(), { minLength: 2 })`
    - Tag: `// Feature: course-discovery-comparison, Property 5: Sort produces a totally ordered result`
    - **Validates: Requirements 2.2, 2.6**

  - [ ]* 3.4 Write property test for `toSavedEntry`
    - **Property 8: `toSavedEntry` produces a complete document** — for any `CourseRecord` and non-empty `uid`, all required fields of the returned `SavedCourseEntry` are non-null and match the course input
    - File: `apps/mobile/src/__tests__/course-service.test.ts`; generators: `arbitraryCourseRecord()`, `fc.string({ minLength: 1 })`
    - Tag: `// Feature: course-discovery-comparison, Property 8: toSavedEntry produces a complete document`
    - **Validates: Requirements 8.1**

  - [x] 3.5 Add Firestore functions to `course-service.ts`
    - Implement `saveCourse(uid, course): Promise<void>` — calls `setDoc` on `user-data/{uid}/saved-courses/{course.id}` using `toSavedEntry`; throws on Firestore error
    - Implement `unsaveCourse(uid, courseId): Promise<void>` — calls `deleteDoc`; throws on Firestore error
    - Implement `getSavedCourses(uid, onChange, onError): () => void` — calls `onSnapshot` on the saved-courses subcollection; returns unsubscribe function
    - Import `getFirebaseFirestore` from `shared/services/firebase-client`; handle null Firestore (not yet initialised) by throwing a descriptive error
    - _Requirements: 8.1, 8.3, 8.5, 12.5_

- [x] 4. Create `institution-service.ts`
  - [x] 4.1 Create `apps/mobile/src/features/colleges/services/institution-service.ts`
    - Import `INSTITUTIONS` and `COURSES` from `course-catalog`
    - Export `InstitutionFilter` type with fields: `query`, `city`, `management`, `type`, `affiliation`
    - Implement `getInstitutions(filter?, page?, pageSize?): { results: InstitutionRecord[]; total: number }` — 300 ms debounce handled in the screen hook, not here; filtering is synchronous; 20 per page
    - Implement `getInstitutionById(id): InstitutionRecord | undefined`
    - Implement `getCoursesByInstitution(institutionId): CourseRecord[]` — filters `COURSES` by `institutionId`
    - _Requirements: 5.1, 5.2, 5.4, 6.1, 6.3_

- [x] 5. Create `scholarship-service.ts`
  - [x] 5.1 Create `apps/mobile/src/shared/services/scholarship-service.ts`
    - Import `SCHOLARSHIPS` from `features/courses/data/scholarship-catalog`
    - Implement module-level `Map` cache keyed by `${degree}|${stream ?? ''}|${category}`
    - Implement `getRelevantScholarships(degree, stream, category): ScholarshipRecord[]` — returns records whose `eligibility` field contains at least one term from `{degree, stream, category}` (case-insensitive); caches results per key; returns `[]` on zero matches without throwing
    - Implement `getScholarships(): ScholarshipRecord[]` — returns full array
    - Implement `deduplicateScholarships(records): ScholarshipRecord[]` — deduplicates by `id`
    - _Requirements: 9.1, 9.2, 9.4, 9.6_

  - [ ]* 5.2 Write property test for `getRelevantScholarships`
    - **Property 7: Scholarship relevance filter is sound** — every returned `ScholarshipRecord` has at least one term from `{degree, stream, category}` in its `eligibility` field; no irrelevant scholarship appears
    - File: `apps/mobile/src/__tests__/scholarship-service.test.ts`; generators: `fc.array(arbitraryScholarshipRecord())`, `fc.string()`; `numRuns: 100`
    - Tag: `// Feature: course-discovery-comparison, Property 7: Scholarship relevance filter is sound`
    - **Validates: Requirements 9.1, 9.4**

- [x] 6. Create `ComparisonContext`
  - [x] 6.1 Create `apps/mobile/src/features/courses/context/ComparisonContext.tsx`
    - Implement `ComparisonProvider` and `useComparison()` hook exactly as specified in the design
    - `add(course)`: no-op if basket already has 4 entries OR course already in basket; otherwise appends
    - `remove(courseId)`: filters by id
    - `clear()`: resets to `[]`
    - Export `ComparisonContextValue` type
    - _Requirements: 3.7, 3.8, 7.7, 7.9_

  - [ ]* 6.2 Write property test for `ComparisonContext` basket invariants
    - **Property 6: Comparison basket add is bounded and idempotent** — `add` with a new course when `length < 4` increases length by 1; `add` for a duplicate leaves basket unchanged; `add` when `length === 4` leaves basket unchanged
    - File: `apps/mobile/src/__tests__/ComparisonContext.test.ts`; generator: `fc.array(arbitraryCourseRecord(), { maxLength: 4 })`; test by calling `add` directly on the context value
    - Tag: `// Feature: course-discovery-comparison, Property 6: Comparison basket add is bounded and idempotent`
    - **Validates: Requirements 3.7, 3.8, 7.9**

- [x] 7. Checkpoint — verify foundation
  - Run `pnpm --filter @mantrix/mobile typecheck` and `pnpm --filter @mantrix/mobile lint`. Fix any type errors before continuing.

---

### Group 2 — Shared Components

- [ ] 8. Create `CourseCard` component
  - [-] 8.1 Create `apps/mobile/src/shared/components/cards/CourseCard.tsx`
    - Props: `CourseCardProps` as defined in the design (`course`, `isSaved`, `isInBasket`, `onPress`, `onSaveToggle`, `onAddToCompare`)
    - Render: course name, institution name, degree, city, duration, fees (or "Not specified" when null), eligibility summary (first 80 chars + ellipsis when truncated)
    - Save toggle: filled state when `isSaved`, outline state otherwise; `accessibilityLabel` reflects current state
    - Add-to-Compare control: active/selected state when `isInBasket`
    - Follows Mantrix `StyleSheet` pattern using colors from `shared/theme`
    - _Requirements: 3.1, 3.2, 3.6_

- [ ] 9. Create `InstitutionCard` component
  - [-] 9.1 Create `apps/mobile/src/shared/components/cards/InstitutionCard.tsx`
    - Props: `InstitutionCardProps` (`institution`, `courseCount`, `onPress`)
    - Render: institution name, city, management type, affiliation, course count
    - Follows Mantrix `StyleSheet` pattern
    - _Requirements: 5.4_

- [ ] 10. Create `ScholarshipChip` component
  - [-] 10.1 Create `apps/mobile/src/shared/components/cards/ScholarshipChip.tsx`
    - Props: `ScholarshipChipProps` (`scholarship`, `onPress`)
    - Compact row: scholarship name + eligibility summary
    - `onPress` is called by the parent; the parent is responsible for opening `officialPortal` or showing "Link unavailable"
    - _Requirements: 4.5, 4.6, 9.5_

- [ ] 11. Create `ComparisonBadge` component
  - [-] 11.1 Create `apps/mobile/src/shared/components/ui/ComparisonBadge.tsx`
    - Props: `ComparisonBadgeProps` (`count`, `onPress`)
    - Renders "Compare (N)" button; must be hidden when `count < 2` (render `null`)
    - `accessibilityRole="button"`; `accessibilityLabel="Compare N courses"`
    - _Requirements: 10.5, 10.6_

- [ ] 12. Create `LoadingSkeleton` component
  - [-] 12.1 Create `apps/mobile/src/shared/components/feedback/LoadingSkeleton.tsx`
    - Props: `LoadingSkeletonProps` (`rows?: number`, default 5)
    - Renders animated placeholder rows matching `CourseCard` height using `Animated.loop` + `Animated.sequence` or a pulsing opacity animation
    - _Requirements: 2.9, 5.6, 11.1_

- [~] 13. Checkpoint — verify shared components
  - Run `pnpm --filter @mantrix/mobile typecheck` and `pnpm --filter @mantrix/mobile lint`. Fix any errors before continuing.

---

### Group 3 — Screen Implementations

- [ ] 14. Rewrite `CourseDiscoveryScreen`
  - [~] 14.1 Replace hardcoded data and add hook + service integration
    - Modify `apps/mobile/src/features/courses/screens/CourseDiscoveryScreen.tsx`
    - Remove hardcoded `courses[]` and `categories[]` arrays
    - Call `getCourses(filter, sort, page)` on mount and when filter/sort/query changes; manage state with `useState` + `useEffect`
    - Show `LoadingSkeleton` (5 rows) while initial data loads
    - Show error card with "Retry" button on Firestore/service error (per Requirement 2.10)
    - Show `AppEmptyState` with "Clear filters" when result list is empty (Requirement 2.5)
    - Implement "Load more" control: fetches next page when list > 20; shows inline loading indicator while in-flight (Requirements 2.7, 2.11)
    - Update result count label simultaneously with the list (Requirement 2.8)
    - Replace the single `Compare` text button in the header with `ComparisonBadge` (count from `useComparison()`); badge only visible when `basket.length >= 2`
    - _Requirements: 2.1–2.11, 10.2, 10.5, 10.6_

  - [~] 14.2 Add Save and Add-to-Compare actions to `CourseDiscoveryScreen`
    - Subscribe to `getSavedCourses(uid, ...)` via `useEffect`; store saved IDs in state
    - Render `CourseCard` components replacing inline card JSX; pass `isSaved`, `isInBasket`, `onSaveToggle`, `onAddToCompare` props
    - On `onSaveToggle`: optimistic toggle; call `saveCourse`/`unsaveCourse`; on error revert state and show 3-second toast (Requirements 3.2, 3.3, 3.5)
    - On unauthenticated save: show sign-in prompt, no Firestore write (Requirement 3.4)
    - On `onAddToCompare`: call `comparison.add(course)`; if basket full show inline message (Requirements 3.7, 3.8)
    - Offline: disable save toggle, show "Saving unavailable offline" toast on attempt using `useNetworkStatus()` hook from `shared/hooks/useNetworkStatus.ts` (create this hook; uses `@react-native-community/netinfo`) (Requirement 11.7)
    - _Requirements: 3.2–3.9, 11.5–11.8_

- [ ] 15. Rewrite `CourseDetailsScreen`
  - [~] 15.1 Replace hardcoded data with `getCourseById` and display all `CourseRecord` fields
    - Modify `apps/mobile/src/features/courses/screens/CourseDetailsScreen.tsx`
    - Replace `detailsByCourse` lookup with `getCourseById(route.params.courseId)`; show "Course not found" error card with "Go back" if `undefined`
    - Render all `CourseRecord` fields; display "Not specified" for any null field (Requirements 4.1, 4.2)
    - Render institution name as a `Pressable` that navigates to `InstitutionDetails` with the institution's `institutionId`
    - Show activity indicator while resolving (course data is synchronous; indicator shows for at most one frame — retain for consistency)
    - _Requirements: 4.1, 4.2, 4.10_

  - [~] 15.2 Add related courses, similar courses, and scholarship sections
    - "Related courses from this institution" section: call `getRelatedCourses(institutionId, courseId)`; render up to 5 `CourseCard`s; show "No related courses available" when empty (Requirement 4.3)
    - "Similar courses at other institutions" section: call `getSimilarCourses(degree, stream, institutionId)`; render up to 5 `CourseCard`s; show "No similar courses found" when empty (Requirement 4.4)
    - "Relevant scholarships" section: call `getRelevantScholarships(degree, stream, category)`; render up to 4 `ScholarshipChip`s; show "No scholarships found for this course" when empty (Requirements 4.5, 9.3)
    - Tapping a `ScholarshipChip`: open `officialPortal` via `Linking.openURL` if valid HTTPS; else show "Link unavailable" notice (Requirements 4.6, 9.5)
    - Tapping official course URL: open if valid HTTPS; else show "Link unavailable" (Requirement 4.7)
    - _Requirements: 4.3–4.7, 9.3, 9.5_

  - [~] 15.3 Add Save toggle and Add-to-Compare button
    - Subscribe to `getSavedCourses` via `useEffect`; initialise save toggle from saved IDs
    - Save toggle: add/remove from Firestore on press; optimistic update; revert + toast on error (Requirement 4.8)
    - Add-to-Compare button: call `comparison.add(course)`; if basket has room navigate to `CourseComparison`; if full show notice (Requirement 4.9)
    - Back navigation preserves `ComparisonContext` basket (Requirement 4.10)
    - _Requirements: 4.8, 4.9, 4.10_

- [ ] 16. Rewrite `CourseComparisonScreen`
  - [~] 16.1 Replace hardcoded data with `ComparisonContext` basket and implement comparison table
    - Modify `apps/mobile/src/features/courses/screens/CourseComparisonScreen.tsx`
    - Remove hardcoded `courses[]` and local `selectedIds` state; read basket from `useComparison()`
    - Render comparison table: one column per basket item, rows for all fields defined in Requirement 7.1; null cells display "—" (Requirements 7.1, 7.2)
    - Wrap table in a horizontal `ScrollView` to support 3–4 columns without clipping (Requirement 7.10)
    - Each column header has a dismiss `Pressable` that calls `comparison.remove(courseId)` (Requirement 7.3)
    - "+ Add course" slot for each empty basket position (up to 4); tapping navigates to `CourseDiscovery` (Requirement 7.6)
    - When basket has fewer than 2 courses, show prompt with "Add courses" button to `CourseDiscovery` (Requirement 7.5)
    - _Requirements: 7.1–7.3, 7.5, 7.6, 7.10_

  - [~] 16.2 Add "Clear all" dialog and scholarship section to `CourseComparisonScreen`
    - "Clear all" button: show `Alert.alert` confirmation dialog; on confirm call `comparison.clear()`; on cancel leave basket unchanged (Requirement 7.4)
    - Scholarship section: aggregate `getRelevantScholarships` calls for all basket courses; dedup with `deduplicateScholarships`; render `ScholarshipChip` rows (Requirements 7.8, 9.4)
    - Tapping a scholarship chip: open `officialPortal` or show "Link unavailable" (Requirement 9.5)
    - _Requirements: 7.4, 7.7, 7.8_

- [ ] 17. Create `InstitutionDiscoveryScreen`
  - [~] 17.1 Create `apps/mobile/src/features/colleges/screens/InstitutionDiscoveryScreen.tsx`
    - Implement 300 ms debounced search input using `useRef` + `setTimeout`/`clearTimeout`; filter updates after debounce (Requirement 5.1)
    - Filter chips for city, management, type, affiliation (Requirement 5.2)
    - Call `getInstitutions(filter, page)` on mount and on filter change
    - Render one `InstitutionCard` per `InstitutionRecord`; pass `courseCount` from `institution.courseIds.length`
    - Infinite scroll: detect scroll within 200 px of bottom using `ScrollView` `onScroll` + `contentSize`; fetch next page and append (Requirement 5.8)
    - `LoadingSkeleton` while loading; `AppEmptyState` with "Clear filters" on empty (Requirements 5.5, 5.6); error card with "Retry" on failure (Requirement 5.7)
    - Tapping card navigates to `InstitutionDetails` with `institutionId` (Requirement 5.3)
    - Follows Mantrix `StyleSheet` pattern
    - _Requirements: 5.1–5.8, 10.3, 10.7_

- [ ] 18. Create `InstitutionDetailsScreen`
  - [~] 18.1 Create `apps/mobile/src/features/colleges/screens/InstitutionDetailsScreen.tsx`
    - Route params: `{ institutionId: string }`
    - Call `getInstitutionById(institutionId)`; show "Institution not found" error card if `undefined`
    - Display all institution metadata fields; null → "Not specified" (Requirement 6.1)
    - Call `getCoursesByInstitution(institutionId)` for the course list
    - `LoadingSkeleton` while resolving; error with "Retry" on failure; "No courses found for this institution" notice on zero results (Requirement 6.2)
    - Render each course as a `CourseCard` with Save and Add-to-Compare controls; tapping "View Details" navigates to `CourseDetails` (Requirements 6.3, 6.4)
    - Official URL: open if valid HTTPS; else "Link unavailable" notice (Requirement 6.5)
    - "Compare courses from this institution" button: navigate to `CourseComparison` (Requirement 6.6)
    - Follows Mantrix `StyleSheet` pattern
    - _Requirements: 6.1–6.6_

- [ ] 19. Create `SavedCoursesScreen`
  - [~] 19.1 Create `apps/mobile/src/features/courses/screens/SavedCoursesScreen.tsx`
    - Redirect to `Login` screen if `user` is null (from `useAuth()`)
    - Subscribe to `getSavedCourses(uid, onChange, onError)` via `useEffect`; clean up on unmount
    - Render each saved course as a `CourseCard` with unsave action; unsave calls `unsaveCourse`; optimistic update with revert on error
    - Empty state: "You have not saved any courses yet" with link to `CourseDiscovery` (Requirement 8.7)
    - Activity indicator while listener establishes; error card with "Retry" on `onError` callback
    - Follows Mantrix `StyleSheet` pattern
    - _Requirements: 8.3, 8.4, 8.6, 8.7_

- [~] 20. Checkpoint — verify all screens
  - Run `pnpm --filter @mantrix/mobile typecheck` and `pnpm --filter @mantrix/mobile lint`. Fix all errors before integration.

---

### Group 4 — Integration

- [ ] 21. Update `AppNavigator`
  - [~] 21.1 Add new route types and screen registrations to `apps/mobile/src/app/AppNavigator.tsx`
    - Add to `CoreStackParamList`: `InstitutionDiscovery: undefined`, `InstitutionDetails: { institutionId: string }`, `SavedCourses: undefined`
    - Import `InstitutionDiscoveryScreen`, `InstitutionDetailsScreen`, `SavedCoursesScreen` from their respective paths
    - Register three new `Stack.Screen` entries alongside the existing `CourseDiscovery`/`CourseDetails`/`CourseComparison` entries
    - _Requirements: 10.7, 10.8, 10.9_

  - [~] 21.2 Wrap `Stack.Navigator` with `ComparisonProvider`
    - Import `ComparisonProvider` from `features/courses/context/ComparisonContext`
    - Wrap the `<Stack.Navigator>` JSX inside `<ComparisonProvider>` so basket state persists across all navigations
    - _Requirements: 7.7_

- [ ] 22. Update `HomeScreen`
  - [~] 22.1 Replace quick-action entries in `apps/mobile/src/features/dashboard/screens/HomeScreen.tsx`
    - Replace the current three `quickActions` entries (Take assessment, Explore careers, Find courses) with: `Discover Courses` → `CourseDiscovery`, `Explore Institutions` → `InstitutionDiscovery`, `Saved Courses` → `SavedCourses`
    - Move `Take assessment` and `Explore careers` to a new "Continue your journey" section below the quick actions (preserve existing functionality — these screens still exist)
    - Update `onPress` handlers to use the correct `navigation.navigate` calls for all five items
    - _Requirements: 10.1–10.4_

- [ ] 23. Update Firestore security rules
  - [~] 23.1 Add `scholarships` collection rule to `firebase/firestore/firestore.rules`
    - Add block: `match /scholarships/{docId} { allow read: if signedIn(); allow write: if isAdmin(); }`
    - Insert after the existing `match /courses/{docId}` block so it is consistent with the `colleges` and `courses` pattern
    - _Requirements: 12.3_

- [~] 24. Final checkpoint — full integration verification
  - Run `pnpm --filter @mantrix/mobile typecheck` and `pnpm --filter @mantrix/mobile lint`. All checks must pass with zero errors.

---

## Notes

- Tasks marked `*` are optional property-based tests; they can be skipped for a faster MVP but are highly recommended for the pure-function service layer
- Property tests require `fast-check` to be installed: `pnpm --filter @mantrix/mobile add -D fast-check` and `jest-expo` preset configuration at `apps/mobile/jest.config.js`
- All screens follow the existing Mantrix `StyleSheet.create` pattern with colours from `apps/mobile/src/shared/theme/index.ts`
- The `useNetworkStatus` hook created in task 14.2 can be reused in all screens that need offline detection
- Firestore is null-safe throughout: all service functions that use `getFirebaseFirestore()` must handle a `null` return (Firebase not yet initialised) by throwing a descriptive error that screens catch and display
- The `data/` directory at the monorepo root contains the four JSON source files; import them via relative paths from the bundled module files (the Metro bundler resolves paths outside `src/` as long as they are within the app root configured in `app.json`/`metro.config.js`)

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3", "1.4"] },
    { "id": 1, "tasks": ["2.1", "2.5"] },
    { "id": 2, "tasks": ["2.2", "2.3", "2.4", "2.6"] },
    { "id": 3, "tasks": ["2.7", "3.1", "4.1"] },
    { "id": 4, "tasks": ["3.2", "3.3", "3.4", "3.5", "5.1", "6.1"] },
    { "id": 5, "tasks": ["5.2", "6.2", "8.1", "9.1", "10.1", "11.1", "12.1"] },
    { "id": 6, "tasks": ["14.1", "17.1", "19.1"] },
    { "id": 7, "tasks": ["14.2", "15.1", "18.1"] },
    { "id": 8, "tasks": ["15.2", "16.1"] },
    { "id": 9, "tasks": ["15.3", "16.2"] },
    { "id": 10, "tasks": ["21.1"] },
    { "id": 11, "tasks": ["21.2", "22.1", "23.1"] }
  ]
}
```
