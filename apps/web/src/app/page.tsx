export default function HomePage() {
  const plannedAreas = [
    'Assessment and career guidance',
    'Courses and colleges',
    'Scholarships and education loans',
    'Mentors, jobs, and opportunities',
  ];

  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="/">
          Mantrix
        </a>
        <span className="status-pill">Development foundation</span>
      </nav>

      <section className="hero" aria-labelledby="hero-title">
        <p className="eyebrow">Education and career guidance</p>
        <h1 id="hero-title">Discover Your Path. Plan Your Future.</h1>
        <p className="hero-copy">
          Mantrix will bring assessment-led guidance, trusted education
          discovery, and career planning together in one place.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="#planned">
            Explore the foundation
          </a>
          <a className="secondary-action" href="#about">
            Learn about the platform
          </a>
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
          This local development foundation connects a future Next.js web app
          and Expo mobile app to shared TypeScript packages and a planned
          Firebase backend. Feature work will be added in vertical slices.
        </p>
      </section>

      <section
        className="planned-section"
        id="planned"
        aria-labelledby="planned-title"
      >
        <p className="eyebrow">Planned areas</p>
        <h2 id="planned-title">A clear place to start building.</h2>
        <ul className="planned-list">
          {plannedAreas.map((area) => (
            <li key={area}>{area}</li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <span>Mantrix foundation</span>
        <span>Product features are not implemented yet.</span>
      </footer>
    </main>
  );
}
