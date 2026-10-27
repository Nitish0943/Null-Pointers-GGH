import type { CourseRecord } from '../../../shared/types/course';

// ---------------------------------------------------------------------------
// URL helpers
// ---------------------------------------------------------------------------

const HTTPS_URL_RE = /^https:\/\/[^\s]+$/;

/**
 * Returns the raw value when it matches `^https://[^\s]+$`, otherwise `null`.
 * Never throws for any input.
 */
export function normaliseUrl(raw: string | null | undefined): string | null {
  if (raw == null) return null;
  const trimmed = String(raw).trim();
  return HTTPS_URL_RE.test(trimmed) ? trimmed : null;
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

/**
 * Keeps the first occurrence of each `id`.  Idempotent — calling it twice on
 * the same array produces the same result.  Pure function.
 */
export function deduplicateById<T extends { id: string }>(records: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const record of records) {
    if (!seen.has(record.id)) {
      seen.add(record.id);
      out.push(record);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Slugify
// ---------------------------------------------------------------------------

/**
 * Converts a string into a URL-safe, lowercase, hyphen-separated identifier.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // strip non-alphanumeric (except spaces/hyphens)
    .replace(/[\s-]+/g, '-') // collapse whitespace / hyphens to single hyphen
    .replace(/^-+|-+$/g, ''); // strip leading / trailing hyphens
}

// ---------------------------------------------------------------------------
// Safe field extractors
// ---------------------------------------------------------------------------

function safeStr(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function safeNum(value: unknown): number | null {
  return typeof value === 'number' ? value : null;
}

function safeArr(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map((v) => safeStr(v)).filter((v): v is string => v !== null);
}

// ---------------------------------------------------------------------------
// Dataset-shape detection helpers
// ---------------------------------------------------------------------------

/**
 * Dataset 1 — `chhattisgarh_college_comparison_dataset.json`
 * Top-level discriminator: has `courses.programme_summary`
 */
function isDataset1(raw: Record<string, unknown>): boolean {
  const courses = raw['courses'];
  return (
    courses != null &&
    typeof courses === 'object' &&
    !Array.isArray(courses) &&
    'programme_summary' in (courses as object)
  );
}

/**
 * Dataset 2 — `chhattisgarh_50_colleges_enrollment_template.json`
 * Top-level discriminator: has `course_categories` array
 */
function isDataset2(raw: Record<string, unknown>): boolean {
  return Array.isArray(raw['course_categories']);
}

/**
 * Dataset 3 — `chhattisgarh_50_college_course_comparison_dataset.json`
 * Top-level discriminator: has `courses_for_comparison` array
 */
function isDataset3(raw: Record<string, unknown>): boolean {
  return Array.isArray(raw['courses_for_comparison']);
}

// ---------------------------------------------------------------------------
// Per-dataset record builders
// ---------------------------------------------------------------------------

/** Build a single CourseRecord from a Dataset 1 college + one programme name */
function buildFromDataset1(
  raw: Record<string, unknown>,
  programmeName: string,
): CourseRecord {
  const collegeName = safeStr(raw['college_name']) ?? '';
  const institutionId = safeStr(raw['id']) ?? slugify(collegeName);

  const courses = raw['courses'] as Record<string, unknown> | undefined;
  const duration = safeStr(courses?.['course_duration']);
  const fees = safeNum(courses?.['course_fees_inr']);

  const placements = raw['placements'] as Record<string, unknown> | undefined;
  const avgPkg = safeNum(placements?.['average_package_lpa']);

  const city = safeStr(raw['city_or_district']) ?? '';
  const state = safeStr(raw['state']) ?? 'Chhattisgarh';
  const stream = safeStr(raw['sector']);
  const category =
    safeStr(raw['sector']) ?? safeStr(raw['management_type']) ?? '';

  const name = programmeName.trim();
  const id = `${institutionId}_${slugify(name)}`;

  const keywords = [name, stream, category, city].filter(
    (v): v is string => v != null && v.length > 0,
  );

  return {
    id,
    institutionId,
    name,
    institutionName: collegeName,
    degree: name,
    stream,
    specialization: null,
    location: city,
    city,
    state: state.length > 0 ? state : 'Chhattisgarh',
    duration,
    fees: fees ?? (avgPkg != null ? null : null),
    studyMode: null,
    eligibility: null,
    admissionProcess: null,
    applicationDeadline: null,
    accreditation: null,
    officialUrl: normaliseUrl(safeStr(raw['official_website'])),
    category,
    keywords,
  };
}

/** Build a single CourseRecord from a Dataset 2 college + one category string */
function buildFromDataset2(
  raw: Record<string, unknown>,
  categoryName: string,
): CourseRecord {
  const collegeName = safeStr(raw['college_name']) ?? '';
  const institutionId = safeStr(raw['college_id']) ?? slugify(collegeName);

  const city = safeStr(raw['district_or_location']) ?? '';
  const managementType = safeStr(raw['management_type']) ?? '';
  const collegeType = safeStr(raw['college_type']) ?? '';
  const affiliation = safeStr(raw['university_affiliation']);

  const name = categoryName.trim();
  const id = `${institutionId}_${slugify(name)}`;

  const keywords = [name, collegeType, managementType, city].filter(
    (v): v is string => v.length > 0,
  );

  return {
    id,
    institutionId,
    name,
    institutionName: collegeName,
    degree: name,
    stream: null,
    specialization: affiliation,
    location: city,
    city,
    state: 'Chhattisgarh',
    duration: null,
    fees: null,
    studyMode: null,
    eligibility: null,
    admissionProcess: null,
    applicationDeadline: null,
    accreditation: null,
    officialUrl: null,
    category: collegeType.length > 0 ? collegeType : managementType,
    keywords,
  };
}

/** Build a single CourseRecord from a Dataset 3 college + one courses_for_comparison item */
function buildFromDataset3(
  raw: Record<string, unknown>,
  courseItem: Record<string, unknown>,
): CourseRecord {
  const collegeName = safeStr(raw['college_name']) ?? '';
  const institutionId = safeStr(raw['college_id']) ?? slugify(collegeName);

  const city = safeStr(raw['location_in_chhattisgarh']) ?? '';
  const managementType = safeStr(raw['management_type']) ?? '';
  const institutionCategory = safeStr(raw['institution_category']);

  const courseName = safeStr(courseItem['course_name']) ?? '';
  const duration = safeStr(courseItem['typical_duration']);
  const careerOpportunities = safeArr(courseItem['career_opportunities']);

  const id = `${institutionId}_${slugify(courseName)}`;

  const stream = institutionCategory;
  const category =
    managementType.length > 0 ? managementType : (institutionCategory ?? '');

  const keywords = [courseName, stream, category, city].filter(
    (v): v is string => v != null && v.length > 0,
  );

  return {
    id,
    institutionId,
    name: courseName,
    institutionName: collegeName,
    degree: courseName,
    stream,
    specialization: null,
    location: city,
    city,
    state: 'Chhattisgarh',
    duration,
    fees: null,
    studyMode: null,
    eligibility: careerOpportunities.join(', ') || null,
    admissionProcess: null,
    applicationDeadline: null,
    accreditation: null,
    officialUrl: normaliseUrl(safeStr(raw['official_reference'])),
    category,
    keywords,
  };
}

// ---------------------------------------------------------------------------
// Public: normaliseCourseRecord
// ---------------------------------------------------------------------------

/**
 * Maps any of the three source JSON record shapes to a `CourseRecord`.
 *
 * Rules:
 * - All string fields: `value?.toString().trim() ?? null`
 * - All number fields: `typeof value === 'number' ? value : null`
 * - All array fields: `Array.isArray(value) ? value : []`
 * - `id` is derived as `${institutionId}_${slugify(name)}`
 * - `state` defaults to `'Chhattisgarh'` when null/missing
 * - No field is ever `undefined`
 *
 * When the record matches none of the three shapes the function still returns a
 * valid (mostly-null) `CourseRecord` rather than throwing.
 */
export function normaliseCourseRecord(raw: unknown): CourseRecord {
  if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
    // Fallback: produce a fully-sentinel record
    return {
      id: 'unknown',
      institutionId: 'unknown',
      name: '',
      institutionName: '',
      degree: '',
      stream: null,
      specialization: null,
      location: '',
      city: '',
      state: 'Chhattisgarh',
      duration: null,
      fees: null,
      studyMode: null,
      eligibility: null,
      admissionProcess: null,
      applicationDeadline: null,
      accreditation: null,
      officialUrl: null,
      category: '',
      keywords: [],
    };
  }

  const r = raw as Record<string, unknown>;

  if (isDataset1(r)) {
    // Use first programme name from summary as a representative record
    const courses = r['courses'] as Record<string, unknown>;
    const summary = safeStr(courses['programme_summary']) ?? '';
    const firstName = summary.split(';')[0]?.trim() ?? 'Programme';
    return buildFromDataset1(r, firstName);
  }

  if (isDataset2(r)) {
    const cats = r['course_categories'] as unknown[];
    const firstName = safeStr(cats[0]) ?? 'Course';
    return buildFromDataset2(r, firstName);
  }

  if (isDataset3(r)) {
    const comparison = r['courses_for_comparison'] as unknown[];
    const firstItem =
      comparison[0] != null && typeof comparison[0] === 'object'
        ? (comparison[0] as Record<string, unknown>)
        : {};
    return buildFromDataset3(r, firstItem);
  }

  // Unknown shape — map what we can
  const collegeName = safeStr(r['college_name']) ?? safeStr(r['name']) ?? '';
  const institutionId =
    safeStr(r['college_id']) ??
    safeStr(r['id']) ??
    slugify(collegeName) ??
    'unknown';
  const name = safeStr(r['course_name']) ?? safeStr(r['name']) ?? '';
  const id = `${institutionId}_${slugify(name)}`;
  const city =
    safeStr(r['city_or_district']) ??
    safeStr(r['district_or_location']) ??
    safeStr(r['location_in_chhattisgarh']) ??
    '';
  const category =
    safeStr(r['sector']) ??
    safeStr(r['college_type']) ??
    safeStr(r['management_type']) ??
    '';

  return {
    id,
    institutionId,
    name,
    institutionName: collegeName,
    degree: name,
    stream: safeStr(r['sector']) ?? safeStr(r['institution_category']),
    specialization: null,
    location: city,
    city,
    state: safeStr(r['state']) ?? 'Chhattisgarh',
    duration: null,
    fees: null,
    studyMode: null,
    eligibility: null,
    admissionProcess: null,
    applicationDeadline: null,
    accreditation: null,
    officialUrl: normaliseUrl(
      safeStr(r['official_website']) ?? safeStr(r['official_reference']),
    ),
    category,
    keywords: [name, category, city].filter((v) => v.length > 0),
  };
}

// ---------------------------------------------------------------------------
// Public: normaliseCourses
// ---------------------------------------------------------------------------

/**
 * Normalises an array of raw records from a single source dataset.
 *
 * - Dataset 1: splits `programme_summary` on `';'` to produce one
 *   `CourseRecord` per programme per college.
 * - Dataset 2: produces one `CourseRecord` per `course_categories` entry.
 * - Dataset 3: produces one `CourseRecord` per `courses_for_comparison` entry.
 *
 * After producing all records, deduplicates by `id` (keeping first occurrence).
 */
export function normaliseCourses(rawRecords: unknown[]): CourseRecord[] {
  const results: CourseRecord[] = [];

  for (const raw of rawRecords) {
    if (raw == null || typeof raw !== 'object' || Array.isArray(raw)) {
      results.push(normaliseCourseRecord(raw));
      continue;
    }

    const r = raw as Record<string, unknown>;

    if (isDataset1(r)) {
      const courses = r['courses'] as Record<string, unknown>;
      const summary = safeStr(courses['programme_summary']) ?? '';
      const programmes = summary
        .split(';')
        .map((p) => p.trim())
        .filter((p) => p.length > 0);

      if (programmes.length === 0) {
        results.push(buildFromDataset1(r, 'Programme'));
      } else {
        for (const prog of programmes) {
          results.push(buildFromDataset1(r, prog));
        }
      }
      continue;
    }

    if (isDataset2(r)) {
      const cats = r['course_categories'] as unknown[];
      const validCats = cats
        .map((c) => safeStr(c))
        .filter((c): c is string => c !== null);

      if (validCats.length === 0) {
        results.push(buildFromDataset2(r, 'Course'));
      } else {
        for (const cat of validCats) {
          results.push(buildFromDataset2(r, cat));
        }
      }
      continue;
    }

    if (isDataset3(r)) {
      const comparison = r['courses_for_comparison'] as unknown[];
      const validItems = comparison.filter(
        (item): item is Record<string, unknown> =>
          item != null && typeof item === 'object' && !Array.isArray(item),
      );

      if (validItems.length === 0) {
        results.push(buildFromDataset3(r, {}));
      } else {
        for (const item of validItems) {
          results.push(buildFromDataset3(r, item));
        }
      }
      continue;
    }

    // Unknown shape — fall back to single-record normalisation
    results.push(normaliseCourseRecord(r));
  }

  return deduplicateById(results);
}
