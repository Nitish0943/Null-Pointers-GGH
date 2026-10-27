'use client';

import Link from 'next/link';
import { useComparison } from '../lib/useComparison';
import type { CollegeRecord } from '@mantrix/types';

interface FloatingCompareBarProps {
  allColleges: CollegeRecord[];
}

export function FloatingCompareBar({ allColleges }: FloatingCompareBarProps) {
  const { selectedIds, removeCollege, clearAll, count, canCompare } =
    useComparison();

  if (count === 0) return null;

  const selectedColleges = selectedIds
    .map((id) => allColleges.find((c) => c.id === id))
    .filter((c): c is CollegeRecord => Boolean(c));

  return (
    <div
      className="floating-bar"
      role="region"
      aria-label="Selected institutions for comparison"
    >
      <div className="floating-inner">
        <div className="floating-info">
          <span className="floating-title">
            Comparing {count} of 4 institutions
          </span>
          <div className="floating-chips">
            {selectedColleges.map((c) => (
              <span key={c.id} className="floating-chip">
                {c.college_name.length > 25
                  ? `${c.college_name.slice(0, 22)}...`
                  : c.college_name}
                <button
                  type="button"
                  onClick={() => removeCollege(c.id)}
                  aria-label={`Remove ${c.college_name}`}
                  className="chip-remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
        <div className="floating-actions">
          <button
            type="button"
            onClick={clearAll}
            className="secondary-action btn-sm"
          >
            Clear All
          </button>
          {canCompare ? (
            <Link
              href={`/colleges/compare?ids=${selectedIds.join(',')}`}
              className="primary-action btn-sm"
            >
              Compare Now ({count}) →
            </Link>
          ) : (
            <span
              className="disabled-action btn-sm"
              title="Select at least 2 institutions"
            >
              Select 2 to Compare
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
