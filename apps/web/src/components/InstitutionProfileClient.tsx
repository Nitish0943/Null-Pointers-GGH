'use client';

import Link from 'next/link';
import type { CollegeRecord } from '@mantrix/types';
import { useComparison } from '../lib/useComparison';
import {
  calculatePlacementRate,
  computeDataCompleteness,
} from '@mantrix/shared';

interface InstitutionProfileClientProps {
  college: CollegeRecord;
}

export function InstitutionProfileClient({
  college,
}: InstitutionProfileClientProps) {
  const { isSelected, toggleCollege } = useComparison();
  const selected = isSelected(college.id);
  const completeness = computeDataCompleteness(college);

  const placementRate = calculatePlacementRate(
    college.placements.students_placed,
    college.placements.students_eligible,
  );

  return (
    <div className="profile-container">
      {/* Top breadcrumb & back */}
      <div className="profile-topbar">
        <Link href="/colleges" className="back-link">
          ← Back to Course Discovery
        </Link>
        <div className="profile-actions">
          <button
            type="button"
            onClick={() => toggleCollege(college.id)}
            className={`btn-sm ${selected ? 'remove-compare-btn' : 'add-compare-btn'}`}
          >
            {selected ? '✓ Added to Comparison' : '+ Add to Comparison'}
          </button>
          {college.official_website && (
            <a
              href={college.official_website}
              target="_blank"
              rel="noopener noreferrer"
              className="primary-action btn-sm"
            >
              Visit Official Website ↗
            </a>
          )}
        </div>
      </div>

      {/* Hero Section */}
      <section className="profile-hero">
        <div className="hero-badge-row">
          <span className="pill-tag sector-pill">{college.sector}</span>
          <span className="pill-tag mgmt-pill">{college.management_type}</span>
          <span
            className={`verification-badge ${
              college.courses.exact_course_names_verified
                ? 'verified'
                : 'partial'
            }`}
          >
            {college.courses.exact_course_names_verified
              ? '✓ Verified Exact Course Offerings'
              : 'ℹ Partial Directory Record'}
          </span>
        </div>

        <p className="college-id-label">{college.id}</p>
        <h1 className="profile-title">{college.college_name}</h1>
        <p className="profile-location">
          📍 {college.city_or_district}, {college.state}
        </p>

        {college.record_notes && (
          <div className="record-notes-callout">
            <strong>Advisory Note:</strong> {college.record_notes}
          </div>
        )}
      </section>

      {/* Main Grid Sections */}
      <div className="profile-grid">
        {/* Section 1: Courses & Programmes */}
        <section className="profile-card" aria-labelledby="courses-heading">
          <div className="card-header-row">
            <h2 id="courses-heading">Courses & Programmes</h2>
            <span
              className={`status-pill ${
                college.courses.exact_course_names_verified
                  ? 'status-good'
                  : 'status-pending'
              }`}
            >
              {college.courses.exact_course_names_verified
                ? 'Exact List Verified'
                : 'Broad Summary (Needs Branch Verification)'}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Programme Summary:</span>
            <span className="row-value bold">
              {college.courses.programme_summary}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Exact Course Names Status:</span>
            <span className="row-value">
              {college.courses.exact_course_names_verified ? (
                <span className="text-success">
                  Verified exact course curriculum matching AICTE/CSVTU
                  disclosures.
                </span>
              ) : (
                <span className="text-warning">
                  Not yet verified independently. Only broad degree programmes
                  are reported in directory.
                </span>
              )}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Course Duration:</span>
            <span className="row-value">
              {college.courses.course_duration ||
                'Not available (Varies by programme: typically 4 years B.Tech / 2 years M.Tech / 3 years Degree)'}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Annual Course Fee:</span>
            <span className="row-value">
              {college.courses.course_fees_inr !== null ? (
                <strong className="text-accent">
                  ₹{college.courses.course_fees_inr.toLocaleString()}{' '}
                  <span className="text-muted">
                    ({college.courses.fee_academic_year || 'Disclosed Year'})
                  </span>
                </strong>
              ) : (
                <span className="text-muted">
                  Not available (Needs verification with official fee regulatory
                  committee)
                </span>
              )}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Total Course Count:</span>
            <span className="row-value">
              {college.courses.course_count !== null
                ? college.courses.course_count
                : 'Not available (Consult institution prospectus)'}
            </span>
          </div>
        </section>

        {/* Section 2: Placement Outcomes */}
        <section className="profile-card" aria-labelledby="placement-heading">
          <div className="card-header-row">
            <h2 id="placement-heading">Placement & Career Outcomes</h2>
            <span className="status-pill">
              {college.placements.placement_year
                ? `Year: ${college.placements.placement_year}`
                : 'Reporting Year: Not disclosed'}
            </span>
          </div>

          <div className="metrics-triad">
            <div className="triad-box">
              <span className="triad-label">Average Package</span>
              <span className="triad-value">
                {college.placements.average_package_lpa !== null
                  ? `₹${college.placements.average_package_lpa} LPA`
                  : 'Not available'}
              </span>
            </div>

            <div className="triad-box">
              <span className="triad-label">Median Package</span>
              <span className="triad-value">
                {college.placements.median_package_lpa !== null
                  ? `₹${college.placements.median_package_lpa} LPA`
                  : 'Not available'}
              </span>
            </div>

            <div className="triad-box highlight-triad">
              <span className="triad-label">Highest Package*</span>
              <span className="triad-value">
                {college.placements.highest_package_lpa !== null
                  ? `₹${college.placements.highest_package_lpa} LPA`
                  : 'Not available'}
              </span>
              <span className="triad-footnote">
                *Outlier offer; not a typical salary
              </span>
            </div>
          </div>

          <div className="data-row" style={{ marginTop: '16px' }}>
            <span className="row-label">Students Eligible:</span>
            <span className="row-value">
              {college.placements.students_eligible !== null
                ? college.placements.students_eligible
                : 'Not available'}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Students Placed:</span>
            <span className="row-value">
              {college.placements.students_placed !== null
                ? college.placements.students_placed
                : 'Not available'}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Verified Placement Rate:</span>
            <span className="row-value">
              {placementRate !== null ? (
                <strong className="text-success">
                  {placementRate.formatted}
                </strong>
              ) : (
                <span className="text-muted">
                  Cannot be calculated (Requires both eligible & placed student
                  counts)
                </span>
              )}
            </span>
          </div>

          {college.placements.placement_source_url && (
            <div className="data-row">
              <span className="row-label">Placement Source:</span>
              <span className="row-value">
                <a
                  href={college.placements.placement_source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="website-link"
                >
                  Official Placement Report ↗
                </a>
              </span>
            </div>
          )}
        </section>

        {/* Section 3: Rankings & Tier */}
        <section className="profile-card" aria-labelledby="ranking-heading">
          <div className="card-header-row">
            <h2 id="ranking-heading">NIRF Ranking & Tier Classification</h2>
          </div>

          <div className="data-row">
            <span className="row-label">NIRF Rank:</span>
            <span className="row-value">
              {college.ranking_and_tier.nirf_rank !== null ? (
                <strong className="text-accent">
                  Rank {college.ranking_and_tier.nirf_rank}
                </strong>
              ) : (
                <span className="text-muted">
                  Not ranked in Top NIRF band / Not disclosed
                </span>
              )}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">NIRF Category:</span>
            <span className="row-value">
              {college.ranking_and_tier.nirf_category || 'Not available'}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">NIRF Assessment Year:</span>
            <span className="row-value">
              {college.ranking_and_tier.nirf_year || 'Not available'}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Official Tier Status:</span>
            <span className="row-value">
              {college.ranking_and_tier.tier ? (
                <span>
                  {college.ranking_and_tier.tier}{' '}
                  {college.ranking_and_tier.tier_is_official
                    ? '(Official)'
                    : '(Informal / Directory)'}
                </span>
              ) : (
                <span className="text-muted">No informal tier assigned</span>
              )}
            </span>
          </div>
        </section>

        {/* Section 4: Campus & Student Feedback */}
        <section className="profile-card" aria-labelledby="campus-heading">
          <div className="card-header-row">
            <h2 id="campus-heading">Campus & Student Experience</h2>
          </div>

          <div className="data-row">
            <span className="row-label">Campus Area:</span>
            <span className="row-value">
              {college.campus.area_acres !== null ? (
                `${college.campus.area_acres} Acres (${college.campus.area_definition || 'Main Campus'})`
              ) : (
                <span className="text-muted">Campus area not disclosed</span>
              )}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Student Feedback Rating:</span>
            <span className="row-value">
              {college.student_feedback.rating !== null ? (
                <span>
                  ★ {college.student_feedback.rating} /{' '}
                  {college.student_feedback.rating_scale || 5} (
                  {college.student_feedback.review_count || 0} reviews on{' '}
                  {college.student_feedback.platform || 'Verified Portal'})
                </span>
              ) : (
                <span className="text-muted">
                  No student reviews published in current dataset
                </span>
              )}
            </span>
          </div>

          <div className="data-row">
            <span className="row-label">Data Status:</span>
            <span className="row-value">
              <code>{college.data_status}</code>
            </span>
          </div>
        </section>
      </div>

      {/* Data Quality & Completeness Card */}
      <section
        className="profile-card completeness-card"
        style={{ marginTop: '24px' }}
      >
        <div className="card-header-row">
          <h2>Data Verification & Audit</h2>
          <span className="status-pill status-good">
            Completeness: {completeness.percentage}% ({completeness.score}/10
            metrics verified)
          </span>
        </div>
        <p className="completeness-desc">
          Mantrix adheres to strict truth-in-data principles. Missing metrics
          are never fabricated or treated as zero. Below is the verification
          status of 10 audit dimensions for this institution:
        </p>

        <ul className="audit-checklist">
          {completeness.details.map((detail, index) => {
            const isVerified = detail.includes('Verified');
            return (
              <li
                key={index}
                className={isVerified ? 'verified-item' : 'missing-item'}
              >
                <span className="check-icon">{isVerified ? '✓' : '—'}</span>
                {detail}
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
