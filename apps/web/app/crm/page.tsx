'use client';

import { useState } from 'react';
import { STAGES } from '../lib/mock-data';
import { useProspects } from '../components/ProspectContext';
import { cn, getInitials, formatDate } from '../lib/utils';
import type { Prospect, RecruitingStage } from '../lib/types';
import Link from 'next/link';

type ViewMode = 'board' | 'table';

// ─── Skeleton ───────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="card-hover p-3 space-y-2 animate-pulse">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-white/5" />
        <div className="space-y-1 flex-1">
          <div className="h-3 bg-white/5 rounded w-24" />
          <div className="h-2 bg-white/5 rounded w-16" />
        </div>
      </div>
      <div className="h-2 bg-white/5 rounded w-full" />
      <div className="h-1 bg-white/5 rounded w-full" />
    </div>
  );
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
      {[1,2,3,4,5].map((i) => (
        <div key={i} className="kanban-column flex-shrink-0 animate-pulse">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="h-3 bg-white/10 rounded w-20" />
          </div>
          <div className="p-2 space-y-2">
            {[1,2].map((j) => <SkeletonCard key={j} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function CRMPage() {
  const { prospects: PROSPECTS, loading, openAddModal } = useProspects();
  const [view, setView] = useState<ViewMode>('board');
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('all');
  const [stageFilter, setStageFilter] = useState('all');

  const positions = Array.from(new Set(PROSPECTS.map((p) => p.position).filter(Boolean))) as string[];

  const filtered = PROSPECTS.filter((p) => {
    const matchesSearch =
      search === '' ||
      `${p.firstName} ${p.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      p.position?.toLowerCase().includes(search.toLowerCase()) ||
      p.highSchool?.toLowerCase().includes(search.toLowerCase());
    const matchesPosition = positionFilter === 'all' || p.position === positionFilter;
    const matchesStage = stageFilter === 'all' || p.stageId === stageFilter;
    return matchesSearch && matchesPosition && matchesStage;
  });

  const hasActiveFilters = search !== '' || positionFilter !== 'all' || stageFilter !== 'all';

  function clearFilters() {
    setSearch('');
    setPositionFilter('all');
    setStageFilter('all');
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Recruiting CRM</h1>
          <p className="text-sm text-gray-500 mt-1">
            {loading ? 'Loading prospects...' : `${PROSPECTS.length} prospects in pipeline`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export CSV
            </span>
          </button>
          <button className="btn-primary text-sm" onClick={openAddModal}>+ Add Prospect</button>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="card px-4 py-3 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search prospects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10 py-2 text-sm"
          />
        </div>

        {/* Position Filter */}
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          className="input w-auto py-2 text-sm bg-navy/50"
        >
          <option value="all">All Positions</option>
          {positions.map((pos) => (
            <option key={pos} value={pos}>{pos}</option>
          ))}
        </select>

        {/* Stage Filter */}
        <select
          value={stageFilter}
          onChange={(e) => setStageFilter(e.target.value)}
          className="input w-auto py-2 text-sm bg-navy/50"
        >
          <option value="all">All Stages</option>
          {STAGES.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        {/* View Toggle */}
        <div className="flex items-center bg-navy/50 rounded-xl border border-white/10 p-0.5 ml-auto">
          <button
            onClick={() => setView('board')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              view === 'board' ? 'bg-electric/10 text-electric' : 'text-gray-400 hover:text-white'
            )}
          >
            Board
          </button>
          <button
            onClick={() => setView('table')}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
              view === 'table' ? 'bg-electric/10 text-electric' : 'text-gray-400 hover:text-white'
            )}
          >
            Table
          </button>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <KanbanSkeleton />
      ) : PROSPECTS.length === 0 ? (
        /* Empty pipeline */
        <div className="card p-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-electric/10 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-electric">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <h3 className="text-lg font-semibold mb-2">No prospects yet</h3>
          <p className="text-sm text-gray-500 mb-6 max-w-sm">Add your first recruit to start building your pipeline. You can import from Hudl or add manually.</p>
          <button onClick={openAddModal} className="btn-primary text-sm">+ Add First Prospect</button>
        </div>
      ) : filtered.length === 0 ? (
        /* No results after filtering */
        <div className="card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
          </div>
          <h3 className="text-base font-semibold mb-1">No prospects match your filters</h3>
          <p className="text-sm text-gray-500 mb-4">Try adjusting your search or clearing the filters.</p>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="btn-secondary text-sm">Clear Filters</button>
          )}
        </div>
      ) : view === 'board' ? (
        <KanbanBoard prospects={filtered} stages={STAGES} />
      ) : (
        <ProspectTable prospects={filtered} />
      )}
    </div>
  );
}

// ─── Kanban Board ───────────────────────────────────────────────────

function KanbanBoard({ prospects, stages }: { prospects: Prospect[]; stages: RecruitingStage[] }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 -mx-2 px-2">
      {stages.map((stage) => {
        const stageProspects = prospects.filter((p) => p.stageId === stage.id);
        return (
          <div key={stage.id} className="kanban-column flex-shrink-0">
            {/* Column Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                <span className="text-sm font-semibold">{stage.name}</span>
              </div>
              <span className="text-xs text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">
                {stageProspects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="p-2 space-y-2 flex-1 overflow-y-auto max-h-[calc(100vh-320px)]">
              {stageProspects.length === 0 ? (
                <div className="text-center py-8 text-sm text-gray-600">
                  No prospects
                </div>
              ) : (
                stageProspects.map((prospect) => (
                  <KanbanCard key={prospect.id} prospect={prospect} stageColor={stage.color} />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function KanbanCard({ prospect, stageColor }: { prospect: Prospect; stageColor: string }) {
  const fullName = `${prospect.firstName} ${prospect.lastName}`;
  const scoreColor = (prospect.commitmentScore ?? 0) >= 75
    ? 'text-emerald-400' : (prospect.commitmentScore ?? 0) >= 50
    ? 'text-amber-400' : 'text-gray-400';

  return (
    <Link href={`/crm/${prospect.id}`}>
      <div className="card-hover p-3 space-y-2 cursor-pointer group">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-electric">
              {getInitials(fullName)}
            </div>
            <div>
              <p className="text-sm font-semibold group-hover:text-electric transition-colors">{fullName}</p>
              <p className="text-[11px] text-gray-500">{prospect.position} · {prospect.classYear}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-500">
          <span>{prospect.highSchool}</span>
          <span>·</span>
          <span>{prospect.city}, {prospect.state}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {prospect.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="badge-gray text-[9px]">{tag}</span>
            ))}
          </div>
          {prospect.commitmentScore !== null && (
            <span className={cn('text-xs font-bold', scoreColor)}>
              {prospect.commitmentScore}%
            </span>
          )}
        </div>

        {/* Score bar */}
        {prospect.commitmentScore !== null && (
          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${prospect.commitmentScore}%`,
                backgroundColor: stageColor,
              }}
            />
          </div>
        )}
      </div>
    </Link>
  );
}

// ─── Prospect Table ─────────────────────────────────────────────────

function ProspectTable({ prospects }: { prospects: Prospect[] }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/5">
              <th className="table-header">Name</th>
              <th className="table-header">Position</th>
              <th className="table-header">School</th>
              <th className="table-header">Location</th>
              <th className="table-header">Class</th>
              <th className="table-header">GPA</th>
              <th className="table-header">40-Yd</th>
              <th className="table-header">Stage</th>
              <th className="table-header text-right">Score</th>
            </tr>
          </thead>
          <tbody>
            {prospects.map((p) => {
              const scoreColor = (p.commitmentScore ?? 0) >= 75
                ? 'text-emerald-400' : (p.commitmentScore ?? 0) >= 50
                ? 'text-amber-400' : 'text-gray-400';
              return (
                <tr key={p.id} className="table-row">
                  <td className="table-cell">
                    <Link href={`/crm/${p.id}`} className="flex items-center gap-3 hover:text-electric transition-colors">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-electric/20 to-emerald-500/20 flex items-center justify-center text-[10px] font-bold text-electric shrink-0">
                        {getInitials(`${p.firstName} ${p.lastName}`)}
                      </div>
                      <span className="font-medium">{p.firstName} {p.lastName}</span>
                    </Link>
                  </td>
                  <td className="table-cell">
                    <span className="badge-gray text-[10px]">{p.position}</span>
                  </td>
                  <td className="table-cell text-gray-400">{p.highSchool || '—'}</td>
                  <td className="table-cell text-gray-400">{p.city}, {p.state}</td>
                  <td className="table-cell text-gray-400">{p.classYear}</td>
                  <td className="table-cell text-gray-400">{p.academics?.gpa?.toFixed(2) || '—'}</td>
                  <td className="table-cell text-gray-400">{p.stats?.fortyYard || '—'}</td>
                  <td className="table-cell">
                    <span
                      className="badge text-[10px]"
                      style={{
                        backgroundColor: `${p.stage?.color}15`,
                        color: p.stage?.color,
                      }}
                    >
                      {p.stage?.name || '—'}
                    </span>
                  </td>
                  <td className="table-cell text-right">
                    <span className={cn('font-bold', scoreColor)}>
                      {p.commitmentScore ?? '—'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
