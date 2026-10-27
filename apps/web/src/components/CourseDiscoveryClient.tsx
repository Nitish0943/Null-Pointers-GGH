'use client';

import { useMemo, useState } from 'react';
import type { CollegeRecord, CourseSearchQuery } from '@mantrix/types';
import { searchColleges } from '@mantrix/shared';
import { CollegeCard } from './CollegeCard';
import { FloatingCompareBar } from './FloatingCompareBar';

interface CourseDiscoveryClientProps {
  initialColleges: CollegeRecord[];
}

const SEARCH_SUGGESTIONS = [
  'B.Tech Computer Science colleges in Bhilai',
  'Artificial Intelligence courses in Chhattisgarh',
  'Government engineering colleges in Raipur',
  'MBA colleges with available placement information',
  'MBBS medical colleges in Chhattisgarh',
];

export function CourseDiscoveryClient({
  initialColleges,
}: CourseDiscoveryClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [degreeType, setDegreeType] = useState('all');
  const [managementType, setManagementType] = useState('all');
  const [city, setCity] = useState('all');
  const [sector, setSector] = useState('all');
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [hasPlacement, setHasPlacement] = useState(false);
  const [hasRanking, setHasRanking] = useState(false);
  const [sortBy, setSortBy] = useState<CourseSearchQuery['sortBy']>('name_asc');
  const [page, setPage] = useState(1);
  const limit = 12;

  // Compute search results dynamically
  const searchResults = useMemo(() => {
    const queryObj: CourseSearchQuery = {
      query: searchQuery.trim() || undefined,
      degreeType: degreeType !== 'all' ? degreeType : undefined,
      city: city !== 'all' ? city : undefined,
      managementType: managementType !== 'all' ? managementType : undefined,
      sector: sector !== 'all' ? sector : undefined,
      verifiedOnly,
      hasPlacement,
      hasRanking,
      sortBy,
      page,
      limit,
    };

    return searchColleges(initialColleges, queryObj);
  }, [
    initialColleges,
    searchQuery,
    degreeType,
    city,
    managementType,
    sector,
    verifiedOnly,
    hasPlacement,
    hasRanking,
    sortBy,
    page,
  ]);

  function handleReset() {
    setSearchQuery('');
    setDegreeType('all');
    setManagementType('all');
    setCity('all');
    setSector('all');
    setVerifiedOnly(false);
    setHasPlacement(false);
    setHasRanking(false);
    setSortBy('name_asc');
    setPage(1);
  }

  function applySuggestion(suggestion: string) {
    setSearchQuery(suggestion);
    setPage(1);
  }

  return (
    <div className="discovery-container">
      {/* Search Header */}
      <section className="search-hero">
        <p className="eyebrow">CHHATTISGARH HIGHER EDUCATION · 2025–2026</p>
        <h1 className="discovery-title">Discover Courses & Institutions</h1>
        <p className="discovery-subtitle">
          Search programmes, explore verified offerings, and discover{' '}
          {initialColleges.length} institutions across Chhattisgarh with honest
          disclosure tracking.
        </p>

        <div className="search-bar-wrapper">
          <div className="search-input-box">
            <span className="search-icon" aria-hidden="true">
              🔍
            </span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by course name, branch (e.g. B.Tech Computer Science, AI, MBA), institution, or city..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              aria-label="Search courses and institutions"
            />
            {searchQuery && (
              <button
                type="button"
                className="search-clear-btn"
                onClick={() => {
                  setSearchQuery('');
                  setPage(1);
                }}
                aria-label="Clear search query"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Suggestion Chips */}
        <div className="suggestions-row">
          <span className="suggestions-label">Try searching:</span>
          <div className="chips-list">
            {SEARCH_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                className="suggestion-chip"
                onClick={() => applySuggestion(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Filter Controls Bar */}
      <section
        className="filters-section"
        aria-label="Course and institution filters"
      >
        <div className="filter-controls-grid">
          <div className="filter-item">
            <label htmlFor="degree-select">Degree Type</label>
            <select
              id="degree-select"
              className="filter-select"
              value={degreeType}
              onChange={(e) => {
                setDegreeType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Degrees</option>
              {searchResults.availableDegreeTypes.map((deg) => (
                <option key={deg} value={deg}>
                  {deg}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="mgmt-select">Management</label>
            <select
              id="mgmt-select"
              className="filter-select"
              value={managementType}
              onChange={(e) => {
                setManagementType(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">All Management Types</option>
              <option value="government">Government (All)</option>
              <option value="private">Private (All)</option>
              <option value="Central Government">Central Government</option>
              <option value="State University">State University</option>
              <option value="Private University">Private University</option>
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="city-select">City / District</label>
            <select
              id="city-select"
              className="filter-select"
              value={city}
              onChange={(e) => {
                setCity(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">
                All Locations ({searchResults.availableCities.length})
              </option>
              {searchResults.availableCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <label htmlFor="sort-select">Sort By</label>
            <select
              id="sort-select"
              className="filter-select"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as CourseSearchQuery['sortBy']);
                setPage(1);
              }}
            >
              <option value="name_asc">Institution Name (A to Z)</option>
              <option value="name_desc">Institution Name (Z to A)</option>
              <option value="city_asc">City / Location</option>
              <option value="management_asc">Management Type</option>
            </select>
          </div>
        </div>

        {/* Checkbox toggles */}
        <div className="filter-checkboxes-row">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                setPage(1);
              }}
            />
            Verified course offerings only
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hasPlacement}
              onChange={(e) => {
                setHasPlacement(e.target.checked);
                setPage(1);
              }}
            />
            With available placement data
          </label>

          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={hasRanking}
              onChange={(e) => {
                setHasRanking(e.target.checked);
                setPage(1);
              }}
            />
            With NIRF ranking
          </label>

          <button
            type="button"
            className="reset-filters-btn"
            onClick={handleReset}
          >
            Reset All Filters
          </button>
        </div>
      </section>

      {/* Results Header */}
      <div className="results-header">
        <div>
          <h2 className="results-count-title">
            {searchResults.total}{' '}
            {searchResults.total === 1 ? 'institution' : 'institutions'} found
          </h2>
          {searchQuery && (
            <p className="active-query-note">
              Filtered for &ldquo;<strong>{searchQuery}</strong>&rdquo;
            </p>
          )}
        </div>
        <div className="results-page-indicator">
          Page {searchResults.page} of {searchResults.totalPages}
        </div>
      </div>

      {/* Results Grid */}
      {searchResults.results.length > 0 ? (
        <div className="college-cards-grid">
          {searchResults.results.map((item) => (
            <CollegeCard key={item.college.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="empty-results-box">
          <div className="empty-icon" aria-hidden="true">
            🏛️
          </div>
          <h3>No institutions found matching your criteria</h3>
          <p>
            No records matched your current query and filters. Try broadening
            your search or resetting filters to explore all{' '}
            {initialColleges.length} institutions.
          </p>
          <button
            type="button"
            className="primary-action btn-sm"
            onClick={handleReset}
          >
            Reset All Filters
          </button>
        </div>
      )}

      {/* Pagination Bar */}
      {searchResults.totalPages > 1 && (
        <div
          className="pagination-bar"
          role="navigation"
          aria-label="Pagination"
        >
          <button
            type="button"
            className="secondary-action btn-sm"
            disabled={searchResults.page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            ← Previous
          </button>
          <span className="pagination-info">
            Page {searchResults.page} of {searchResults.totalPages}
          </span>
          <button
            type="button"
            className="secondary-action btn-sm"
            disabled={searchResults.page >= searchResults.totalPages}
            onClick={() =>
              setPage((p) => Math.min(searchResults.totalPages, p + 1))
            }
          >
            Next →
          </button>
        </div>
      )}

      {/* Persistent floating bar */}
      <FloatingCompareBar allColleges={initialColleges} />
    </div>
  );
}
