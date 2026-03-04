'use client';

import StatCard from './components/StatCard';
import ActivityFeed from './components/ActivityFeed';
import ComplianceAlert from './components/ComplianceAlert';
import ProspectCard from './components/ProspectCard';
import { DASHBOARD_STATS, RECENT_ACTIVITY, COMPLIANCE_EVENTS, PROSPECTS, VISITS, STAGES } from './lib/mock-data';
import { formatDate, pct } from './lib/utils';

export default function DashboardPage() {
  const upcomingVisits = VISITS.filter((v) => v.status === 'scheduled').sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );
  const topProspects = PROSPECTS.filter((p) => p.commitmentScore !== null)
    .sort((a, b) => (b.commitmentScore ?? 0) - (a.commitmentScore ?? 0))
    .slice(0, 5);
  const alerts = COMPLIANCE_EVENTS.filter((e) => !e.resolved).slice(0, 4);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-3xl">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1.5">
            Welcome back, <span className="text-gray-300 font-medium">Coach Rivera</span> — here&apos;s what&apos;s happening today
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </span>
          </button>
          <button className="btn-primary text-sm">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
              Add Prospect
            </span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
        <StatCard
          label="Total Prospects"
          value={DASHBOARD_STATS.totalProspects}
          change="+12"
          trend="up"
          accent="electric"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }
        />
        <StatCard
          label="Committed"
          value={DASHBOARD_STATS.committed}
          change={pct(DASHBOARD_STATS.conversionRate)}
          trend="up"
          accent="emerald"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
          }
        />
        <StatCard
          label="Upcoming Visits"
          value={DASHBOARD_STATS.upcomingVisits}
          accent="purple"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          }
        />
        <StatCard
          label="Compliance Alerts"
          value={DASHBOARD_STATS.complianceAlerts}
          change="2 warnings"
          trend="neutral"
          accent="amber"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          }
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed — spans 2 cols */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-electric" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 8v4l3 3"/><circle cx="12" cy="12" r="10"/>
                </svg>
              </div>
              <h2 className="section-title">Recent Activity</h2>
            </div>
            <button className="btn-ghost text-xs">View All →</button>
          </div>
          <ActivityFeed items={RECENT_ACTIVITY} maxItems={8} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Compliance Alerts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h2 className="section-title">Alerts</h2>
              </div>
              <span className="badge-amber text-[10px]">{alerts.length} active</span>
            </div>
            <div className="space-y-2">
              {alerts.map((e) => (
                <ComplianceAlert key={e.id} event={e} compact />
              ))}
            </div>
          </div>

          {/* Upcoming Visits */}
          <div className="card p-5">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="18" height="18" x="3" y="4" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h2 className="section-title">Upcoming Visits</h2>
            </div>
            <div className="space-y-3">
              {upcomingVisits.slice(0, 4).map((v) => {
                const prospect = PROSPECTS.find((p) => p.id === v.prospectId);
                return (
                  <div key={v.id} className="flex items-center gap-3 text-sm p-2.5 rounded-xl hover:bg-white/[0.02] transition-colors">
                    <div className="w-2 h-2 rounded-full bg-electric shrink-0 animate-pulse-glow" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {prospect ? `${prospect.firstName} ${prospect.lastName}` : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {v.type === 'official' ? 'Official' : v.type === 'junior_day' ? 'Junior Day' : 'Unofficial'} · {v.location}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0 bg-white/[0.03] px-2 py-1 rounded-lg">{formatDate(v.date)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Pipeline Overview + Top Prospects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pipeline Snapshot */}
        <div className="card p-6">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-electric/10 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-electric" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
              </svg>
            </div>
            <h2 className="section-title">Pipeline Snapshot</h2>
          </div>
          <div className="space-y-4">
            {STAGES.map((stage) => {
              const count = PROSPECTS.filter((p) => p.stageId === stage.id).length;
              const total = PROSPECTS.length;
              const pctVal = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={stage.id} className="space-y-2 group">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2.5">
                      <span
                        className="w-3 h-3 rounded-full ring-2 ring-white/5"
                        style={{ backgroundColor: stage.color }}
                      />
                      <span className="font-medium text-gray-300 group-hover:text-white transition-colors">{stage.name}</span>
                    </span>
                    <span className="text-sm font-semibold text-white tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out relative"
                      style={{ width: `${pctVal}%`, backgroundColor: stage.color }}
                    >
                      <div className="absolute inset-0 rounded-full opacity-40" style={{ background: `linear-gradient(90deg, transparent, rgba(255,255,255,0.2))` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Prospects */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <h2 className="section-title">Top Prospects</h2>
            </div>
            <button className="btn-ghost text-xs">View Board →</button>
          </div>
          <div className="space-y-2">
            {topProspects.map((p) => (
              <ProspectCard key={p.id} prospect={p} compact />
            ))}
          </div>
        </div>
      </div>

      {/* AI Insights Panel */}
      <div className="relative rounded-2xl border border-electric/[0.12] overflow-hidden group/ai transition-all duration-300 hover:border-electric/20"
        style={{
          background: 'linear-gradient(145deg, rgba(28, 32, 40, 0.95), rgba(20, 23, 30, 0.98))',
          boxShadow: '0 0 30px rgba(34, 197, 94, 0.06), 0 4px 24px rgba(0, 0, 0, 0.2)',
        }}
      >
        {/* Top gradient line */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-electric/40 to-transparent" />
        {/* Ambient glow blobs */}
        <div className="absolute -top-20 -left-20 w-60 h-60 rounded-full bg-electric/[0.04] blur-3xl transition-opacity group-hover/ai:opacity-100 opacity-60" />
        <div className="absolute -bottom-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/[0.03] blur-3xl" />

        <div className="relative z-10 p-6 flex items-start gap-4">
          {/* Animated AI icon */}
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-electric/20 to-emerald-500/10 flex items-center justify-center shrink-0 animate-float border border-electric/10 group-hover/ai:border-electric/20 transition-colors">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-electric">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
              <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
              <path d="M8.56 14h6.88" />
              <path d="M9.44 17.5h5.12" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <h3 className="text-sm font-semibold text-electric tracking-tight">AI Insights</h3>
              {/* Live indicator with pulsing dot */}
              <div className="flex items-center gap-1.5 bg-electric/[0.08] border border-electric/[0.15] px-2.5 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-electric animate-live-pulse" />
                <span className="text-[10px] font-semibold text-electric uppercase tracking-wider">Live</span>
              </div>
              {/* Refresh button */}
              <button className="ml-auto p-1.5 rounded-lg text-gray-500 hover:text-electric hover:bg-electric/5 transition-all duration-150 active:scale-95" aria-label="Refresh insights">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" /><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" /><path d="M16 16h5v5" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">
              Based on your pipeline data, <span className="text-white font-medium">DeAndre Williams</span> shows
              the highest commitment probability at <span className="text-emerald-400 font-semibold">85%</span>.
              Your Southeast region continues to produce the best conversion rates.
              Consider increasing outreach to <span className="text-white font-medium">CB</span> and
              <span className="text-white font-medium"> S </span> positions — current class is
              below target fill rate.
            </p>
            {/* Quick action chips */}
            <div className="flex flex-wrap gap-2 mt-4">
              <button className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-electric/[0.06] text-electric border border-electric/10 hover:bg-electric/10 hover:border-electric/20 transition-all duration-150 active:scale-[0.97]">
                View DeAndre Williams →
              </button>
              <button className="text-[11px] font-medium px-3 py-1.5 rounded-lg bg-white/[0.03] text-gray-400 border border-white/[0.06] hover:bg-white/[0.06] hover:text-white transition-all duration-150 active:scale-[0.97]">
                Position Needs Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
