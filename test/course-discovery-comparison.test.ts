import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve } from 'node:path';
import { validateAndImportDataset } from '../scripts/import-college-comparison-dataset.ts';
import {
  calculatePlacementRate,
  computeDataCompleteness,
  matchesBranch,
  matchesCity,
  matchesDegree,
  matchesManagement,
  searchColleges,
  analyzeComparison,
} from '../packages/shared/src/index.ts';
import type { CollegeRecord } from '../packages/types/src/index.ts';

// Load the 70 canonical institutions using the import function
const { validatedColleges, report } = validateAndImportDataset();

test('Dataset Import: Exactly 70 records imported without duplicate or failure', () => {
  assert.strictEqual(report.totalInFile, 70);
  assert.strictEqual(report.importedCount, 70);
  assert.strictEqual(report.duplicateCount, 0);
  assert.strictEqual(report.failedCount, 0);
  assert.strictEqual(validatedColleges.length, 70);

  const ids = new Set(validatedColleges.map((c) => c.id));
  assert.strictEqual(ids.size, 70);
  assert.ok(ids.has('CG001'));
  assert.ok(ids.has('CG070'));
});

test('Dataset Integrity: Null values preserved as null (never converted to 0)', () => {
  const iitBhilai = validatedColleges.find((c) => c.id === 'CG001')!;
  assert.ok(iitBhilai);
  assert.strictEqual(iitBhilai.courses.course_fees_inr, null);
  assert.strictEqual(iitBhilai.placements.average_package_lpa, null);
  assert.strictEqual(iitBhilai.placements.students_placed, null);
  assert.strictEqual(iitBhilai.ranking_and_tier.nirf_rank, null);
  assert.strictEqual(iitBhilai.campus.area_acres, null);
  assert.strictEqual(iitBhilai.student_feedback.rating, null);
});

test('Course Discovery: Searching by institution name works', () => {
  const results = searchColleges(validatedColleges, { query: 'IIT Bhilai' });
  assert.ok(results.total >= 1);
  assert.strictEqual(results.results[0].college.id, 'CG001');
  assert.strictEqual(results.results[0].college.college_name, 'IIT Bhilai');
});

test('Course Discovery: Searching by location works (Bhilai, Raipur, Bilaspur)', () => {
  const bhilaiColleges = searchColleges(validatedColleges, { city: 'Bhilai' });
  assert.ok(bhilaiColleges.total > 0);
  for (const item of bhilaiColleges.results) {
    assert.ok(
      item.college.city_or_district.toLowerCase().includes('bhilai') ||
        item.college.city_or_district.toLowerCase().includes('durg'),
    );
  }

  const raipurColleges = searchColleges(validatedColleges, { city: 'Raipur' });
  assert.ok(raipurColleges.total > 0);
  for (const item of raipurColleges.results) {
    assert.ok(item.college.city_or_district.toLowerCase().includes('raipur'));
  }
});

test('Course Discovery: Degree matching with synonyms (B.Tech, MBBS, MBA, Law)', () => {
  assert.ok(matchesDegree('B.Tech; M.Tech; Ph.D.', 'Engineering', 'b.tech'));
  assert.ok(matchesDegree('Bachelor of Technology', 'Engineering', 'b.tech'));
  assert.ok(matchesDegree('MBBS; MD', 'Medical', 'mbbs'));
  assert.ok(matchesDegree('MBA; BBA', 'Management', 'mba'));
  assert.ok(matchesDegree('LL.B; B.A. LL.B', 'Law', 'law'));
});

test('Course Discovery: Example search "B.Tech Computer Science colleges in Bhilai"', () => {
  const res = searchColleges(validatedColleges, {
    query: 'B.Tech Computer Science colleges in Bhilai',
  });
  assert.ok(res.total > 0);
  for (const item of res.results) {
    assert.ok(
      item.college.city_or_district.toLowerCase().includes('bhilai') ||
        item.college.city_or_district.toLowerCase().includes('durg'),
    );
    assert.ok(
      item.college.courses.programme_summary.includes('B.Tech') ||
        item.college.sector.toLowerCase().includes('engineering'),
    );
    // Since exact course offerings are not verified, it should correctly be flagged as programme_summary match
    assert.strictEqual(item.matchType, 'programme_summary');
    assert.ok(
      item.matchExplanation.includes(
        'requires verification with official disclosures',
      ),
    );
  }
});

