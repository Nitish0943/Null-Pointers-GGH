/**
 * course-catalog.ts
 *
 * Imports all three Chhattisgarh JSON datasets, normalises them, and exports
 * two module-level singleton arrays used throughout the app:
 *
 *   COURSES      — deduplicated CourseRecord[]  (from all three datasets)
 *   INSTITUTIONS — deduplicated InstitutionRecord[] with courseIds populated
 */

import type { CourseRecord } from '../../../shared/types/course';
import type { InstitutionRecord } from '../../../shared/types/institution';
import { normaliseCourses } from './normalise-courses';
import { normaliseInstitutions } from '../../colleges/data/normalise-institutions';

// ---------------------------------------------------------------------------
// JSON imports
// The data/ directory lives at the monorepo root.
// From apps/mobile/src/features/courses/data/ that is 6 levels up.
// resolveJsonModule is enabled in the Expo tsconfig base, so typed imports work.
// ---------------------------------------------------------------------------

import dataset1Json from '../../../../../../data/chhattisgarh_college_comparison_dataset.json';
import dataset2Json from '../../../../../../data/chhattisgarh_50_colleges_enrollment_template.json';
import dataset3Json from '../../../../../../data/chhattisgarh_50_college_course_comparison_dataset.json';

// ---------------------------------------------------------------------------
// Extract raw record arrays from each dataset
// Each dataset uses a different top-level key.
// ---------------------------------------------------------------------------

const dataset1Records: unknown[] = Array.isArray(
  (dataset1Json as { colleges?: unknown[] }).colleges,
)
  ? ((dataset1Json as { colleges: unknown[] }).colleges as unknown[])
  : [];

const dataset2Records: unknown[] = Array.isArray(
  (dataset2Json as { records?: unknown[] }).records,
)
  ? ((dataset2Json as { records: unknown[] }).records as unknown[])
  : [];

const dataset3Records: unknown[] = Array.isArray(
  (dataset3Json as { colleges?: unknown[] }).colleges,
)
  ? ((dataset3Json as { colleges: unknown[] }).colleges as unknown[])
  : [];

// ---------------------------------------------------------------------------
// COURSES — normalise all three datasets and merge into one deduplicated list
// ---------------------------------------------------------------------------

export const COURSES: CourseRecord[] = normaliseCourses([
  ...dataset1Records,
  ...dataset2Records,
  ...dataset3Records,
]);

// ---------------------------------------------------------------------------
// INSTITUTIONS — datasets 1 and 2 carry institution-level metadata
// ---------------------------------------------------------------------------

const baseInstitutions: InstitutionRecord[] = normaliseInstitutions([
  ...dataset1Records,
  ...dataset2Records,
]);

// Populate each institution's courseIds by cross-referencing COURSES.
// This mutates the records in-place; they are freshly created by
// normaliseInstitutions so there are no external aliases to worry about.
for (const institution of baseInstitutions) {
  institution.courseIds = COURSES
    .filter((course) => course.institutionId === institution.id)
    .map((course) => course.id);
}

export const INSTITUTIONS: InstitutionRecord[] = baseInstitutions;
