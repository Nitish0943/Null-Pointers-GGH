import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type {
  CollegeComparisonDataset,
  CollegeRecord,
} from '../packages/types/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = resolve(__dirname, '..');

export interface ValidationReport {
  totalInFile: number;
  importedCount: number;
  duplicateCount: number;
  failedCount: number;
  failures: Array<{ id: string; reason: string }>;
  qualitySummary: {
    exactCourseVerifiedCount: number;
    placementDisclosedCount: number;
    nirfRankedCount: number;
    feedbackCount: number;
    feeDisclosedCount: number;
  };
}

export function validateAndImportDataset(datasetPath?: string): {
  dataset: CollegeComparisonDataset;
  validatedColleges: CollegeRecord[];
  report: ValidationReport;
} {
  const filePath =
    datasetPath ||
    resolve(ROOT_DIR, 'data/chhattisgarh_college_comparison_dataset.json');
  const rawData = readFileSync(filePath, 'utf-8');
  const parsed = JSON.parse(rawData) as CollegeComparisonDataset;

  const seenIds = new Set<string>();
  const validatedColleges: CollegeRecord[] = [];
  const failures: Array<{ id: string; reason: string }> = [];
  let duplicateCount = 0;

  const qualitySummary = {
    exactCourseVerifiedCount: 0,
    placementDisclosedCount: 0,
    nirfRankedCount: 0,
    feedbackCount: 0,
    feeDisclosedCount: 0,
  };

  for (const item of parsed.colleges) {
    if (!item.id || typeof item.id !== 'string') {
      failures.push({
        id: item.id || 'unknown',
        reason: 'Missing or non-string id',
      });
      continue;
    }

    if (seenIds.has(item.id)) {
      duplicateCount++;
      continue;
    }

    if (!item.college_name || typeof item.college_name !== 'string') {
      failures.push({ id: item.id, reason: 'Missing college_name' });
      continue;
    }

    if (!item.city_or_district || typeof item.city_or_district !== 'string') {
      failures.push({ id: item.id, reason: 'Missing city_or_district' });
      continue;
    }

    if (!item.courses || typeof item.courses.programme_summary !== 'string') {
      failures.push({
        id: item.id,
        reason: 'Missing courses.programme_summary',
      });
      continue;
    }

    // Preserve exact nulls (never coerce null to 0 or empty string)
    const college: CollegeRecord = {
      id: item.id.trim(),
      college_name: item.college_name.trim(),
      city_or_district: item.city_or_district.trim(),
      state: item.state?.trim() || 'Chhattisgarh',
      sector: item.sector?.trim() || 'General',
      management_type: item.management_type?.trim() || 'Government',
      official_website: item.official_website?.trim() || '',
      courses: {
        programme_summary: item.courses.programme_summary,
        exact_course_names_verified: Boolean(
          item.courses.exact_course_names_verified,
        ),
        course_count: item.courses.course_count ?? null,
        course_duration: item.courses.course_duration ?? null,
        course_fees_inr: item.courses.course_fees_inr ?? null,
        fee_academic_year: item.courses.fee_academic_year ?? null,
      },
      placements: {
        placement_stack: item.placements?.placement_stack ?? null,
        average_package_lpa: item.placements?.average_package_lpa ?? null,
        median_package_lpa: item.placements?.median_package_lpa ?? null,
        highest_package_lpa: item.placements?.highest_package_lpa ?? null,
        students_eligible: item.placements?.students_eligible ?? null,
        students_placed: item.placements?.students_placed ?? null,
        students_receiving_highest_package:
          item.placements?.students_receiving_highest_package ?? null,
        placement_year: item.placements?.placement_year ?? null,
        placement_source_url: item.placements?.placement_source_url ?? null,
      },
      campus: {
        area_acres: item.campus?.area_acres ?? null,
        area_definition: item.campus?.area_definition ?? null,
      },
      student_feedback: {
        rating: item.student_feedback?.rating ?? null,
        rating_scale: item.student_feedback?.rating_scale ?? null,
        review_count: item.student_feedback?.review_count ?? null,
        platform: item.student_feedback?.platform ?? null,
        review_date: item.student_feedback?.review_date ?? null,
      },
      ranking_and_tier: {
        tier: item.ranking_and_tier?.tier ?? null,
        tier_is_official: Boolean(item.ranking_and_tier?.tier_is_official),
        nirf_rank: item.ranking_and_tier?.nirf_rank ?? null,
        nirf_category: item.ranking_and_tier?.nirf_category ?? null,
        nirf_year: item.ranking_and_tier?.nirf_year ?? null,
      },
      data_status: item.data_status || 'partial_directory_record',
      record_notes: item.record_notes || '',
    };

    if (college.courses.exact_course_names_verified)
      qualitySummary.exactCourseVerifiedCount++;
    if (college.courses.course_fees_inr !== null)
      qualitySummary.feeDisclosedCount++;
    if (
      college.placements.average_package_lpa !== null ||
      college.placements.students_placed !== null
    ) {
      qualitySummary.placementDisclosedCount++;
    }
    if (college.ranking_and_tier.nirf_rank !== null)
      qualitySummary.nirfRankedCount++;
    if (college.student_feedback.rating !== null)
      qualitySummary.feedbackCount++;

    seenIds.add(college.id);
    validatedColleges.push(college);
  }

  const report: ValidationReport = {
    totalInFile: parsed.colleges.length,
    importedCount: validatedColleges.length,
    duplicateCount,
    failedCount: failures.length,
    failures,
    qualitySummary,
  };

  return {
    dataset: parsed,
    validatedColleges,
    report,
  };
}

if (import.meta.url.endsWith(process.argv[1]?.replace(/\\/g, '/') || '')) {
  const result = validateAndImportDataset();
  console.log('--- Dataset Import & Validation Report ---');
  console.log(`Total records in source: ${result.report.totalInFile}`);
  console.log(
    `Successfully validated and imported: ${result.report.importedCount}`,
  );
  console.log(`Duplicate records skipped: ${result.report.duplicateCount}`);
  console.log(`Failed records: ${result.report.failedCount}`);
  console.log('Quality summary:', result.report.qualitySummary);
  if (result.report.failures.length > 0) {
    console.error('Failed items:', result.report.failures);
  }
}