test('Course Discovery: Example search "Artificial Intelligence courses in Chhattisgarh"', () => {
  const res = searchColleges(validatedColleges, {
    query: 'Artificial Intelligence courses in Chhattisgarh',
  });
  assert.ok(res.total > 0);
  // Returns engineering/computing colleges offering technical programmes, noting need for specialization verification
  for (const item of res.results) {
    assert.ok(
      item.college.sector.toLowerCase().includes('engineering') ||
        item.college.sector.toLowerCase().includes('it') ||
        item.college.courses.programme_summary.toLowerCase().includes('b.tech'),
    );
  }
});

test('Course Discovery: Example search "Government engineering colleges in Raipur"', () => {
  const res = searchColleges(validatedColleges, {
    query: 'Government engineering colleges in Raipur',
  });
  assert.ok(res.total > 0);
  for (const item of res.results) {
    assert.ok(item.college.city_or_district.toLowerCase().includes('raipur'));
    assert.ok(matchesManagement(item.college.management_type, 'government'));
  }
});

test('Course Discovery: Multiple filters work harmoniously together', () => {
  const res = searchColleges(validatedColleges, {
    city: 'Raipur',
    managementType: 'government',
    degreeType: 'B.Tech',
  });
  assert.ok(res.total > 0);
  for (const item of res.results) {
    assert.ok(item.college.city_or_district.toLowerCase().includes('raipur'));
    assert.ok(
      item.college.management_type.toLowerCase().includes('government') ||
        item.college.management_type.toLowerCase().includes('central'),
    );
    assert.ok(item.college.courses.programme_summary.includes('B.Tech'));
  }
});

test('Fairness Engine: Placement rate calculated ONLY when both eligible and placed counts exist', () => {
  const validRate = calculatePlacementRate(80, 100);
  assert.deepStrictEqual(validRate, { rate: 80, formatted: '80%' });

  assert.strictEqual(calculatePlacementRate(null, 100), null);
  assert.strictEqual(calculatePlacementRate(80, null), null);
  assert.strictEqual(calculatePlacementRate(null, null), null);
  assert.strictEqual(calculatePlacementRate(80, 0), null);
});

test('Fairness Engine: Comparison flags differing placement years and missing metrics', () => {
  const sample1: CollegeRecord = {
    ...validatedColleges[0],
    placements: {
      ...validatedColleges[0].placements,
      average_package_lpa: 12,
      placement_year: '2023',
    },
  };
  const sample2: CollegeRecord = {
    ...validatedColleges[1],
    placements: {
      ...validatedColleges[1].placements,
      average_package_lpa: 10,
      placement_year: '2024',
    },
  };

  const comparison = analyzeComparison([sample1, sample2]);
  const yearNote = comparison.fairnessNotes.find(
    (n) => n.metric === 'Placement Reporting Years',
  );
  assert.ok(yearNote);
  assert.strictEqual(yearNote.fair, false);
  assert.ok(
    yearNote.explanation.includes(
      'cannot be compared directly across different reporting years',
    ),
  );
});

test('Fairness Engine: Highest package is marked as outlier, not typical compensation', () => {
  const sample1: CollegeRecord = {
    ...validatedColleges[0],
    placements: {
      ...validatedColleges[0].placements,
      highest_package_lpa: 45,
    },
  };

  const comparison = analyzeComparison([sample1, validatedColleges[1]]);
  const highestNote = comparison.fairnessNotes.find((n) =>
    n.metric.includes('Highest Package'),
  );
  assert.ok(highestNote);
  assert.strictEqual(highestNote.fair, false);
  assert.ok(
    highestNote.explanation.includes('exceptional single-offer outlier'),
  );
});

test('Fairness Engine: Does not invent an overall winner when data is incomplete', () => {
  const comparison = analyzeComparison([
    validatedColleges[0],
    validatedColleges[1],
  ]);
  const winnerNote = comparison.fairnessNotes.find(
    (n) => n.metric === 'Overall Evaluation',
  );
  assert.ok(winnerNote);
  assert.strictEqual(winnerNote.fair, false);
  assert.ok(
    winnerNote.explanation.includes(
      'An overall winner cannot be declared fairly',
    ),
  );
});

test('Data Completeness: Computes objective completeness score out of 10 dimensions', () => {
  const completeness = computeDataCompleteness(validatedColleges[0]);
  assert.ok(typeof completeness.score === 'number');
  assert.ok(typeof completeness.percentage === 'number');
  assert.strictEqual(completeness.details.length, 10);
});
