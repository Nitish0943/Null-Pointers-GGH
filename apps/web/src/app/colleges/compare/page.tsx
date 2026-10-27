import { Suspense } from 'react';
import { Navigation } from '../../../components/Navigation';
import { InstitutionComparisonClient } from '../../../components/InstitutionComparisonClient';
import { getAllColleges } from '../../../lib/college-service';

export default function ComparePage() {
  const allColleges = getAllColleges();

  return (
    <main className="site-shell">
      <Navigation />
      <Suspense
        fallback={
          <div className="empty-results-box" style={{ marginTop: '48px' }}>
            <p>Loading institution comparison...</p>
          </div>
        }
      >
        <InstitutionComparisonClient allColleges={allColleges} />
      </Suspense>
      <footer className="footer">
        <span>
          Mantrix Higher Education Navigator · Side-by-Side Comparison
        </span>
        <span>
          Comparisons adhere to reporting year alignment and NIRF category
          compatibility. No artificial winners are invented.
        </span>
      </footer>
    </main>
  );
}
