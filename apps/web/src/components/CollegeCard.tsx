'use client';

import Link from 'next/link';
import type { CourseSearchResultItem } from '@mantrix/types';
import { useComparison } from '../lib/useComparison';

interface CollegeCardProps {
  item: CourseSearchResultItem;
}

export function CollegeCard({ item }: CollegeCardProps) {
  const { college, matchType, matchExplanation } = item;
  const { isSelected, toggleCollege } = useComparison();
  const selected = isSelected(college.id);

  // Fee display
  const feeDisplay =
    college.courses.course_fees_inr !== null
      ? `₹${college.courses.course_fees_inr.toLocaleString()} (${college.courses.fee_academic_year || 'Disclosed Year'})`
      : 'Not available (Needs verification)';

  // Placement display
  const placementDisplay =
    college.placements.average_package_lpa !== null
      ? `Avg ₹${college.placements.average_package_lpa} LPA (${college.placements.placement_year || 'Recent'})`
      : college.placements.highest_package_lpa !== null
        ? `Highest: ₹${college.placements.highest_package_lpa} LPA* (Outlier)`
        : 'Not available';

  // NIRF display
  const nirfDisplay =
    college.ranking_and_tier.nirf_rank !== null
      ? `Rank ${college.ranking_and_tier.nirf_rank} (${college.ranking_and_tier.nirf_category || 'NIRF'}, ${college.ranking_and_tier.nirf_year || 'Recent'})`
      : 'Not ranked / Not disclosed';

  return (
    <article className={`college-card ${selected ? 'selected-card' : ''}`}>
      <div className="card-top">
        <div className="card-tags">
          <span className="pill-tag sector-pill">{college.sector}</span>
          <span className="pill-tag mgmt-pill">{college.management_type}</span>
        </div>
        <span
          className={`verification-badge ${
            college.courses.exact_course_names_verified ? 'verified' : 'partial'
          }`}
        >
          {college.courses.exact_course_names_verified
            ? '✓ Verified Exact Offerings'
            : 'ℹ Partial Directory Record'}
        </span>
      </div>

      <div className="card-heading">
        <p className="college-id-label">{college.id}</p>
        <h3 className="college-title">
          <Link href={`/colleges/${college.id}`}>{college.college_name}</Link>
        </h3>
        <p className="college-location">
          📍 {college.city_or_district}, {college.state}
        </p>
      </div>

      <div className="card-match-box">
        <div className="match-status-row">
          <span className="match-label">PROGRAMME / COURSE MATCH:</span>
          <span
            className={`match-badge ${
              matchType === 'exact_verified'
                ? 'match-exact'
                : matchType === 'programme_summary'
                  ? 'match-summary'
                  : 'match-sector'
            }`}
          >
            {matchType === 'exact_verified'
              ? 'Exact Verified Match'
              : matchType === 'programme_summary'
                ? 'Programme Summary Match'
                : 'Sector / Name Match'}
          </span>
        </div>
        <p className="programmes-text">{college.courses.programme_summary}</p>
        {matchExplanation &&
          matchExplanation !== 'All institutions displayed' && (
            <p className="match-explanation-note">Note: {matchExplanation}</p>
          )}
      </div>

      <div className="metrics-grid">
        <div className="metric-cell">
          <span className="metric-label">Verified Course Fee</span>
          <span
            className={`metric-value ${
              college.courses.course_fees_inr !== null ? 'has-data' : 'no-data'
            }`}
          >
            {feeDisplay}
          </span>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Placement Packages</span>
          <span
            className={`metric-value ${
              college.placements.average_package_lpa !== null
                ? 'has-data'
                : 'no-data'
            }`}
          >
            {placementDisplay}
          </span>
        </div>

        <div className="metric-cell">
          <span className="metric-label">NIRF Ranking</span>
          <span
            className={`metric-value ${
              college.ranking_and_tier.nirf_rank !== null
                ? 'has-data'
                : 'no-data'
            }`}
          >
            {nirfDisplay}
          </span>
        </div>

        <div className="metric-cell">
          <span className="metric-label">Official Website</span>
          <span className="metric-value">
            {college.official_website ? (
              <a
                href={college.official_website}
                target="_blank"
                rel="noopener noreferrer"
                className="website-link"
              >
                Visit official site ↗
              </a>
            ) : (
              <span className="no-data">Not disclosed</span>
            )}
          </span>
        </div>
      </div>

      <div className="card-actions">
        <Link
          href={`/colleges/${college.id}`}
          className="secondary-action btn-sm"
        >
          View Details
        </Link>
        <button
          type="button"
          onClick={() => toggleCollege(college.id)}
          className={`btn-sm ${
            selected ? 'remove-compare-btn' : 'add-compare-btn'
          }`}
          aria-label={
            selected
              ? `Remove ${college.college_name} from comparison`
              : `Add ${college.college_name} to comparison`
          }
        >
          {selected ? '✓ Added to Compare' : '+ Add to Compare'}
        </button>
      </div>
    </article>
  );
}
