// ─── Mobile Sport / Level / Demo Mode Bar ───────────────────────────
// Compact sticky strip shown only on mobile (< lg breakpoint).
// Provides the same controls as the Sidebar sport selectors so users
// on phones and tablets can switch sport, level, and demo mode without
// opening the hamburger sidebar drawer.

'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';
import { useSport } from './SportContext';

export default function MobileSportBar() {
  const {
    sport, setSport, sportList,
    level, setLevel, levelList,
    demoMode, toggleDemoMode,
    sportPack, levelPack,
  } = useSport();

  const [expanded, setExpanded] = useState(false);

  return (
    <div className="lg:hidden border-b border-white/[0.06] bg-navy/90 backdrop-blur-md sticky top-16 z-20">
      {/* Collapsed row — always visible */}
      <div className="flex items-center gap-2 px-3 h-11 overflow-x-auto scrollbar-hide">
        {/* Sport pills */}
        <div className="flex items-center gap-1 shrink-0">
          {sportList.map((s) => (
            <button
              key={s.key}
              onClick={() => setSport(s.key)}
              title={s.label}
              className={cn(
                'w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-all shrink-0',
                sport === s.key
                  ? 'bg-electric/[0.15] ring-1 ring-electric/30'
                  : 'bg-white/[0.03] opacity-50 hover:opacity-90 active:scale-95'
              )}
            >
              {s.icon}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 shrink-0" />

        {/* Level chip */}
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value)}
          title="Select evaluation level"
          className="bg-white/[0.04] border border-white/[0.08] rounded-lg text-[11px] text-gray-300 pl-2 pr-6 py-1.5 focus:outline-none focus:ring-1 focus:ring-electric/30 shrink-0 appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center' }}
        >
          {levelList.map((l) => (
            <option key={l.key} value={l.key} className="bg-navy text-gray-300">{l.label}</option>
          ))}
        </select>

        {/* Divider */}
        <div className="w-px h-5 bg-white/10 shrink-0" />

        {/* Demo toggle */}
        <button
          onClick={toggleDemoMode}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-all shrink-0 whitespace-nowrap',
            demoMode
              ? 'bg-electric/[0.15] text-electric border border-electric/20'
              : 'bg-white/[0.03] text-gray-500 border border-white/[0.06] hover:text-gray-300'
          )}
        >
          <div className={cn(
            'w-6 h-3.5 rounded-full relative transition-colors',
            demoMode ? 'bg-electric/30' : 'bg-white/10'
          )}>
            <div className={cn(
              'absolute top-[2px] w-2.5 h-2.5 rounded-full transition-all',
              demoMode ? 'left-[12px] bg-electric' : 'left-[2px] bg-gray-500'
            )} />
          </div>
          Demo
          {demoMode && <span className="text-[9px] bg-electric/20 text-electric px-1 py-px rounded-full font-bold ml-0.5">ON</span>}
        </button>

        {/* Expand/info button */}
        <button
          onClick={() => setExpanded((v) => !v)}
          className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 transition-all shrink-0"
          title="Show details"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            className={cn('transition-transform', expanded && 'rotate-180')}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Expanded detail ribbon */}
      {expanded && (
        <div className="px-3 pb-3 pt-1 border-t border-white/[0.04] animate-fade-in">
          <div className="flex items-center gap-2 flex-wrap text-[10px]">
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-electric/10 text-electric border border-electric/20 font-medium">
              {sportPack.icon} {sportPack.label}
            </span>
            <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 font-medium">
              {levelPack.label}
            </span>
            {demoMode && (
              <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                Demo Mode Active
              </span>
            )}
            <span className="text-gray-600 ml-1">
              {sportPack.positions.flatMap((g) => g.positions).length} positions &middot; {sportPack.measurables.length} measurables
            </span>
          </div>
          <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
            {levelPack.evaluationPhilosophy}
          </p>
        </div>
      )}
    </div>
  );
}
