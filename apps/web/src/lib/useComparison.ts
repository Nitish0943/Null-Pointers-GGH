'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'mantrix_compare_colleges';

export function useComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSelectedIds(parsed.slice(0, 4));
        }
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  function saveIds(ids: string[]) {
    setSelectedIds(ids);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      // Ignore localStorage errors
    }
  }

  function toggleCollege(id: string) {
    if (selectedIds.includes(id)) {
      saveIds(selectedIds.filter((item) => item !== id));
      return;
    }
    if (selectedIds.length >= 4) {
      alert(
        'You can compare a maximum of 4 institutions at once. Remove one to add another.',
      );
      return;
    }
    saveIds([...selectedIds, id]);
  }

  function addCollege(id: string) {
    if (!selectedIds.includes(id) && selectedIds.length < 4) {
      saveIds([...selectedIds, id]);
    }
  }

  function removeCollege(id: string) {
    saveIds(selectedIds.filter((item) => item !== id));
  }

  function clearAll() {
    saveIds([]);
  }

  return {
    selectedIds,
    isLoaded,
    isSelected: (id: string) => selectedIds.includes(id),
    toggleCollege,
    addCollege,
    removeCollege,
    clearAll,
    count: selectedIds.length,
    canCompare: selectedIds.length >= 2,
  };
}
