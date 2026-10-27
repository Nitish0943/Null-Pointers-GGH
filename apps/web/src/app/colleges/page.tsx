import { Navigation } from '../../components/Navigation';
import { CourseDiscoveryClient } from '../../components/CourseDiscoveryClient';
import { getAllColleges } from '../../lib/college-service';

export default function CollegesPage() {
  const allColleges = getAllColleges();

  return (
    <main className="site-shell">
      <Navigation />
      <CourseDiscoveryClient initialColleges={allColleges} />
      <footer className="footer">
        <span>Mantrix Higher Education Navigator · Chhattisgarh Directory</span>
        <span>
          Data verified against official disclosures (NIRF, CSVTU, NMC, AISHE).
          Unverified fields are clearly flagged.
        </span>
      </footer>
    </main>
  );
}
