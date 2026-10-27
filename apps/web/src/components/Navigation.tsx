'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useComparison } from '../lib/useComparison';

export function Navigation() {
  const pathname = usePathname();
  const { count } = useComparison();

  return (
    <nav className="topbar" aria-label="Primary navigation">
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <Link className="brand" href="/">
          Mantrix
        </Link>
        <div className="nav-links">
          <Link
            className={`nav-link ${pathname === '/colleges' ? 'active' : ''}`}
            href="/colleges"
          >
            Course Discovery
          </Link>
          <Link
            className={`nav-link ${pathname === '/colleges/compare' ? 'active' : ''}`}
            href="/colleges/compare"
          >
            Compare Institutions
            {count > 0 && <span className="nav-counter">{count}</span>}
          </Link>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span className="status-pill">Chhattisgarh 2025–2026</span>
      </div>
    </nav>
  );
}
