import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  searchColleges,
  evaluateSearchMatch,
  analyzeComparison,
  computeDataCompleteness,
  calculatePlacementRate,
  matchesDegree,
  matchesBranch,
  matchesCity,
  matchesManagement,
} from '../../../packages/shared/src/index.ts';
import { validateAndImportDataset } from '../../../scripts/import-college-comparison-dataset.ts';
import type {
  CollegeRecord,
  CourseSearchQuery,
} from '../../../packages/types/src/index.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Robust dataset location regardless of working directory
const candidatePath1 = resolve(
  __dirname,
  '../../../data/chhattisgarh_college_comparison_dataset.json',
);
const candidatePath2 = resolve(
  process.cwd(),
  'data/chhattisgarh_college_comparison_dataset.json',
);
const datasetPath = existsSync(candidatePath1)
  ? candidatePath1
  : candidatePath2;

const rawData = JSON.parse(readFileSync(datasetPath, 'utf-8'));
const allColleges: CollegeRecord[] = rawData.colleges;

describe('Phase 1 & 5: Dataset Import, Integrity, and Schema Validation', () => {
  it('should contain exactly 70 institution records in the primary dataset', () => {
    assert.strictEqual(
      allColleges.length,
      70,
      'The dataset must describe exactly 70 institutions',
    );
  });

  it('should successfully run validateAndImportDataset with 0 failures and 0 duplicates', () => {
    const { validatedColleges, report } = validateAndImportDataset(datasetPath);
    assert.strictEqual(report.totalInFile, 70);
    assert.strictEqual(report.importedCount, 70);
    assert.strictEqual(report.duplicateCount, 0);
    assert.strictEqual(report.failedCount, 0);
    assert.strictEqual(validatedColleges.length, 70);
  });

  it('should have unique sequential IDs from CG001 to CG070', () => {
    const ids = allColleges.map((c) => c.id);
    const uniqueIds = new Set(ids);
    assert.strictEqual(uniqueIds.size, 70, 'All 70 IDs must be distinct');
    assert.ok(ids.includes('CG001'), 'Must contain CG001');
    assert.ok(ids.includes('CG070'), 'Must contain CG070');
  });

  it('should preserve null values as null and never convert to zero or empty strings', () => {
    const cg001 = allColleges.find((c) => c.id === 'CG001');
    assert.ok(cg001, 'CG001 must exist');
    assert.strictEqual(
      cg001.courses.course_fees_inr,
      null,
      'Fees must remain null when unverified',
    );
    assert.notStrictEqual(
      cg001.courses.course_fees_inr,
      0,
      'Null must not be coerced to 0',
    );
    assert.strictEqual(cg001.placements.average_package_lpa, null);
    assert.notStrictEqual(cg001.placements.average_package_lpa, 0);
    assert.strictEqual(cg001.ranking_and_tier.nirf_rank, null);
    assert.strictEqual(cg001.campus.area_acres, null);
  });

  it('should preserve official source references and website links', () => {
    assert.ok(
      rawData.sources.length >= 4,
      'Dataset should reference major directories (NIRF, CSVTU, NMC, AISHE)',
    );
    const withWebsites = allColleges.filter(
      (c) => c.official_website && c.official_website.startsWith('http'),
    );
    assert.ok(
      withWebsites.length >= 30,
      'Should have official websites preserved for institutions',
    );
  });
});

