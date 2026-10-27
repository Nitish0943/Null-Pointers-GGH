import { NextResponse } from 'next/server';
import {
  getCollegeById,
  computeDataCompleteness,
} from '../../../../lib/college-service';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const college = getCollegeById(id);

    if (!college) {
      return NextResponse.json(
        { error: 'Institution not found' },
        { status: 404 },
      );
    }

    const completeness = computeDataCompleteness(college);

    return NextResponse.json({
      college,
      completeness,
    });
  } catch (error) {
    console.error('Error fetching college details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
