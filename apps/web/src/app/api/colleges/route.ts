import { NextResponse } from 'next/server';
import {
  getComparisonData,
  searchCollegesData,
} from '../../../lib/college-service';
import type { CourseSearchQuery } from '@mantrix/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    // If requesting comparison analysis directly
    const compareIds = searchParams.get('compareIds');
    if (compareIds) {
      const ids = compareIds
        .split(',')
        .map((id) => id.trim())
        .filter(Boolean);
      const comparison = getComparisonData(ids);
      return NextResponse.json(comparison);
    }

    const query: CourseSearchQuery = {
      query: searchParams.get('query') || undefined,
      degreeType: searchParams.get('degreeType') || undefined,
      branchOrSpecialization:
        searchParams.get('branchOrSpecialization') || undefined,
      city: searchParams.get('city') || undefined,
      managementType: searchParams.get('managementType') || undefined,
      sector: searchParams.get('sector') || undefined,
      maxFee: searchParams.get('maxFee')
        ? Number(searchParams.get('maxFee'))
        : undefined,
      hasPlacement: searchParams.get('hasPlacement') === 'true',
      hasRanking: searchParams.get('hasRanking') === 'true',
      verifiedOnly: searchParams.get('verifiedOnly') === 'true',
      sortBy:
        (searchParams.get('sortBy') as CourseSearchQuery['sortBy']) ||
        'name_asc',
      page: searchParams.get('page') ? Number(searchParams.get('page')) : 1,
      limit: searchParams.get('limit') ? Number(searchParams.get('limit')) : 12,
    };

    const results = searchCollegesData(query);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching colleges:', error);
    return NextResponse.json(
      { error: 'Failed to process course discovery query' },
      { status: 500 },
    );
  }
}
