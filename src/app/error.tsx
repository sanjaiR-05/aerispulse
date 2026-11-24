'use client';

import React, { useEffect } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Next.js App Router root client-side Error Boundary.
 * Catches unhandled runtime exceptions gracefully and provides a retry mechanism without crash.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  useEffect(() => {
    // Audit logging for runtime exceptions
    console.error('AerisPulse Runtime Exception caught by Error Boundary:', error);
  }, [error]);

  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100"
    >
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-6 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">
            Atmospheric Engine Interruption
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            An unexpected client-side error occurred while processing telemetry data.
          </p>
        </div>
        <button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Recover & Retry Session</span>
        </button>
      </div>
    </div>
  );
}
