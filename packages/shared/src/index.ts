import type {
  CollegeRecord,
  ComparisonAnalysis,
  ComparisonFairnessNote,
  CourseMatchType,
  CourseSearchQuery,
  CourseSearchResultItem,
  CourseSearchResults,
  DerivedInsight,
} from '@mantrix/types';

// Standard synonyms for degree types
const DEGREE_SYNONYMS: Record<string, string[]> = {
  'b.tech': [
    'b.tech',
    'btech',
    'b.e.',
    'be',
    'bachelor of technology',
    'bachelor of engineering',
  ],
  'm.tech': [
    'm.tech',
    'mtech',
    'm.e.',
    'me',
    'master of technology',
    'master of engineering',
  ],
  mbbs: [
    'mbbs',
    'medicine',
    'medical',
    'doctor',
    'healthcare',
    'health sciences',
  ],
  mba: [
    'mba',
    'master of business administration',
    'management',
    'business administration',
    'pgdm',
  ],
  mca: ['mca', 'master of computer applications', 'computer applications'],
  'b.sc': ['b.sc', 'bsc', 'bachelor of science'],
  'm.sc': ['m.sc', 'msc', 'master of science'],
  'b.arch': ['b.arch', 'barch', 'architecture'],
  'ph.d': ['ph.d', 'phd', 'doctor of philosophy', 'research'],
  diploma: ['diploma', 'polytechnic'],
  'b.pharm': ['b.pharm', 'bpharm', 'pharmacy'],
  'd.pharm': ['d.pharm', 'dpharm', 'pharmacy'],
  law: ['law', 'll.b', 'llb', 'll.m', 'llm', 'b.a. ll.b'],
};

// Specializations and branches
const BRANCH_SYNONYMS: Record<string, string[]> = {
  'computer science': [
    'computer science',
    'cse',
    'cs',
    'computing',
    'software',
    'it',
    'information technology',
  ],
  'artificial intelligence': [
    'artificial intelligence',
    'ai',
    'machine learning',
    'data science',
    'ai & ml',
  ],
  mechanical: ['mechanical', 'me', 'mechanical engineering'],
  civil: ['civil', 'ce', 'civil engineering'],
  electrical: [
    'electrical',
    'ee',
    'eee',
    'electrical engineering',
    'electronics',
    'ece',
  ],
  chemical: ['chemical', 'chemical engineering'],
  mining: ['mining', 'mining engineering'],
  pharmacy: ['pharmacy', 'pharmaceutics', 'pharmacology'],
  agriculture: ['agriculture', 'agricultural', 'farming', 'horticulture'],
  polymer: ['polymer', 'plastics', 'plastic engineering'],
};

// Known locations in Chhattisgarh dataset
const KNOWN_CITIES = [
  'bhilai',
  'durg',
  'raipur',
  'bilaspur',
  'jagdalpur',
  'raigarh',
  'ambikapur',
  'rajnandgaon',
  'kanker',
  'korba',
  'mahasamund',
  'atal nagar',
  'naya raipur',
  'anjora',
];

const MANAGEMENT_GROUPS: Record<string, string[]> = {
  government: [
    'central government',
    'state government',
    'government',
    'public / government-supported',
    'state university',
    'central university',
    'state agricultural university',
    'state law university',
    'state open university',
  ],
  private: [
    'private',
    'private university',
    'private / trust-managed',
    'private / verify current status',
    'private / verify programmes',
  ],
};

function normalize(text: string | null | undefined): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[\s\-_/]+/g, ' ');
}

function getDegreeSynonyms(targetDegree: string): string[] {
  const normTarget = normalize(targetDegree);
  const targetNoDots = normTarget.replace(/\./g, '');
  const synonyms = new Set<string>([normTarget, targetNoDots]);

  for (const [key, synList] of Object.entries(DEGREE_SYNONYMS)) {
    const keyNorm = normalize(key);
    const keyNoDots = keyNorm.replace(/\./g, '');
    const normList = synList.map(normalize);
    const noDotsList = normList.map((s) => s.replace(/\./g, ''));

    if (
      keyNorm === normTarget ||
      keyNoDots === targetNoDots ||
      normList.includes(normTarget) ||
      noDotsList.includes(targetNoDots)
    ) {
      synonyms.add(keyNorm);
      synonyms.add(keyNoDots);
      synList.forEach((s) => {
        synonyms.add(normalize(s));
        synonyms.add(normalize(s).replace(/\./g, ''));
      });
    }
  }

  return Array.from(synonyms).filter(Boolean);
}

