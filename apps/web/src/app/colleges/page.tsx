import Link from 'next/link';

import directory from '../../../../../data/chhattisgarh_50_colleges_enrollment_template.json';

export default function CollegesPage() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <Link className="brand" href="/">
          Mantrix
        </Link>
        <span className="status-pill">College directory</span>
      </nav>

      <section className="hero" aria-labelledby="colleges-title">
        <p className="eyebrow">Chhattisgarh · 2025–2026</p>
        <h1 id="colleges-title">College directory</h1>
        <p className="hero-copy">
          Explore {directory.records.length} starter records by location,
          institution type, and course category.
        </p>
        <Link className="secondary-action" href="/">
          Back to home
        </Link>
      </section>

      <section className="planned-section" aria-labelledby="directory-title">
        <p className="eyebrow">All colleges</p>
        <h2 id="directory-title">{directory.records.length} institutions</h2>
        <div className="college-directory">
          {directory.records.map((college) => (
            <article
              className="college-directory-card"
              key={college.college_id}
            >
              <p className="college-directory-id">{college.college_id}</p>
              <h3>{college.college_name}</h3>
              <p>
                {college.district_or_location} · {college.college_type}
              </p>
              <p>
                {college.management_type} · {college.university_affiliation}
              </p>
              <p className="college-directory-courses">
                {college.course_categories.join(', ')}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
