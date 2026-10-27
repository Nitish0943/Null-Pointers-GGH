'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CollegeRecord } from '@mantrix/types';
import { useComparison } from '../lib/useComparison';
import {
  analyzeComparison,
  calculatePlacementRate,
  computeDataCompleteness,
} from '@mantrix/shared';

interface InstitutionComparisonClientProps {
  allColleges: CollegeRecord[];
}

export function InstitutionComparisonClient({
  allColleges,
}: InstitutionComparisonClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { selectedIds, removeCollege, addCollege, clearAll, isLoaded } =
    useComparison();
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState('');

  // Sync with URL query parameter ?ids=CG001,CG002 if present
  useEffect(() => {
    const urlIds = searchParams.get('ids');
    if (urlIds) {
      const parsed = urlIds
        .split(',')
        .map((s) => s.trim())
        .filter((id) => allColleges.some((c) => c.id === id));

      if (parsed.length > 0) {
        // If query param is provided, add any missing ones to comparison
        parsed.slice(0, 4).forEach((id) => addCollege(id));
      }
    }
  }, [searchParams, allColleges, addCollege]);

  // Keep URL updated with shareable query params
  useEffect(() => {
    if (isLoaded && selectedIds.length > 0) {
      const currentParam = searchParams.get('ids');
      const newParam = selectedIds.join(',');
      if (currentParam !== newParam) {
        router.replace(`/colleges/compare?ids=${newParam}`, { scroll: false });
      }
    }
  }, [selectedIds, isLoaded, router, searchParams]);

  // Selected colleges records
  const comparedInstitutions = useMemo(() => {
    return selectedIds
      .map((id) => allColleges.find((c) => c.id === id))
      .filter((c): c is CollegeRecord => Boolean(c));
  }, [selectedIds, allColleges]);

  // Available colleges to add
  const availableToAdd = useMemo(() => {
    return allColleges.filter((c) => !selectedIds.includes(c.id));
  }, [allColleges, selectedIds]);

  // Analysis with fairness rules and insights
  const analysis = useMemo(() => {
    return analyzeComparison(comparedInstitutions);
  }, [comparedInstitutions]);

  function handleShareLink() {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/colleges/compare?ids=${selectedIds.join(',')}`;
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2500);
      });
    }
  }

  function handleAddSelected() {
    if (selectedToAdd && selectedIds.length < 4) {
      addCollege(selectedToAdd);
      setSelectedToAdd('');
    }
  }

  return (
    <div className="comparison-container">
      {/* Top Header */}
      <div className="comparison-header">
        <div>
          <Link href="/colleges" className="back-link">
            ← Back to Course Discovery
          </Link>
          <p className="eyebrow" style={{ marginTop: '12px' }}>
            SIDE-BY-SIDE EVALUATION
          </p>
          <h1 className="comparison-title">
            Institution Comparison ({comparedInstitutions.length} of 4)
          </h1>
          <p className="comparison-subtitle">
            Compare institutions across programmes, verified fee structures,
            placement outcomes, rankings, and data transparency.
          </p>
        </div>

        <div className="comparison-top-actions">
          {comparedInstitutions.length >= 2 && (
            <button
              type="button"
              onClick={handleShareLink}
              className="secondary-action btn-sm"
              title="Copy link to this comparison"
            >
              {copiedLink ? '✓ Link Copied!' : '🔗 Share Comparison'}
            </button>
          )}
          {comparedInstitutions.length > 0 && (
            <button
              type="button"
              onClick={clearAll}
              className="danger-action btn-sm"
            >
              Clear Comparison
            </button>
          )}
        </div>
      </div>

      {/* Quick Add Bar (if < 4 selected) */}
      {comparedInstitutions.length < 4 && (
        <div className="quick-add-panel">
          <label htmlFor="add-college-select" className="quick-add-label">
            + Add an institution to this comparison (max 4):
          </label>
          <div className="quick-add-controls">
            <select
              id="add-college-select"
              className="filter-select"
              value={selectedToAdd}
              onChange={(e) => setSelectedToAdd(e.target.value)}
            >
              <option value="">
                -- Choose an institution from directory --
              </option>
              {availableToAdd.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.college_name} ({col.city_or_district} ·{' '}
                  {col.management_type})
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleAddSelected}
              disabled={!selectedToAdd}
              className="primary-action btn-sm"
            >
              Add Institution
            </button>
          </div>
        </div>
      )}

      {/* If fewer than 2 colleges are selected */}
      {comparedInstitutions.length < 2 ? (
        <div className="empty-results-box" style={{ marginTop: '24px' }}>
          <div className="empty-icon" aria-hidden="true">
            ⚖️
          </div>
          <h3>Select at least 2 institutions to compare</h3>
          <p>
            You currently have {comparedInstitutions.length} institution
            selected. Choose 2, 3, or 4 institutions to inspect a comprehensive
            side-by-side evaluation table.
          </p>
          <Link href="/colleges" className="primary-action btn-sm">
            Browse Course Discovery Directory
          </Link>
        </div>
      ) : (
        <>
          {/* Comparison Fairness & Evaluation Notes Banner */}
          <div className="fairness-banner" role="alert">
            <div className="fairness-banner-header">
              <span className="banner-icon" aria-hidden="true">
                ⚠️
              </span>
              <h3>Comparison Fairness & Transparency Disclosures</h3>
            </div>
            <ul className="fairness-list">
              {analysis.fairnessNotes.map((note, idx) => (
                <li
                  key={idx}
                  className={note.fair ? 'fair-note' : 'unfair-note'}
                >
                  <strong>{note.metric}:</strong> {note.explanation}
                </li>
              ))}
            </ul>
          </div>

          {/* Side-by-Side Comparison Table */}
          <div className="table-responsive-wrapper">
            <table className="comparison-table">
              <thead>
                <tr>
                  <th className="feature-column-header">Metric / Feature</th>
                  {comparedInstitutions.map((c) => (
                    <th key={c.id} className="college-column-header">
                      <div className="col-header-inner">
                        <span className="col-id">{c.id}</span>
                        <Link
                          href={`/colleges/${c.id}`}
                          className="col-name-link"
                        >
                          {c.college_name}
                        </Link>
                        <span className="col-meta">
                          {c.city_or_district} · {c.management_type}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeCollege(c.id)}
                          className="col-remove-btn"
                          aria-label={`Remove ${c.college_name}`}
                        >
                          Remove ×
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Basic Details */}
                <tr className="section-divider-row">
                  <td colSpan={comparedInstitutions.length + 1}>
                    INSTITUTION OVERVIEW & LOCATION
                  </td>
                </tr>

                <tr>
                  <td className="row-title">Sector / Domain</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>{c.sector}</td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Management Type</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      <span className="pill-tag mgmt-pill">
                        {c.management_type}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Official Website</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.official_website ? (
                        <a
                          href={c.official_website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="website-link"
                        >
                          Official Portal ↗
                        </a>
                      ) : (
                        <span className="text-muted">Not disclosed</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Courses & Curriculum */}
                <tr className="section-divider-row">
                  <td colSpan={comparedInstitutions.length + 1}>
                    COURSES & PROGRAMMES
                  </td>
                </tr>

                <tr>
                  <td className="row-title">Programme Summary</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id} className="wrap-cell">
                      <strong>{c.courses.programme_summary}</strong>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Exact Course Verification</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      <span
                        className={`status-pill ${
                          c.courses.exact_course_names_verified
                            ? 'status-good'
                            : 'status-pending'
                        }`}
                      >
                        {c.courses.exact_course_names_verified
                          ? 'Verified Exact Offering'
                          : 'Broad Summary (Unverified Branches)'}
                      </span>
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Course Duration</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.courses.course_duration || 'Not available'}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Verified Course Fee</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.courses.course_fees_inr !== null ? (
                        <strong className="text-accent">
                          ₹{c.courses.course_fees_inr.toLocaleString()} (
                          {c.courses.fee_academic_year || 'Disclosed Year'})
                        </strong>
                      ) : (
                        <span className="text-muted">
                          Not available (Needs verification)
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Placements */}
                <tr className="section-divider-row">
                  <td colSpan={comparedInstitutions.length + 1}>
                    CAREER & PLACEMENT OUTCOMES
                  </td>
                </tr>

                <tr>
                  <td className="row-title">Reporting Year</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.placements.placement_year ? (
                        <strong>{c.placements.placement_year}</strong>
                      ) : (
                        <span className="text-muted">Not disclosed</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Average Package (LPA)</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.placements.average_package_lpa !== null ? (
                        <strong className="text-good">
                          ₹{c.placements.average_package_lpa} LPA
                        </strong>
                      ) : (
                        <span className="text-muted">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Median Package (LPA)</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.placements.median_package_lpa !== null ? (
                        `₹${c.placements.median_package_lpa} LPA`
                      ) : (
                        <span className="text-muted">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Highest Package (LPA)*</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.placements.highest_package_lpa !== null ? (
                        <span>₹{c.placements.highest_package_lpa} LPA*</span>
                      ) : (
                        <span className="text-muted">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Eligible vs Placed</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.placements.students_placed !== null &&
                      c.placements.students_eligible !== null ? (
                        `${c.placements.students_placed} placed of ${c.placements.students_eligible} eligible`
                      ) : (
                        <span className="text-muted">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Verified Placement Rate</td>
                  {comparedInstitutions.map((c) => {
                    const rate = calculatePlacementRate(
                      c.placements.students_placed,
                      c.placements.students_eligible,
                    );
                    return (
                      <td key={c.id}>
                        {rate !== null ? (
                          <strong className="text-good">
                            {rate.formatted}
                          </strong>
                        ) : (
                          <span className="text-muted">
                            Cannot calculate (Incomplete counts)
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>

                {/* Rankings */}
                <tr className="section-divider-row">
                  <td colSpan={comparedInstitutions.length + 1}>
                    RANKINGS & RECOGNITION
                  </td>
                </tr>

                <tr>
                  <td className="row-title">NIRF Rank</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.ranking_and_tier.nirf_rank !== null ? (
                        <strong className="text-accent">
                          Rank {c.ranking_and_tier.nirf_rank}
                        </strong>
                      ) : (
                        <span className="text-muted">
                          Unranked / Not disclosed
                        </span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">NIRF Category & Year</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.ranking_and_tier.nirf_category ? (
                        `${c.ranking_and_tier.nirf_category} (${c.ranking_and_tier.nirf_year || 'Recent'})`
                      ) : (
                        <span className="text-muted">Not available</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Campus & Reviews */}
                <tr className="section-divider-row">
                  <td colSpan={comparedInstitutions.length + 1}>
                    CAMPUS & STUDENT FEEDBACK
                  </td>
                </tr>

                <tr>
                  <td className="row-title">Campus Area</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.campus.area_acres !== null ? (
                        `${c.campus.area_acres} Acres`
                      ) : (
                        <span className="text-muted">Not disclosed</span>
                      )}
                    </td>
                  ))}
                </tr>

                <tr>
                  <td className="row-title">Student Rating</td>
                  {comparedInstitutions.map((c) => (
                    <td key={c.id}>
                      {c.student_feedback.rating !== null ? (
                        `★ ${c.student_feedback.rating}/${c.student_feedback.rating_scale || 5} (${c.student_feedback.review_count || 0} reviews)`
                      ) : (
                        <span className="text-muted">No reviews</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Data Quality */}
                <tr className="section-divider-row">
                  <td colSpan={comparedInstitutions.length + 1}>
                    DATA COMPLETENESS & AUDIT SCORE
                  </td>
                </tr>

                <tr>
                  <td className="row-title">Completeness Score</td>
                  {comparedInstitutions.map((c) => {
                    const score = computeDataCompleteness(c);
                    return (
                      <td key={c.id}>
                        <strong>{score.percentage}%</strong> ({score.score}/10
                        metrics verified)
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>

          {/* Derived Insights Section */}
          <div className="insights-section">
            <h2 className="insights-title">
              Derived Insights from Actual Data
            </h2>
            <p className="insights-subtitle">
              Every observation below is derived strictly from confirmed
              records. No overall winner is invented when disclosures are
              incomplete.
            </p>

            <div className="insights-grid">
              {analysis.insights.map((insight, idx) => (
                <div
                  key={idx}
                  className={`insight-card insight-${insight.type}`}
                >
                  <h4>{insight.title}</h4>
                  <p>{insight.description}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