function getBranchSynonyms(targetBranch: string): string[] {
  const normTarget = normalize(targetBranch);
  const targetNoDots = normTarget.replace(/\./g, '');
  const synonyms = new Set<string>([normTarget, targetNoDots]);

  for (const [key, synList] of Object.entries(BRANCH_SYNONYMS)) {
    const keyNorm = normalize(key);
    const keyNoDots = keyNorm.replace(/\./g, '');
    const normList = synList.map(normalize);
    const noDotsList = normList.map((s) => s.replace(/\./g, ''));

    if (
      keyNorm === normTarget ||
      keyNoDots === targetNoDots ||
      normList.includes(normTarget) ||
      noDotsList.includes(targetNoDots)
    ) {
      synonyms.add(keyNorm);
      synonyms.add(keyNoDots);
      synList.forEach((s) => {
        synonyms.add(normalize(s));
        synonyms.add(normalize(s).replace(/\./g, ''));
      });
    }
  }

  return Array.from(synonyms).filter(Boolean);
}

export function matchesDegree(
  programmeSummary: string,
  sector: string,
  targetDegree: string,
): boolean {
  const normProg = normalize(programmeSummary);
  const normProgNoDots = normProg.replace(/\./g, '');
  const normSec = normalize(sector);
  const normSecNoDots = normSec.replace(/\./g, '');

  const synonyms = getDegreeSynonyms(targetDegree);
  return synonyms.some(
    (syn) =>
      normProg.includes(syn) ||
      normProgNoDots.includes(syn) ||
      normSec.includes(syn) ||
      normSecNoDots.includes(syn),
  );
}

export function matchesBranch(
  programmeSummary: string,
  sector: string,
  targetBranch: string,
): boolean {
  const normTarget = normalize(targetBranch);
  const normProg = normalize(programmeSummary);
  const normProgNoDots = normProg.replace(/\./g, '');
  const normSec = normalize(sector);
  const normSecNoDots = normSec.replace(/\./g, '');

  const synonyms = getBranchSynonyms(targetBranch);
  const directMatch = synonyms.some(
    (syn) =>
      normProg.includes(syn) ||
      normProgNoDots.includes(syn) ||
      normSec.includes(syn) ||
      normSecNoDots.includes(syn),
  );
  if (directMatch) return true;

  // Technical specializations (CS, AI, Mechanical) align with Engineering/Technical institutions
  const isEngineeringSpecialization = [
    'computer science',
    'artificial intelligence',
    'mechanical',
    'civil',
    'electrical',
    'mining',
    'polymer',
  ].includes(normTarget);
  if (isEngineeringSpecialization) {
    return (
      normSec.includes('engineering') ||
      normSec.includes('it') ||
      normProg.includes('b.tech') ||
      normProg.includes('m.tech') ||
      normProgNoDots.includes('btech')
    );
  }

  return false;
}

export function matchesManagement(
  collegeManagement: string,
  filterManagement: string,
): boolean {
  const normCollege = normalize(collegeManagement);
  const normFilter = normalize(filterManagement);

  if (normFilter === 'all' || !normFilter) return true;

  if (normFilter === 'government') {
    return MANAGEMENT_GROUPS.government.some((g) => normCollege.includes(g));
  }
  if (normFilter === 'private') {
    return MANAGEMENT_GROUPS.private.some((p) => normCollege.includes(p));
  }

  return normCollege.includes(normFilter);
}

export function matchesCity(collegeCity: string, filterCity: string): boolean {
  const normCollege = normalize(collegeCity);
  const normFilter = normalize(filterCity);

  if (normFilter === 'all' || !normFilter) return true;

  // Split composite cities like "Bhilai / Durg"
  const tokens = normCollege.split('/').map((t) => normalize(t));
  return tokens.some((t) => t.includes(normFilter) || normFilter.includes(t));
}

interface MatchEvaluation {
  isMatch: boolean;
  score: number;
  matchType: CourseMatchType;
  matchedTerms: string[];
  explanation: string;
}

