/**
 * scholarship-catalog.ts
 *
 * Imports the scholarship dataset from the monorepo root data/ directory,
 * normalises each entry to a `ScholarshipRecord`, and exports a module-level
 * singleton array used throughout the app.
 */

import type { ScholarshipRecord } from '../../../shared/types/scholarship';
import { normaliseUrl, slugify } from './normalise-courses';
import scholarshipJson from '../../../../../../data/scholarship_dataset.json';

// ---------------------------------------------------------------------------
// Raw-shape types (mirrors the JSON structure exactly)
// ---------------------------------------------------------------------------

interface RawScholarship {
  name?: unknown;
  eligibility?: unknown;
  commonly_required_documents?: unknown;
  '2026_27_application_period'?: unknown;
  official_portal?: unknown;
}

// ---------------------------------------------------------------------------
// Safe field extractors (same pattern as normalise-courses.ts)
// ---------------------------------------------------------------------------

function safeStr(value: unknown): string | null {
  if (value == null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function safeArr(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => safeStr(v))
    .filter((v): v is string => v !== null);
}

// ---------------------------------------------------------------------------
// Normaliser
// ---------------------------------------------------------------------------

function normaliseScholarship(raw: RawScholarship): ScholarshipRecord {
  const name = safeStr(raw.name) ?? '';
  return {
    id: slugify(name) || 'unknown',
    name,
    eligibility: safeStr(raw.eligibility) ?? '',
    requiredDocuments: safeArr(raw.commonly_required_documents),
    applicationPeriod: safeStr(raw['2026_27_application_period']) ?? '',
    officialPortal: normaliseUrl(safeStr(raw.official_portal)),
  };
}

// ---------------------------------------------------------------------------
// SCHOLARSHIPS singleton
// ---------------------------------------------------------------------------

const rawScholarships: unknown[] = Array.isArray(
  (scholarshipJson as { scholarships?: unknown[] }).scholarships,
)
  ? (scholarshipJson as { scholarships: unknown[] }).scholarships
  : [];

export const SCHOLARSHIPS: ScholarshipRecord[] = rawScholarships
  .filter(
    (item): item is RawScholarship =>
      item != null && typeof item === 'object' && !Array.isArray(item),
  )
  .map(normaliseScholarship);
