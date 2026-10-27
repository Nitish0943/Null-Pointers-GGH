import { redirect } from 'next/navigation';

export default async function CompareRedirectPage({
  searchParams,
}: {
  searchParams: Promise<{ ids?: string }>;
}) {
  const { ids } = await searchParams;
  if (ids) {
    redirect(`/colleges/compare?ids=${ids}`);
  }
  redirect('/colleges/compare');
}
