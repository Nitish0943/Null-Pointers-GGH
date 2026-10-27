import { SCHOLARSHIPS } from '../../features/courses/data/scholarship-catalog';
import type { ScholarshipRecord } from '../types/scholarship';

// Module-level in-memory cache keyed by `${degree}|${stream ?? ''}|${category}`
const cache = new Map<string, ScholarshipRecord[]>();

/**
 * Returns ScholarshipRecords whose `eligibility` field contains at least one
 * term (case-insensitive) from {degree, stream (if non-null), category}.
 * Results are cached per unique (degree, stream, category) combination for
 * the duration of the current app process.
 * Returns [] on zero matches without throwing.
 */
export function getRelevantScholarships(
  degree: string,
  stream: string | null,
  category: string,
): ScholarshipRecord[] {
  const cacheKey = `${degree}|${stream ?? ''}|${category}`;

  if (cache.has(cacheKey)) {
    return cache.get(cacheKey)!;
  }

  // Build list of non-empty terms to match against
  const terms: string[] = [];
  if (degree) terms.push(degree);
  if (stream) terms.push(stream);
  if (category) terms.push(category);

  const results = SCHOLARSHIPS.filter((scholarship) => {
    const eligibilityLower = scholarship.eligibility.toLowerCase();
    return terms.some((term) => eligibilityLower.includes(term.toLowerCase()));
  });

  cache.set(cacheKey, results);
  return results;
}

/** Returns all scholarships. Pure function. */
export function getScholarships(): ScholarshipRecord[] {
  return SCHOLARSHIPS;
}

/**
 * Deduplicates an array of ScholarshipRecords by id.
 * Keeps first occurrence. Pure function.
 */
export function deduplicateScholarships(
  records: ScholarshipRecord[],
): ScholarshipRecord[] {
  const seen = new Set<string>();
  return records.filter((record) => {
    if (seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}
