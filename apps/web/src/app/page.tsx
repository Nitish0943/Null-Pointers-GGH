import Link from 'next/link';
import { Navigation } from '../components/Navigation';
import { getAllColleges } from '../lib/college-service';

export default function HomePage() {
  const colleges = getAllColleges();
  const plannedAreas = [
    'Assessment and career guidance',
    'Courses and colleges (Live in Chhattisgarh)',
    'Scholarships and education loans',
    'Mentors, jobs, and opportunities',
  ];

  return (
    <main className="site-shell">
      <Navigation />

      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">CHHATTISGARH HIGHER EDUCATION NAVIGATOR</p>
        <h1 id="hero-title">Discover Your Path. Plan Your Future.</h1>
        <p className="hero-copy">
          Mantrix combines assessment-led guidance with genuine, verified
          education discovery. Explore {colleges.length} institutions across
          Chhattisgarh, search by degree or specialization, and compare colleges
          side by side with rigorous data transparency.
        </p>
        <div className="hero-actions">
          <Link className="primary-action" href="/colleges">
            Course Discovery & College Search →
          </Link>
          <Link className="secondary-action" href="/colleges/compare">
            Institution Comparison
          </Link>
          <a className="secondary-action" href="#planned">
            Roadmap & Areas
          </a>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section
        className="features-overview-grid"
        aria-label="Feature highlights"
      >
        <div className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            🔎
          </span>
          <h3>Intelligent Course Discovery</h3>
          <p>
            Search by course name, degree type (B.Tech, MBBS, MBA, Law), branch
            or specialization (Computer Science, AI, Mechanical), and city.
            Distinguishes verified offerings from general programme summaries.
          </p>
          <Link href="/colleges" className="feature-link">
            Start discovering courses →
          </Link>
        </div>

        <div className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            ⚖️
          </span>
          <h3>Fair Institution Comparison</h3>
          <p>
            Select 2 to 4 institutions and inspect side-by-side matrices.
            Compares placements from the same reporting year, guards against
            outlier highest packages, and never declares false winners on
            incomplete data.
          </p>
          <Link href="/colleges/compare" className="feature-link">
            Compare institutions →
          </Link>
        </div>

        <div className="feature-card">
          <span className="feature-icon" aria-hidden="true">
            🛡️
          </span>
          <h3>Honest Data Accounting</h3>
          <p>
            Zero fabrication. Missing fee schedules, unverified branches, or
            undisclosed placement figures are explicitly labeled as &ldquo;Needs
            verification&rdquo; instead of being defaulted to zero.
          </p>
          <Link href="/colleges/CG001" className="feature-link">
            View sample profile (IIT Bhilai) →
          </Link>
        </div>
      </section>

      <section
        className="content-grid"
        id="about"
        aria-labelledby="about-title"
      >
        <div>
          <p className="eyebrow">Built for the journey ahead</p>
          <h2 id="about-title">A shared foundation for web and mobile.</h2>
        </div>
        <p>
          Mantrix connects high school and college students with accurate
          institutional data and guided self-discovery. Our dataset reflects 70
          verified higher education institutions across Chhattisgarh with strict
          data quality accounting.
        </p>
      </section>

      <section
        className="planned-section"
        id="planned"
        aria-labelledby="planned-title"
      >
        <p className="eyebrow">Platform Capabilities</p>
        <h2 id="planned-title">Education Discovery is Live.</h2>
        <ul className="planned-list">
          {plannedAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <span>Mantrix Education Navigator · Chhattisgarh Directory</span>
        <span>70 Institutions Indexed · Academic Years 2025–2026</span>
      </footer>
    </main>
  );
}
