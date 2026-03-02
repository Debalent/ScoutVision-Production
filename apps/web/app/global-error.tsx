'use client';

import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log to error reporting service
    console.error('Global error:', error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-navy text-white min-h-screen antialiased flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-400 text-sm mb-6">
            An unexpected error occurred. Our team has been notified and is working on a fix.
          </p>
          {error.digest && (
            <p className="text-xs text-gray-600 mb-4 font-mono">Error ID: {error.digest}</p>
          )}
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => reset()}
              className="px-4 py-2 rounded-xl bg-electric text-navy text-sm font-semibold hover:bg-electric/90 transition-colors"
            >
              Try Again
            </button>
            <a
              href="/"
              className="px-4 py-2 rounded-xl border border-white/10 text-sm font-medium text-gray-300 hover:bg-white/5 transition-colors"
            >
              Go to Dashboard
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