describe('Phase 2: Course Discovery and Search Functionality', () => {
  it('should search institutions by exact name and partial name', () => {
    const resultIIT = searchColleges(allColleges, { query: 'IIT Bhilai' });
    assert.ok(resultIIT.total >= 1);
    assert.strictEqual(resultIIT.results[0].college.id, 'CG001');

    const resultNIT = searchColleges(allColleges, { query: 'NIT Raipur' });
    assert.ok(resultNIT.total >= 1);
    assert.strictEqual(resultNIT.results[0].college.id, 'CG002');
  });

  it('should search by city and district (including slash combinations like Bhilai / Durg)', () => {
    const resultRaipur = searchColleges(allColleges, { city: 'Raipur' });
    assert.ok(resultRaipur.total > 0, 'Should find institutions in Raipur');
    resultRaipur.results.forEach((item) => {
      assert.ok(item.college.city_or_district.toLowerCase().includes('raipur'));
    });

    const resultBhilai = searchColleges(allColleges, { query: 'Bhilai' });
    assert.ok(
      resultBhilai.total > 0,
      'Should find institutions in Bhilai or Bhilai / Durg',
    );
    const matchedBhilaiOrDurg = resultBhilai.results.every((item) => {
      const loc = item.college.city_or_district.toLowerCase();
      const name = item.college.college_name.toLowerCase();
      return (
        loc.includes('bhilai') ||
        loc.includes('durg') ||
        name.includes('bhilai')
      );
    });
    assert.ok(matchedBhilaiOrDurg);
  });

  it('should match degree synonyms (e.g. btech, b.tech, bachelor of technology, mbbs, mba)', () => {
    assert.ok(matchesDegree('B.Tech; M.Tech; Ph.D.', 'Engineering', 'b.tech'));
    assert.ok(matchesDegree('B.Tech; M.Tech; Ph.D.', 'Engineering', 'btech'));
    assert.ok(
      matchesDegree('B.Tech; M.Tech; Ph.D.', 'Engineering', 'engineering'),
    );
    assert.ok(matchesDegree('MBBS; MD', 'Medical', 'mbbs'));
    assert.ok(matchesDegree('MBBS; MD', 'Medical', 'medicine'));
    assert.ok(matchesDegree('MBA; BBA', 'Management', 'mba'));
    assert.ok(matchesDegree('MBA; BBA', 'Management', 'management'));
  });

  it('should match branch synonyms (computer science -> cse, cs, software)', () => {
    assert.ok(
      matchesBranch(
        'B.Tech in Computer Science',
        'Engineering',
        'computer science',
      ),
    );
    assert.ok(matchesBranch('B.Tech CSE', 'Engineering', 'computer science'));
    assert.ok(
      matchesBranch(
        'B.Tech in Artificial Intelligence',
        'Engineering',
        'artificial intelligence',
      ),
    );
    assert.ok(matchesBranch('B.Tech AI & Data Science', 'Engineering', 'ai'));
  });

  it('should distinguish exact verified course matches from programme summaries', () => {
    const unverifiedCollege: CollegeRecord = {
      ...allColleges[0],
      courses: {
        ...allColleges[0].courses,
        programme_summary: 'B.Tech; M.Tech',
        exact_course_names_verified: false,
      },
    };

    const evalUnverified = evaluateSearchMatch(
      unverifiedCollege,
      'Computer Science',
      'B.Tech',
      'computer science',
    );
    assert.ok(evalUnverified.isMatch);
    assert.strictEqual(
      evalUnverified.matchType,
      'programme_summary',
      'Must identify as programme_summary, not exact verified',
    );
    assert.ok(
      evalUnverified.explanation.includes(
        'verification with official disclosures',
      ),
    );

    const verifiedCollege: CollegeRecord = {
      ...allColleges[0],
      courses: {
        ...allColleges[0].courses,
        programme_summary: 'B.Tech in Computer Science',
        exact_course_names_verified: true,
      },
    };

    const evalVerified = evaluateSearchMatch(
      verifiedCollege,
      'Computer Science',
      'B.Tech',
      'computer science',
    );
    assert.ok(evalVerified.isMatch);
    assert.strictEqual(evalVerified.matchType, 'exact_verified');
  });

  it('should correctly combine multiple filters (degree + management + city)', () => {
    const query: CourseSearchQuery = {
      degreeType: 'B.Tech',
      managementType: 'government',
      city: 'Raipur',
    };

    const results = searchColleges(allColleges, query);
    assert.ok(results.total > 0);
    results.results.forEach((item) => {
      assert.ok(item.college.city_or_district.toLowerCase().includes('raipur'));
      assert.ok(
        item.college.management_type.toLowerCase().includes('government') ||
          item.college.management_type.toLowerCase().includes('central') ||
          item.college.management_type.toLowerCase().includes('public'),
      );
    });
  });

  it('should filter by fee range when reliable fees are available and skip null fees', () => {
    // Dataset colleges currently have null fees, so maxFee filter should exclude unverified fees
    const results = searchColleges(allColleges, { maxFee: 50000 });
    assert.strictEqual(
      results.total,
      0,
      'Should not return colleges without verified fees below budget',
    );
  });

  it('should support pagination and sorting', () => {
    const page1 = searchColleges(allColleges, {
      page: 1,
      limit: 10,
      sortBy: 'name_asc',
    });
    assert.strictEqual(page1.page, 1);
    assert.strictEqual(page1.limit, 10);
    assert.strictEqual(page1.results.length, 10);
    assert.strictEqual(page1.totalPages, 7);

    const page2 = searchColleges(allColleges, {
      page: 2,
      limit: 10,
      sortBy: 'name_asc',
    });
    assert.strictEqual(page2.page, 2);
    assert.strictEqual(page2.results.length, 10);
    assert.notStrictEqual(
      page1.results[0].college.id,
      page2.results[0].college.id,
    );
  });
});

