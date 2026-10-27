import dataset from '../../../../data/chhattisgarh_college_comparison_dataset.json';
import type {
  CollegeComparisonDataset,
  CollegeRecord,
  ComparisonAnalysis,
  CourseSearchQuery,
  CourseSearchResults,
} from '@mantrix/types';
import {
  analyzeComparison,
  computeDataCompleteness,
  searchColleges,
} from '@mantrix/shared';

const typedDataset = dataset as unknown as CollegeComparisonDataset;
const allColleges: CollegeRecord[] = typedDataset.colleges;

export function getAllColleges(): CollegeRecord[] {
  return allColleges;
}

export function getCollegeById(id: string): CollegeRecord | undefined {
  return allColleges.find((c) => c.id.toLowerCase() === id.toLowerCase());
}

export function searchCollegesData(
  query: CourseSearchQuery,
): CourseSearchResults {
  return searchColleges(allColleges, query);
}

export function getComparisonData(ids: string[]): ComparisonAnalysis {
  const selected = ids
    .map((id) => getCollegeById(id))
    .filter((c): c is CollegeRecord => Boolean(c));

  return analyzeComparison(selected);
}

export { computeDataCompleteness };
