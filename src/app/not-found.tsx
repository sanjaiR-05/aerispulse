import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

/**
 * Custom accessible 404 Not Found page for invalid routes.
 */
export default function NotFound(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
          <ShieldAlert className="w-6 h-6" aria-hidden="true" />
        </div>
        <div>
          <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest">
            404 Error
          </span>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            Telemetry Vector Not Found
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            The requested atmospheric corridor or resource does not exist in the active monitoring matrix.
          </p>
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Return to Central Dashboard</span>
        </Link>
      </div>
    </div>
  );
}
