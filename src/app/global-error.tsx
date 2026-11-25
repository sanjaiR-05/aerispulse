'use client';

import React from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';

/**
 * Next.js App Router Global Error Boundary.
 * Catches errors in the root layout or root HTML structure.
 */
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <html lang="en">
      <body className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-100 font-sans">
        <div className="max-w-md w-full bg-slate-900 p-6 rounded-2xl border border-rose-900 shadow-2xl text-center space-y-4">
          <div className="w-12 h-12 mx-auto rounded-xl bg-rose-950 text-rose-400 flex items-center justify-center">
            <AlertOctagon className="w-6 h-6" aria-hidden="true" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">System Critical Error</h1>
            <p className="text-xs text-slate-400 mt-1">
              A root layout failure occurred. Core atmospheric services are restarting.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md transition"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reload Application</span>
          </button>
        </div>
      </body>
    </html>
  );
}