export function evaluateSearchMatch(
  college: CollegeRecord,
  query: string,
  degreeFilter?: string,
  branchFilter?: string,
): MatchEvaluation {
  const normQuery = normalize(query);
  const normName = normalize(college.college_name);
  const normCity = normalize(college.city_or_district);
  const normSector = normalize(college.sector);
  const normProg = normalize(college.courses.programme_summary);
  const normMgmt = normalize(college.management_type);

  if (!normQuery && !degreeFilter && !branchFilter) {
    return {
      isMatch: true,
      score: 10,
      matchType: college.courses.exact_course_names_verified
        ? 'exact_verified'
        : 'programme_summary',
      matchedTerms: [],
      explanation: 'All institutions displayed',
    };
  }

  let score = 0;
  const matchedTerms: string[] = [];

  // 1. Check if a specific city was specified in query
  for (const city of KNOWN_CITIES) {
    if (normQuery.includes(city)) {
      if (!matchesCity(college.city_or_district, city)) {
        // Query demanded this city, but college is elsewhere -> exclude!
        return {
          isMatch: false,
          score: 0,
          matchType: 'programme_summary',
          matchedTerms: [],
          explanation: '',
        };
      }
      matchedTerms.push(city.toUpperCase());
      score += 100;
      break;
    }
  }

  // 2. Check if management was specified in query
  if (normQuery.includes('government') || normQuery.includes('govt')) {
    if (!MANAGEMENT_GROUPS.government.some((g) => normMgmt.includes(g))) {
      return {
        isMatch: false,
        score: 0,
        matchType: 'programme_summary',
        matchedTerms: [],
        explanation: '',
      };
    }
    matchedTerms.push('Government');
    score += 50;
  } else if (normQuery.includes('private')) {
    if (!MANAGEMENT_GROUPS.private.some((p) => normMgmt.includes(p))) {
      return {
        isMatch: false,
        score: 0,
        matchType: 'programme_summary',
        matchedTerms: [],
        explanation: '',
      };
    }
    matchedTerms.push('Private');
    score += 50;
  }

  // 3. Exact Institution Name Match bonus
  if (normQuery && normName.includes(normQuery)) {
    score += 1000;
    matchedTerms.push('Name Match');
    return {
      isMatch: true,
      score,
      matchType: 'institution_match',
      matchedTerms,
      explanation: `Matched institution name: ${college.college_name}`,
    };
  }

  // 4. Degree detection
  let detectedDegree = degreeFilter ? normalize(degreeFilter) : '';
  if (!detectedDegree) {
    for (const [degKey, synonyms] of Object.entries(DEGREE_SYNONYMS)) {
      if (synonyms.some((syn) => normQuery.includes(syn))) {
        detectedDegree = degKey;
        matchedTerms.push(degKey.toUpperCase());
        break;
      }
    }
  }

  if (detectedDegree) {
    const hasDegree = matchesDegree(
      college.courses.programme_summary,
      college.sector,
      detectedDegree,
    );
    if (!hasDegree) {
      return {
        isMatch: false,
        score: 0,
        matchType: 'programme_summary',
        matchedTerms: [],
        explanation: '',
      };
    }
    score += 150;
  }

  // 5. Branch / Specialization detection
  let detectedBranch = branchFilter ? normalize(branchFilter) : '';
  if (!detectedBranch) {
    for (const [branchKey, synonyms] of Object.entries(BRANCH_SYNONYMS)) {
      if (synonyms.some((syn) => normQuery.includes(syn))) {
        detectedBranch = branchKey;
        matchedTerms.push(branchKey);
        break;
      }
    }
  }

  if (detectedBranch) {
    const hasBranch = matchesBranch(
      college.courses.programme_summary,
      college.sector,
      detectedBranch,
    );
    if (!hasBranch) {
      return {
        isMatch: false,
        score: 0,
        matchType: 'programme_summary',
        matchedTerms: [],
        explanation: '',
      };
    }
    score += 100;
  }

  // Check word matches if no degree or branch was parsed
  if (!detectedDegree && !detectedBranch) {
    const queryWords = normQuery
      .split(' ')
      .filter(
        (w) =>
          w.length > 2 &&
          ![
            'colleges',
            'college',
            'courses',
            'course',
            'chhattisgarh',
            'for',
            'and',
            'with',
          ].includes(w),
      );
    const wordMatches = queryWords.filter(
      (w) =>
        normName.includes(w) ||
        normProg.includes(w) ||
        normSector.includes(w) ||
        normCity.includes(w),
    );
    if (wordMatches.length === 0) {
      return {
        isMatch: false,
        score: 0,
        matchType: 'programme_summary',
        matchedTerms: [],
        explanation: '',
      };
    }
    score += wordMatches.length * 20;
  }

  // Determine Match Type & Transparency Note
  if (detectedBranch) {
    if (college.courses.exact_course_names_verified) {
      return {
        isMatch: true,
        score: score + 50,
        matchType: 'exact_verified',
        matchedTerms,
        explanation: `Verified exact course offering matching ${detectedBranch}.`,
      };
    }
    return {
      isMatch: true,
      score,
      matchType: 'programme_summary',
      matchedTerms,
      explanation: `Programme summary match (${detectedDegree.toUpperCase() || 'Degree'}). Specific branch/specialization (${detectedBranch}) requires verification with official disclosures.`,
    };
  }

  if (detectedDegree) {
    return {
      isMatch: true,
      score,
      matchType: college.courses.exact_course_names_verified
        ? 'exact_verified'
        : 'programme_summary',
      matchedTerms,
      explanation: `Programme summary match: ${college.courses.programme_summary}`,
    };
  }

  return {
    isMatch: true,
    score,
    matchType: 'institution_match',
    matchedTerms,
    explanation: `Matched: ${college.college_name}`,
  };
}

