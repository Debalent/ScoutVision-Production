'use client';

import { useState } from 'react';
import { PROSPECTS } from '../lib/mock-data';
import { cn, getInitials } from '../lib/utils';
import type { Prospect } from '../lib/types';
import { useSport } from '../components/SportContext';

type CompareMetric = {
  label: string;
  getValue: (p: Prospect) => string | number | null;
  format?: 'number' | 'text' | 'percent';
  higherBetter?: boolean;
};

const ATHLETIC_METRICS: CompareMetric[] = [
  { label: '40-Yard Dash', getValue: (p) => p.stats?.fortyYard ?? null, higherBetter: false },
  { label: 'Shuttle', getValue: (p) => p.stats?.shuttle ?? null, higherBetter: false },
  { label: 'Vertical', getValue: (p) => p.stats?.vertical ?? null, higherBetter: true },
  { label: 'Bench Press', getValue: (p) => p.stats?.bench ?? null, higherBetter: true },
  { label: 'Squat', getValue: (p) => p.stats?.squat ?? null, higherBetter: true },
  { label: 'Broad Jump', getValue: (p) => p.stats?.broad ?? null, higherBetter: true },
];

const ACADEMIC_METRICS: CompareMetric[] = [
  { label: 'GPA', getValue: (p) => p.academics?.gpa ?? null, higherBetter: true },
  { label: 'SAT Score', getValue: (p) => p.academics?.satScore ?? null, higherBetter: true },
  { label: 'ACT Score', getValue: (p) => p.academics?.actScore ?? null, higherBetter: true },
  { label: 'Core GPA', getValue: (p) => p.academics?.coreGpa ?? null, higherBetter: true },
  { label: 'NCAA Eligible', getValue: (p) => p.academics?.ncaaEligible === true ? 'Yes' : p.academics?.ncaaEligible === false ? 'No' : 'Pending', format: 'text' },
];

const RECRUITING_METRICS: CompareMetric[] = [
  { label: 'Commitment Score', getValue: (p) => p.commitmentScore, higherBetter: true },
  { label: 'Stage', getValue: (p) => p.stage?.name ?? '—', format: 'text' },
  { label: 'Class Year', getValue: (p) => p.classYear, format: 'text' },
  { label: 'Status', getValue: (p) => p.status, format: 'text' },
];

// ─── Radar Chart ────────────────────────────────────────────────────

const RADAR_AXES = [
  { label: 'Speed', key: 'speed' },
  { label: 'Strength', key: 'bench' },
  { label: 'Power', key: 'squat' },
  { label: 'Explosion', key: 'vertical' },
  { label: 'Agility', key: 'agility' },
  { label: 'Academics', key: 'gpa' },
];

function getRadarScore(p: Prospect, key: string): number {
  switch (key) {
    case 'speed': { const v = p.stats?.fortyYard; return v ? Math.max(0, Math.min(100, (6.0 - v) / (6.0 - 4.2) * 100)) : 0; }
    case 'bench': { const v = p.stats?.bench; return v ? Math.min(100, (v / 40) * 100) : 0; }
    case 'squat': { const v = p.stats?.squat; return v ? Math.min(100, (v / 600) * 100) : 0; }
    case 'vertical': { const v = p.stats?.vertical; return v ? Math.min(100, (v / 48) * 100) : 0; }
    case 'agility': { const v = p.stats?.shuttle; return v ? Math.max(0, Math.min(100, (5.5 - v) / (5.5 - 3.8) * 100)) : 0; }
    case 'gpa': { const v = p.academics?.gpa; return v ? Math.min(100, (v / 4.0) * 100) : 0; }
    default: return 0;
  }
}

