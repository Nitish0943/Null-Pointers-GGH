import { redirect } from 'next/navigation';

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const queryString = new URLSearchParams(
    Object.entries(params).flatMap(([k, v]) =>
      Array.isArray(v)
        ? v.map((val) => [k, val])
        : v !== undefined
          ? [[k, v]]
          : [],
    ),
  ).toString();

  if (queryString) {
    redirect(`/colleges?${queryString}`);
  }
  redirect('/colleges');
}