export function searchColleges(
  allColleges: CollegeRecord[],
  query: CourseSearchQuery,
): CourseSearchResults {
  const {
    query: textQuery = '',
    degreeType,
    branchOrSpecialization,
    city,
    managementType,
    sector,
    maxFee,
    hasPlacement,
    hasRanking,
    verifiedOnly,
    sortBy = 'name_asc',
    page = 1,
    limit = 12,
  } = query;

  const availableCities = Array.from(
    new Set(allColleges.map((c) => c.city_or_district)),
  ).sort();
  const availableManagementTypes = Array.from(
    new Set(allColleges.map((c) => c.management_type)),
  ).sort();
  const availableSectors = Array.from(
    new Set(allColleges.map((c) => c.sector)),
  ).sort();
  const availableDegreeTypes = [
    'B.Tech',
    'M.Tech',
    'MBBS',
    'MBA',
    'MCA',
    'B.Sc',
    'M.Sc',
    'Ph.D',
    'Diploma',
    'B.Pharm',
    'Law',
  ];

  const matchedItems: Array<CourseSearchResultItem & { score: number }> = [];

  for (const college of allColleges) {
    // City filter
    if (city && !matchesCity(college.city_or_district, city)) {
      continue;
    }

    // Management filter
    if (
      managementType &&
      !matchesManagement(college.management_type, managementType)
    ) {
      continue;
    }

    // Sector filter
    if (sector && !normalize(college.sector).includes(normalize(sector))) {
      continue;
    }

    // Degree type explicit filter
    if (degreeType && degreeType !== 'all') {
      if (
        !matchesDegree(
          college.courses.programme_summary,
          college.sector,
          degreeType,
        )
      ) {
        continue;
      }
    }

    // Verified only filter
    if (
      verifiedOnly &&
      !college.courses.exact_course_names_verified &&
      !college.ranking_and_tier.tier_is_official
    ) {
      continue;
    }

    // Has placement filter
    if (hasPlacement) {
      const p = college.placements;
      const hasData =
        p.average_package_lpa !== null ||
        p.median_package_lpa !== null ||
        p.highest_package_lpa !== null ||
        p.students_placed !== null;
      if (!hasData) continue;
    }

    // Has ranking filter
    if (hasRanking && college.ranking_and_tier.nirf_rank === null) {
      continue;
    }

    // Max fee filter
    if (maxFee !== undefined && maxFee !== null && maxFee > 0) {
      if (
        college.courses.course_fees_inr === null ||
        college.courses.course_fees_inr > maxFee
      ) {
        continue;
      }
    }

    // Text & Branch evaluation
    const evaluation = evaluateSearchMatch(
      college,
      textQuery,
      degreeType,
      branchOrSpecialization,
    );
    if (!evaluation.isMatch) {
      continue;
    }

    matchedItems.push({
      college,
      matchType: evaluation.matchType,
      matchedTerms: evaluation.matchedTerms,
      matchExplanation: evaluation.explanation,
      score: evaluation.score,
    });
  }

  // Sorting: If text query provided and default sort, rank by relevance score first
  matchedItems.sort((a, b) => {
    if (textQuery && sortBy === 'name_asc') {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
    }
    switch (sortBy) {
      case 'name_desc':
        return b.college.college_name.localeCompare(a.college.college_name);
      case 'city_asc':
        return a.college.city_or_district.localeCompare(
          b.college.city_or_district,
        );
      case 'management_asc':
        return a.college.management_type.localeCompare(
          b.college.management_type,
        );
      case 'name_asc':
      default:
        return a.college.college_name.localeCompare(b.college.college_name);
    }
  });

  const total = matchedItems.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const currentPage = Math.max(1, Math.min(page, totalPages));
  const offset = (currentPage - 1) * limit;
  const paginatedResults = matchedItems.slice(offset, offset + limit);

  return {
    total,
    page: currentPage,
    limit,
    totalPages,
    results: paginatedResults,
    availableCities,
    availableManagementTypes,
    availableDegreeTypes,
    availableSectors,
  };
}