describe('Phase 3: Institution Profiles & Data Completeness', () => {
  it('should compute data completeness accurately', () => {
    const cg001 = allColleges.find((c) => c.id === 'CG001')!;
    const completeness = computeDataCompleteness(cg001);
    assert.ok(typeof completeness.score === 'number');
    assert.ok(typeof completeness.percentage === 'number');
    assert.strictEqual(completeness.details.length, 10);
    assert.ok(completeness.percentage >= 0 && completeness.percentage <= 100);
  });

  it('should calculate placement rate strictly from verified non-zero eligible counts', () => {
    assert.strictEqual(calculatePlacementRate(null, null), null);
    assert.strictEqual(calculatePlacementRate(50, null), null);
    assert.strictEqual(calculatePlacementRate(null, 100), null);
    assert.strictEqual(calculatePlacementRate(0, 0), null);
    assert.strictEqual(calculatePlacementRate(50, 0), null);

    const validRate = calculatePlacementRate(80, 100);
    assert.ok(validRate !== null);
    assert.strictEqual(validRate.rate, 80);
    assert.strictEqual(validRate.formatted, '80%');
  });
});

describe('Phase 4: Institution Comparison and Fairness Analysis', () => {
  it('should generate comparison analysis for 2 to 4 institutions', () => {
    const institutions = allColleges.slice(0, 3);
    const analysis = analyzeComparison(institutions);

    assert.strictEqual(analysis.institutions.length, 3);
    assert.ok(
      analysis.fairnessNotes.length >= 2,
      'Should generate fairness transparency notes',
    );
    assert.ok(
      analysis.insights.length >= 2,
      'Should generate derived insights',
    );
  });

  it('should issue fairness warnings when placement reporting years differ or are missing', () => {
    const sampleA: CollegeRecord = {
      ...allColleges[0],
      placements: {
        ...allColleges[0].placements,
        placement_year: '2023-24',
        average_package_lpa: 12,
      },
    };
    const sampleB: CollegeRecord = {
      ...allColleges[1],
      placements: {
        ...allColleges[1].placements,
        placement_year: '2021-22',
        average_package_lpa: 10,
      },
    };

    const analysis = analyzeComparison([sampleA, sampleB]);
    const placementNote = analysis.fairnessNotes.find(
      (n) => n.metric === 'Placement Reporting Years',
    );
    assert.ok(placementNote, 'Must have placement reporting year note');
    assert.strictEqual(placementNote.fair, false);
    assert.ok(
      placementNote.explanation.includes('cannot be compared directly'),
    );
  });

  it('should warn against highest package fallacy (outlier vs typical salary)', () => {
    const sampleA: CollegeRecord = {
      ...allColleges[0],
      placements: { ...allColleges[0].placements, highest_package_lpa: 45 },
    };
    const sampleB: CollegeRecord = { ...allColleges[1] };

    const analysis = analyzeComparison([sampleA, sampleB]);
    const highestNote = analysis.fairnessNotes.find((n) =>
      n.metric.toLowerCase().includes('highest package'),
    );
    assert.ok(highestNote);
    assert.strictEqual(highestNote.fair, false);
    assert.ok(
      highestNote.explanation.includes(
        'not be treated as a typical or median salary',
      ),
    );
  });

  it('should not declare an artificial overall winner when data is incomplete', () => {
    const sampleA: CollegeRecord = { ...allColleges[0] };
    const sampleB: CollegeRecord = { ...allColleges[1] };

    const analysis = analyzeComparison([sampleA, sampleB]);
    const winnerNote = analysis.fairnessNotes.find(
      (n) => n.metric === 'Overall Evaluation',
    );
    assert.ok(winnerNote);
    assert.strictEqual(winnerNote.fair, false);
    assert.ok(
      winnerNote.explanation.includes('overall winner cannot be declared'),
    );
  });

  it('should detect lowest verified course fee when available without fabricating', () => {
    const sampleA: CollegeRecord = {
      ...allColleges[0],
      courses: {
        ...allColleges[0].courses,
        course_fees_inr: 85000,
        fee_academic_year: '2024-25',
      },
    };
    const sampleB: CollegeRecord = {
      ...allColleges[1],
      courses: {
        ...allColleges[1].courses,
        course_fees_inr: 45000,
        fee_academic_year: '2024-25',
      },
    };

    const analysis = analyzeComparison([sampleA, sampleB]);
    const feeInsight = analysis.insights.find(
      (i) => i.title === 'Lowest Verified Course Fee',
    );
    assert.ok(feeInsight);
    assert.ok(feeInsight.description.includes('45,000'));
    assert.ok(feeInsight.description.includes(sampleB.college_name));
  });
});
