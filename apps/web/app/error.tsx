'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Page Error</h2>
        <p className="text-gray-400 text-sm mb-6">
          This page encountered an error. You can try reloading or go back to the dashboard.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="px-4 py-2 rounded-xl bg-electric text-navy text-sm font-semibold hover:bg-electric/90 transition-colors"
          >
            Reload Page
          </button>
          <a
            href="/"
            className="px-4 py-2 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
          >
            Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
