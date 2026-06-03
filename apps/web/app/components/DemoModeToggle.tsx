// ─── ScoutVision Demo Mode Toggle ───────────────────────────────────
// Global switch for demo/live mode so buyers can validate UX without a backend.

'use client';

import { useSport } from './SportContext';

export default function DemoModeToggle() {
  const { demoMode, setDemoMode } = useSport();

  return (
    <label className="inline-flex items-center gap-2.5 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-1.5 cursor-pointer select-none" title="Toggle between demo data and live API mode">
      <span className="text-[11px] uppercase tracking-wide text-gray-400 font-semibold">Mode</span>
      <span className={`text-xs font-semibold ${demoMode ? 'text-electric' : 'text-emerald-400'}`}>
        {demoMode ? 'Demo' : 'Live'}
      </span>
      <span className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${demoMode ? 'bg-electric/70' : 'bg-emerald-500/70'}`}>
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${demoMode ? 'translate-x-4' : 'translate-x-0.5'}`}
        />
      </span>
      <input
        className="sr-only"
        type="checkbox"
        checked={demoMode}
        onChange={(e) => setDemoMode(e.target.checked)}
        aria-label="Toggle Demo Mode"
      />
    </label>
  );
}
