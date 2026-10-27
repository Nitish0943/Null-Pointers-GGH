import React, { createContext, useCallback, useContext, useState } from 'react';
import type { CourseRecord } from '../../../shared/types/course';

export type ComparisonContextValue = {
  basket: CourseRecord[];           // max 4 items
  add: (course: CourseRecord) => void;
  remove: (courseId: string) => void;
  clear: () => void;
};

const ComparisonContext = createContext<ComparisonContextValue | null>(null);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [basket, setBasket] = useState<CourseRecord[]>([]);

  const add = useCallback((course: CourseRecord) => {
    setBasket((prev) => {
      if (prev.length >= 4) return prev;           // basket full — no-op
      if (prev.some((c) => c.id === course.id)) return prev;  // duplicate — no-op
      return [...prev, course];
    });
  }, []);

  const remove = useCallback((courseId: string) => {
    setBasket((prev) => prev.filter((c) => c.id !== courseId));
  }, []);

  const clear = useCallback(() => setBasket([]), []);

  return (
    <ComparisonContext.Provider value={{ basket, add, remove, clear }}>
      {children}
    </ComparisonContext.Provider>
  );
}

export function useComparison(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext);
  if (!ctx) throw new Error('useComparison must be used inside ComparisonProvider');
  return ctx;
}
