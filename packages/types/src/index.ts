export type ManagementCategory =
  | 'Central Government'
  | 'State Government'
  | 'Government'
  | 'Public / government-supported'
  | 'Private'
  | 'Private University'
  | 'State University'
  | 'Central University'
  | 'Other';

export interface CollegeCourses {
  programme_summary: string;
  exact_course_names_verified: boolean;
  course_count: number | null;
  course_duration: string | null;
  course_fees_inr: number | null;
  fee_academic_year: string | null;
}

export interface CollegePlacements {
  placement_stack: string | null;
  average_package_lpa: number | null;
  median_package_lpa: number | null;
  highest_package_lpa: number | null;
  students_eligible: number | null;
  students_placed: number | null;
  students_receiving_highest_package: number | null;
  placement_year: string | null;
  placement_source_url: string | null;
}

export interface CollegeCampus {
  area_acres: number | null;
  area_definition: string | null;
}

export interface CollegeStudentFeedback {
  rating: number | null;
  rating_scale: number | null;
  review_count: number | null;
  platform: string | null;
  review_date: string | null;
}

export interface CollegeRankingAndTier {
  tier: string | null;
  tier_is_official: boolean;
  nirf_rank: number | null;
  nirf_category: string | null;
  nirf_year: number | null;
}

export interface CollegeRecord {
  id: string;
  college_name: string;
  city_or_district: string;
  state: string;
  sector: string;
  management_type: string;
  official_website: string;
  courses: CollegeCourses;
  placements: CollegePlacements;
  campus: CollegeCampus;
  student_feedback: CollegeStudentFeedback;
  ranking_and_tier: CollegeRankingAndTier;
  data_status: string;
  record_notes: string;
}

export interface DatasetQualityNotes {
  verified_exact_course_names_count: number;
  verified_placement_records_count: number;
  verified_nirf_ranking_count: number;
  verified_student_feedback_count: number;
  verified_campus_acres_count: number;
  policy: string;
}

export interface DatasetSourceReference {
  name: string;
  url: string;
}

export interface CollegeComparisonDataset {
  dataset_name: string;
  generated_on: string;
  description: string;
  data_quality_notes: DatasetQualityNotes;
  sources: DatasetSourceReference[];
  colleges: CollegeRecord[];
}

export type CourseMatchType =
  'exact_verified' | 'programme_summary' | 'sector_match' | 'institution_match';

export interface CourseSearchResultItem {
  college: CollegeRecord;
  matchType: CourseMatchType;
  matchedTerms: string[];
  matchExplanation: string;
}

export interface CourseSearchQuery {
  query?: string;
  degreeType?: string;
  branchOrSpecialization?: string;
  city?: string;
  managementType?: string;
  sector?: string;
  maxFee?: number;
  hasPlacement?: boolean;
  hasRanking?: boolean;
  verifiedOnly?: boolean;
  sortBy?: 'name_asc' | 'name_desc' | 'city_asc' | 'management_asc';
  page?: number;
  limit?: number;
}

export interface CourseSearchResults {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  results: CourseSearchResultItem[];
  availableCities: string[];
  availableManagementTypes: string[];
  availableDegreeTypes: string[];
  availableSectors: string[];
}

export interface ComparisonFairnessNote {
  metric: string;
  fair: boolean;
  explanation: string;
}

export interface DerivedInsight {
  type: 'info' | 'warning' | 'success';
  title: string;
  description: string;
}

export interface ComparisonAnalysis {
  institutions: CollegeRecord[];
  fairnessNotes: ComparisonFairnessNote[];
  insights: DerivedInsight[];
  completenessScores: Record<
    string,
    { score: number; percentage: number; details: string[] }
  >;
}