export function computeDataCompleteness(college: CollegeRecord): {
  score: number;
  percentage: number;
  details: string[];
} {
  const checks: Array<{ label: string; pass: boolean }> = [
    { label: 'Official Website', pass: Boolean(college.official_website) },
    {
      label: 'Programme Summary',
      pass: Boolean(college.courses.programme_summary),
    },
    {
      label: 'Exact Course Names Verified',
      pass: Boolean(college.courses.exact_course_names_verified),
    },
    {
      label: 'Course Fees Disclosed',
      pass: college.courses.course_fees_inr !== null,
    },
    {
      label: 'Average/Median Placement Package',
      pass:
        college.placements.average_package_lpa !== null ||
        college.placements.median_package_lpa !== null,
    },
    {
      label: 'Student Placement Counts',
      pass:
        college.placements.students_placed !== null &&
        college.placements.students_eligible !== null,
    },
    {
      label: 'NIRF Ranking Disclosed',
      pass: college.ranking_and_tier.nirf_rank !== null,
    },
    { label: 'Campus Area Verified', pass: college.campus.area_acres !== null },
    {
      label: 'Student Feedback Available',
      pass: college.student_feedback.rating !== null,
    },
    {
      label: 'Official Source Disclosed',
      pass: Boolean(
        college.placements.placement_source_url || college.record_notes,
      ),
    },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const score = passed;
  const percentage = Math.round((passed / checks.length) * 100);
  const details = checks.map(
    (c) => `${c.label}: ${c.pass ? 'Verified/Disclosed' : 'Not available'}`,
  );

  return { score, percentage, details };
}

export function analyzeComparison(
  institutions: CollegeRecord[],
): ComparisonAnalysis {
  const fairnessNotes: ComparisonFairnessNote[] = [];
  const insights: DerivedInsight[] = [];
  const completenessScores: Record<
    string,
    { score: number; percentage: number; details: string[] }
  > = {};

  institutions.forEach((c) => {
    completenessScores[c.id] = computeDataCompleteness(c);
  });

  // 1. Placement Reporting Year Fairness Check
  const placementYears = institutions.map((c) => ({
    name: c.college_name,
    year: c.placements.placement_year,
  }));
  const distinctYears = Array.from(
    new Set(placementYears.map((p) => p.year).filter(Boolean)),
  );
  const anyMissingPlacement = placementYears.some((p) => !p.year);

  if (anyMissingPlacement || distinctYears.length > 1) {
    fairnessNotes.push({
      metric: 'Placement Reporting Years',
      fair: false,
      explanation:
        'Placement statistics cannot be compared directly across different reporting years or when outcomes are not disclosed.',
    });
  } else if (distinctYears.length === 1) {
    fairnessNotes.push({
      metric: 'Placement Reporting Years',
      fair: true,
      explanation: `All institutions with placement data report for academic year ${distinctYears[0]}.`,
    });
  }

  // 2. Highest Package Fallacy Warning
  const collegesWithHighest = institutions.filter(
    (c) => c.placements.highest_package_lpa !== null,
  );
  if (collegesWithHighest.length > 0) {
    fairnessNotes.push({
      metric: 'Highest Package vs Typical Compensation',
      fair: false,
      explanation:
        'The highest package represents an exceptional single-offer outlier and must not be treated as a typical or median salary outcome.',
    });
  }

  // 3. NIRF Ranking Category Fairness Check
  const rankingCategories = institutions.map((c) => ({
    name: c.college_name,
    category: c.ranking_and_tier.nirf_category,
    year: c.ranking_and_tier.nirf_year,
    rank: c.ranking_and_tier.nirf_rank,
  }));
  const rankedColleges = rankingCategories.filter((r) => r.rank !== null);

  if (rankedColleges.length > 1) {
    const distinctCats = Array.from(
      new Set(rankedColleges.map((r) => r.category)),
    );
    const distinctRankYears = Array.from(
      new Set(rankedColleges.map((r) => r.year)),
    );

    if (distinctCats.length > 1 || distinctRankYears.length > 1) {
      fairnessNotes.push({
        metric: 'NIRF Ranking Comparability',
        fair: false,
        explanation:
          'Rankings are only comparable within identical categories and years. General universities cannot be ranked directly against specialized engineering or medical institutions.',
      });
    } else {
      fairnessNotes.push({
        metric: 'NIRF Ranking Comparability',
        fair: true,
        explanation: `Rankings belong to comparable NIRF category (${distinctCats[0]}) and year (${distinctRankYears[0]}).`,
      });
    }
  } else if (rankedColleges.length === 1) {
    fairnessNotes.push({
      metric: 'NIRF Ranking Comparability',
      fair: false,
      explanation:
        'Only one institution has an official NIRF ranking in this comparison set.',
    });
  }

  // 4. Incomplete Data Winner Warning
  const anyIncomplete = institutions.some(
    (c) =>
      c.courses.course_fees_inr === null ||
      c.placements.average_package_lpa === null ||
      !c.courses.exact_course_names_verified,
  );
  if (anyIncomplete) {
    fairnessNotes.push({
      metric: 'Overall Evaluation',
      fair: false,
      explanation:
        'An overall winner cannot be declared fairly because official data disclosures (fees, exact branches, or placements) are incomplete for one or more institutions.',
    });
  }

  // Derived Insights
  const feesAvailable = institutions.filter(
    (c) => c.courses.course_fees_inr !== null,
  );
  if (feesAvailable.length > 0) {
    const lowest = feesAvailable.reduce((min, curr) =>
      (curr.courses.course_fees_inr ?? Infinity) <
      (min.courses.course_fees_inr ?? Infinity)
        ? curr
        : min,
    );
    insights.push({
      type: 'success',
      title: 'Lowest Verified Course Fee',
      description: `${lowest.college_name} has the lowest verified fee at ₹${lowest.courses.course_fees_inr?.toLocaleString()} (${lowest.courses.fee_academic_year || 'Academic Year'}).`,
    });
  } else {
    insights.push({
      type: 'info',
      title: 'Course Fees',
      description:
        'Official fee disclosures are not published in this comparison set. Check direct institutional fee schedules.',
    });
  }

  const placementsWithAvg = institutions.filter(
    (c) => c.placements.average_package_lpa !== null,
  );
  if (placementsWithAvg.length > 0) {
    insights.push({
      type: 'info',
      title: 'Disclosed Average Packages',
      description: `${placementsWithAvg.length} of ${institutions.length} institutions disclose average placement figures.`,
    });
  } else {
    insights.push({
      type: 'warning',
      title: 'Placement Outlines',
      description:
        'No verified average placement packages are published in this dataset for the selected institutions.',
    });
  }

  const exactVerifiedColleges = institutions.filter(
    (c) => c.courses.exact_course_names_verified,
  );
  insights.push({
    type: exactVerifiedColleges.length > 0 ? 'info' : 'warning',
    title: 'Course Verification Status',
    description:
      exactVerifiedColleges.length > 0
        ? `${exactVerifiedColleges.length} of ${institutions.length} institutions have exact course names verified.`
        : 'All selected institutions currently provide broad programme summaries. Exact current course offerings require verification with official disclosures.',
  });

  return {
    institutions,
    fairnessNotes,
    insights,
    completenessScores,
  };
}

export function calculatePlacementRate(
  placed: number | null,
  eligible: number | null,
): { rate: number; formatted: string } | null {
  if (placed === null || eligible === null || eligible <= 0 || placed < 0) {
    return null;
  }
  const rate = Math.round((placed / eligible) * 100);
  return { rate, formatted: `${rate}%` };
}
