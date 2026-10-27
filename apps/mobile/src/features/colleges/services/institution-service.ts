import type { InstitutionRecord } from '../../../shared/types/institution';
import type { CourseRecord } from '../../../shared/types/course';
import { INSTITUTIONS, COURSES } from '../../courses/data/course-catalog';

// ---------------------------------------------------------------------------
// Filter type
// ---------------------------------------------------------------------------

export type InstitutionFilter = {
  /** Case-insensitive substring match against name, city, type, management, affiliation */
  query?: string;
  /** Exact case-insensitive match */
  city?: string;
  /** Exact case-insensitive match */
  management?: string;
  /** Exact case-insensitive match */
  type?: string;
  /** Case-insensitive substring match */
  affiliation?: string;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function lower(v: string | null | undefined): string {
  return (v ?? '').toLowerCase();
}

function matchesFilter(
  institution: InstitutionRecord,
  filter: InstitutionFilter,
): boolean {
  // query: substring match against name, city, type, management, affiliation
  if (filter.query !== undefined && filter.query.length > 0) {
    const q = lower(filter.query);
    const searchable = [
      institution.name,
      institution.city,
      institution.type,
      institution.management,
      institution.affiliation,
    ]
      .map(lower)
      .join(' ');
    if (!searchable.includes(q)) return false;
  }

  // city: exact case-insensitive match
  if (filter.city !== undefined && filter.city.length > 0) {
    if (lower(institution.city) !== lower(filter.city)) return false;
  }

  // management: exact case-insensitive match
  if (filter.management !== undefined && filter.management.length > 0) {
    if (lower(institution.management) !== lower(filter.management)) return false;
  }

  // type: exact case-insensitive match
  if (filter.type !== undefined && filter.type.length > 0) {
    if (lower(institution.type) !== lower(filter.type)) return false;
  }

  // affiliation: case-insensitive substring match
  if (filter.affiliation !== undefined && filter.affiliation.length > 0) {
    if (!lower(institution.affiliation).includes(lower(filter.affiliation)))
      return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns a paginated, filtered slice of `INSTITUTIONS`.
 *
 * @param filter   — optional filter; undefined fields are ignored
 * @param page     — 0-based page index (defaults to 0)
 * @param pageSize — records per page (defaults to 20)
 * @returns `{ results, total }` where `total` is the count before pagination
 */
export function getInstitutions(
  filter?: InstitutionFilter,
  page = 0,
  pageSize = 20,
): { results: InstitutionRecord[]; total: number } {
  const filtered =
    filter !== undefined
      ? INSTITUTIONS.filter((inst) => matchesFilter(inst, filter))
      : INSTITUTIONS;

  const total = filtered.length;
  const start = page * pageSize;
  const results = filtered.slice(start, start + pageSize);

  return { results, total };
}

/**
 * Looks up a single institution by its `id`.
 * Returns `undefined` when not found.
 */
export function getInstitutionById(id: string): InstitutionRecord | undefined {
  return INSTITUTIONS.find((inst) => inst.id === id);
}

/**
 * Returns all `CourseRecord`s whose `institutionId` matches the given id.
 * No pagination — the caller (institution detail screen) handles display logic.
 */
export function getCoursesByInstitution(institutionId: string): CourseRecord[] {
  return COURSES.filter((course) => course.institutionId === institutionId);
}