function RadarChart({ prospects }: { prospects: Prospect[] }) {
  const SIZE = 260;
  const cx = SIZE / 2;
  const cy = SIZE / 2;
  const R = 100;
  const n = RADAR_AXES.length;
  const COLORS = ['#00D4AA', '#a78bfa', '#fbbf24', '#34d399'];
  const STROKES = ['#00D4AA', '#a78bfa', '#fbbf24', '#34d399'];

  function point(angle: number, r: number) {
    const a = angle - Math.PI / 2;
    return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
  }

  const axisAngles = RADAR_AXES.map((_, i) => (2 * Math.PI * i) / n);

  function polygon(scores: number[], alpha: number, fill: string, stroke: string) {
    const pts = axisAngles.map((a, i) => {
      const r = (scores[i] / 100) * R;
      const { x, y } = point(a, r);
      return `${x},${y}`;
    }).join(' ');
    return (
      <polygon
        key={fill + alpha}
        points={pts}
        fill={fill}
        fillOpacity={alpha}
        stroke={stroke}
        strokeWidth={1.5}
        strokeOpacity={0.8}
      />
    );
  }

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center gap-4">
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} className="overflow-visible">
        {/* Grid rings */}
        {gridLevels.map((level) =>
          axisAngles.map((a, i) => {
            const next = axisAngles[(i + 1) % n];
            const p1 = point(a, (level / 100) * R);
            const p2 = point(next, (level / 100) * R);
            return <line key={`${level}-${i}`} x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="rgba(255,255,255,0.07)" strokeWidth={1} />;
          })
        )}
        {/* Axis lines */}
        {axisAngles.map((a, i) => {
          const { x, y } = point(a, R);
          return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="rgba(255,255,255,0.1)" strokeWidth={1} />;
        })}
        {/* Prospect polygons */}
        {prospects.map((p, pi) => {
          const scores = RADAR_AXES.map(({ key }) => getRadarScore(p, key));
          return polygon(scores, 0.15, COLORS[pi], STROKES[pi]);
        })}
        {/* Axis labels */}
        {axisAngles.map((a, i) => {
          const LABEL_R = R + 20;
          const { x, y } = point(a, LABEL_R);
          return (
            <text
              key={i}
              x={x}
              y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fontSize={9}
              fill="rgba(255,255,255,0.5)"
              fontFamily="sans-serif"
            >
              {RADAR_AXES[i].label}
            </text>
          );
        })}
      </svg>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4">
        {prospects.map((p, i) => (
          <div key={p.id} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: COLORS[i], opacity: 0.9 }} />
            <span className="text-xs text-gray-400">{p.firstName} {p.lastName}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ComparePage() {
  const [selectedIds, setSelectedIds] = useState<string[]>(['pr1', 'pr3']);
  const [showSelector, setShowSelector] = useState(false);
  const [selectorSlot, setSelectorSlot] = useState<number>(0);
  const [activeSection, setActiveSection] = useState<'athletic' | 'academic' | 'recruiting'>('athletic');
  const { sportPack } = useSport();

  const selectedProspects = selectedIds
    .map((id) => PROSPECTS.find((p) => p.id === id))
    .filter(Boolean) as Prospect[];

  function handleSelectProspect(prospect: Prospect) {
    const newIds = [...selectedIds];
    newIds[selectorSlot] = prospect.id;
    setSelectedIds(newIds);
    setShowSelector(false);
  }

  function addSlot() {
    if (selectedIds.length < 4) {
      const available = PROSPECTS.find((p) => !selectedIds.includes(p.id));
      if (available) setSelectedIds([...selectedIds, available.id]);
    }
  }

  function removeSlot(idx: number) {
    if (selectedIds.length > 2) {
      setSelectedIds(selectedIds.filter((_, i) => i !== idx));
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Prospect Comparison</h1>
          <p className="text-sm text-gray-500 mt-1">Side-by-side evaluation of {selectedProspects.length} prospects</p>
        </div>
        <div className="flex items-center gap-3">
          {selectedIds.length < 4 && (
            <button onClick={addSlot} className="btn-secondary text-sm">+ Add Prospect</button>
          )}
          <button className="btn-secondary text-sm">Export PDF</button>
        </div>
      </div>

      {/* Prospect Headers */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <div className="grid min-w-[600px]" style={{ gridTemplateColumns: `160px repeat(${selectedProspects.length}, minmax(180px, 1fr))` }}>
            {/* Empty corner */}
            <div className="p-4 border-b border-r border-white/5 bg-white/[0.02]" />
            {/* Prospect cards */}
            {selectedProspects.map((prospect, idx) => (
              <div key={prospect.id} className="p-5 border-b border-r border-white/5 last:border-r-0 text-center relative group">
                {selectedIds.length > 2 && (
                  <button
                    onClick={() => removeSlot(idx)}
                    title="Remove prospect"
                    className="absolute top-2 right-2 p-1 rounded-lg bg-white/5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
                  </button>
                )}
                <button
                  onClick={() => { setSelectorSlot(idx); setShowSelector(true); }}
                  className="inline-block hover:scale-105 transition-transform"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-lg font-bold text-electric mx-auto mb-3">
                    {getInitials(`${prospect.firstName} ${prospect.lastName}`)}
                  </div>
                </button>
                <h3 className="text-sm sm:text-base font-bold">{prospect.firstName} {prospect.lastName}</h3>
                <p className="text-xs sm:text-sm text-electric font-medium">{prospect.position}</p>
                <p className="text-xs text-gray-500 mt-1">{prospect.highSchool}</p>
                <p className="text-xs text-gray-500">{prospect.city}, {prospect.state}</p>
                <div className="flex items-center justify-center gap-2 mt-3">
                  <span className="text-xs text-gray-500">{prospect.height} / {prospect.weight} lbs</span>
                </div>
                {prospect.commitmentScore !== null && (
                  <div className="mt-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/5">
                      <span className="text-xs text-gray-400">Score</span>
                      <span className={cn(
                        'text-sm font-bold',
                        prospect.commitmentScore >= 75 ? 'text-emerald-400' :
                        prospect.commitmentScore >= 50 ? 'text-amber-400' : 'text-red-400'
                      )}>
                        {prospect.commitmentScore}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-1 p-2 border-b border-white/5 bg-white/[0.02] overflow-x-auto">
          {(['athletic', 'academic', 'recruiting'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all whitespace-nowrap',
                activeSection === section ? 'bg-electric/10 text-electric' : 'text-gray-400 hover:text-white'
              )}
            >
              {section === 'athletic' ? `${sportPack.icon} Athletic` : section}
            </button>
          ))}
        </div>

        {/* Metrics Comparison */}
        <div className="overflow-x-auto">
          <ComparisonTable
            prospects={selectedProspects}
            metrics={
              activeSection === 'athletic' ? ATHLETIC_METRICS :
              activeSection === 'academic' ? ACADEMIC_METRICS :
              RECRUITING_METRICS
            }
          />
        </div>
      </div>

      {/* Radar Chart + Evaluation Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="section-title mb-4">Athletic Profile Radar</h3>
          <RadarChart prospects={selectedProspects} />
        </div>

        <div className="card p-6">
          <h3 className="section-title mb-4">Evaluation Summary</h3>
          <div className="space-y-4">
            {selectedProspects.map((prospect, i) => {
              const colors = ['border-electric/20 bg-electric/5', 'border-purple-400/20 bg-purple-400/5', 'border-amber-400/20 bg-amber-400/5', 'border-emerald-400/20 bg-emerald-400/5'];
              const textColors = ['text-electric', 'text-purple-400', 'text-amber-400', 'text-emerald-400'];
              return (
                <div key={prospect.id} className={cn('rounded-xl border p-4', colors[i])}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-electric">
                        {getInitials(`${prospect.firstName} ${prospect.lastName}`)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{prospect.firstName} {prospect.lastName}</p>
                        <p className="text-[11px] text-gray-500">{prospect.position} - Class of {prospect.classYear}</p>
                      </div>
                    </div>
                    <span className={cn('text-lg font-bold', textColors[i])}>
                      {prospect.commitmentScore ?? '—'}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">{prospect.bio}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {prospect.tags.map((tag) => (
                      <span key={tag} className="badge-gray text-[9px]">{tag}</span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Prospect Selector Modal */}
      {showSelector && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center" onClick={() => setShowSelector(false)}>
          <div className="w-full max-w-md bg-charcoal border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="px-5 py-4 border-b border-white/5">
              <h3 className="text-base font-semibold">Select Prospect</h3>
              <p className="text-xs text-gray-500 mt-0.5">Choose a prospect to compare</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {PROSPECTS.map((prospect) => {
                const isSelected = selectedIds.includes(prospect.id);
                return (
                  <button
                    key={prospect.id}
                    onClick={() => !isSelected && handleSelectProspect(prospect)}
                    disabled={isSelected}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                      isSelected ? 'opacity-40 cursor-not-allowed' : 'hover:bg-white/5 cursor-pointer'
                    )}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-xs font-bold text-electric">
                      {getInitials(`${prospect.firstName} ${prospect.lastName}`)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold">{prospect.firstName} {prospect.lastName}</p>
                      <p className="text-xs text-gray-500">{prospect.position} - {prospect.highSchool} - {prospect.city}, {prospect.state}</p>
                    </div>
                    {isSelected && <span className="text-[10px] text-electric bg-electric/10 px-2 py-1 rounded">Selected</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Comparison Table ───────────────────────────────────────────────

function ComparisonTable({ prospects, metrics }: { prospects: Prospect[]; metrics: CompareMetric[] }) {
  return (
    <div className="min-w-[600px]">
      {metrics.map((metric, i) => {
        const values = prospects.map((p) => metric.getValue(p));
        const numericValues = values.filter((v) => typeof v === 'number') as number[];
        const best = metric.higherBetter !== undefined && numericValues.length > 1
          ? (metric.higherBetter ? Math.max(...numericValues) : Math.min(...numericValues))
          : null;

        return (
          <div
            key={metric.label}
            className={cn(
              'grid border-b border-white/5 last:border-b-0',
              i % 2 === 0 ? 'bg-transparent' : 'bg-white/[0.01]'
            )}
            style={{ gridTemplateColumns: `160px repeat(${prospects.length}, minmax(180px, 1fr))` }}
          >
            <div className="px-3 sm:px-4 py-3 flex items-center text-xs sm:text-sm text-gray-400 font-medium border-r border-white/5">
              {metric.label}
            </div>
            {prospects.map((prospect) => {
              const val = metric.getValue(prospect);
              const isBest = best !== null && val === best;
              return (
                <div key={prospect.id} className="px-3 sm:px-4 py-3 flex items-center justify-center border-r border-white/5 last:border-r-0">
                  <span className={cn(
                    'text-xs sm:text-sm font-medium',
                    isBest ? 'text-emerald-400 font-bold' : 'text-gray-300'
                  )}>
                    {val ?? '—'}
                    {isBest && (
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="inline-block ml-1 text-emerald-400">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
