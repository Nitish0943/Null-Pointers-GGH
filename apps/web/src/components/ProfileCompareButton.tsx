'use client';

import { useComparison } from '../lib/useComparison';
import Link from 'next/link';

interface ProfileCompareButtonProps {
  collegeId: string;
  collegeName: string;
}

export function ProfileCompareButton({
  collegeId,
  collegeName,
}: ProfileCompareButtonProps) {
  const { isSelected, toggleCollege, canCompare, selectedIds } =
    useComparison();
  const selected = isSelected(collegeId);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexWrap: 'wrap',
      }}
    >
      <button
        type="button"
        onClick={() => toggleCollege(collegeId)}
        className={`btn-sm ${selected ? 'remove-compare-btn' : 'add-compare-btn'}`}
        aria-label={
          selected
            ? `Remove ${collegeName} from comparison`
            : `Add ${collegeName} to comparison`
        }
      >
        {selected ? '✓ Added to Comparison' : '+ Add to Comparison'}
      </button>

      {selected && canCompare && (
        <Link
          href={`/colleges/compare?ids=${selectedIds.join(',')}`}
          className="primary-action btn-sm"
        >
          Compare ({selectedIds.length}) →
        </Link>
      )}
    </div>
  );
}
