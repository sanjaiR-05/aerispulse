import React from 'react';

/**
 * Animated streaming loading skeleton for Next.js App Router Suspense transitions.
 */
export default function Loading(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 max-w-7xl mx-auto space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 bg-slate-200 dark:bg-slate-800 rounded-xl" />

      {/* Preset Buttons Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>

      {/* Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>

      {/* Chemical Matrix Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-20 bg-slate-200 dark:bg-slate-800 rounded-xl" />
        ))}
      </div>

      {/* Simulator Skeleton */}
      <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}
