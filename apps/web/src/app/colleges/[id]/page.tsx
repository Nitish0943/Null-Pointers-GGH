import { notFound } from 'next/navigation';
import { Navigation } from '../../../components/Navigation';
import { InstitutionProfileClient } from '../../../components/InstitutionProfileClient';
import { getCollegeById, getAllColleges } from '../../../lib/college-service';

export async function generateStaticParams() {
  const colleges = getAllColleges();
  return colleges.map((college) => ({
    id: college.id,
  }));
}

export default async function CollegeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const college = getCollegeById(id);

  if (!college) {
    notFound();
  }

  return (
    <main className="site-shell">
      <Navigation />
      <InstitutionProfileClient college={college} />
      <footer className="footer">
        <span>Mantrix Higher Education Navigator · Institution Profile</span>
        <span>
          Information compiled from official state university directories and
          statutory disclosures. Always confirm direct details prior to formal
          admission.
        </span>
      </footer>
    </main>
  );
}
