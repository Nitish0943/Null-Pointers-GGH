import type { InstitutionRecord } from '../../../shared/types/institution';
import { normaliseUrl, slugify } from '../../courses/data/normalise-courses';

// Re-export helpers for consumers that import from this module.
export { normaliseUrl, slugify };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function str(v: unknown): string | null {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length > 0 ? s : null;
}

function num(v: unknown): number | null {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

// ---------------------------------------------------------------------------
// Deduplication (mirrors deduplicateById from normalise-courses)
// ---------------------------------------------------------------------------

function deduplicateById<T extends { id: string }>(records: T[]): T[] {
  const seen = new Set<string>();
  return records.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Maps a single raw record (from either source dataset) to an
 * `InstitutionRecord`.
 *
 * Field mapping:
 * - id                : record.id ?? record.college_id ?? slugify(college_name)
 * - name              : college_name (trim)
 * - city              : city_or_district ?? district_or_location ?? ''
 * - state             : state ?? 'Chhattisgarh'
 * - type              : sector ?? college_type ?? management_type ?? ''
 * - management        : management_type ?? ''
 * - affiliation       : university_affiliation ?? null
 * - officialUrl       : normaliseUrl(official_website) — https:// only, else null
 * - courseIds         : [] (populated later by course-catalog.ts)
 * - nirfRank          : ranking_and_tier?.nirf_rank ?? null
 * - rating            : student_feedback?.rating ?? null
 * - programmeSummary  : courses?.programme_summary ?? course_categories?.join(', ') ?? ''
 *
 * All string fields: coerced with toString().trim(); null when absent/empty.
 * No field is ever undefined.
 */
export function normaliseInstitutionRecord(raw: unknown): InstitutionRecord {
  const r = (raw != null && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >;

  const get = (key: string): unknown => r[key];

  // ── id ──────────────────────────────────────────────────────────────────
  const collegeName = str(get('college_name')) ?? str(get('name')) ?? '';
  const rawId = get('id') ?? get('college_id');
  const id = str(rawId) ?? (collegeName ? slugify(collegeName) : 'unknown');

  // ── basic metadata ───────────────────────────────────────────────────────
  const name = collegeName;

  const city =
    str(get('city_or_district')) ??
    str(get('district_or_location')) ??
    str(get('city')) ??
    '';

  const state = str(get('state')) ?? 'Chhattisgarh';

  const type =
    str(get('sector')) ??
    str(get('college_type')) ??
    str(get('management_type')) ??
    '';

  const management = str(get('management_type')) ?? '';

  // ── affiliation ──────────────────────────────────────────────────────────
  const affiliation = str(get('university_affiliation')) ?? null;

  // ── URL ──────────────────────────────────────────────────────────────────
  const officialUrl = normaliseUrl(
    str(get('official_website')) ??
      str(get('official_url')) ??
      str(get('officialUrl')),
  );

  // ── course IDs (populated externally) ───────────────────────────────────
  const courseIds: string[] = [];

  // ── NIRF rank ────────────────────────────────────────────────────────────
  const rankingAndTier = get('ranking_and_tier');
  let nirfRank: number | null = null;
  if (rankingAndTier != null && typeof rankingAndTier === 'object') {
    nirfRank = num((rankingAndTier as Record<string, unknown>)['nirf_rank']);
  } else {
    nirfRank = num(get('nirf_rank'));
  }

  // ── rating ───────────────────────────────────────────────────────────────
  const studentFeedback = get('student_feedback');
  let rating: number | null = null;
  if (studentFeedback != null && typeof studentFeedback === 'object') {
    rating = num((studentFeedback as Record<string, unknown>)['rating']);
  } else {
    rating = num(get('rating'));
  }

  // ── programme summary ────────────────────────────────────────────────────
  let programmeSummary = '';
  const coursesField = get('courses');
  if (coursesField != null && typeof coursesField === 'object') {
    const summary = str(
      (coursesField as Record<string, unknown>)['programme_summary'],
    );
    if (summary) programmeSummary = summary;
  }
  if (!programmeSummary) {
    programmeSummary = str(get('programme_summary')) ?? '';
  }
  if (!programmeSummary) {
    const courseCategories = get('course_categories');
    if (Array.isArray(courseCategories)) {
      programmeSummary = courseCategories
        .map((c: unknown) => str(c))
        .filter((c): c is string => c !== null)
        .join(', ');
    }
  }

  return {
    id,
    name,
    city,
    state,
    type,
    management,
    affiliation,
    officialUrl,
    courseIds,
    nirfRank,
    rating,
    programmeSummary,
  };
}

/**
 * Normalises and deduplicates an array of raw institution records.
 * Deduplication keeps the first occurrence per id.
 * Pure function.
 */
export function normaliseInstitutions(
  rawRecords: unknown[],
): InstitutionRecord[] {
  const normalised = rawRecords.map(normaliseInstitutionRecord);
  return deduplicateById(normalised);
}
