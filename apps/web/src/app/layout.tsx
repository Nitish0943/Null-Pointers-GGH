import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mantrix',
  description: 'Discover Your Path. Plan Your Future.',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
