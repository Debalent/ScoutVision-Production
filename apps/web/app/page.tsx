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
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Welcome back, Coach Rivera</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-secondary text-sm">
            <span className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </span>
          </button>
          <button className="btn-primary text-sm">+ Add Prospect</button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Prospects"
          value={DASHBOARD_STATS.totalProspects}
          change="+12"
          trend="up"
        />
        <StatCard
          label="Committed"
          value={DASHBOARD_STATS.committed}
          change={pct(DASHBOARD_STATS.conversionRate)}
          trend="up"
        />
        <StatCard
          label="Upcoming Visits"
          value={DASHBOARD_STATS.upcomingVisits}
        />
        <StatCard
          label="Compliance Alerts"
          value={DASHBOARD_STATS.complianceAlerts}
          change="2 warnings"
          trend="neutral"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity Feed — spans 2 cols */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Recent Activity</h2>
            <button className="btn-ghost text-xs">View All</button>
          </div>
          <ActivityFeed items={RECENT_ACTIVITY} maxItems={8} />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Compliance Alerts */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="section-title">Compliance Alerts</h2>
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
            <h2 className="section-title mb-4">Upcoming Visits</h2>
            <div className="space-y-3">
              {upcomingVisits.slice(0, 4).map((v) => {
                const prospect = PROSPECTS.find((p) => p.id === v.prospectId);
                return (
                  <div key={v.id} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-electric shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {prospect ? `${prospect.firstName} ${prospect.lastName}` : 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {v.type === 'official' ? 'Official' : v.type === 'junior_day' ? 'Junior Day' : 'Unofficial'} · {v.location}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">{formatDate(v.date)}</span>
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
        <div className="card p-5">
          <h2 className="section-title mb-4">Pipeline Snapshot</h2>
          <div className="space-y-3">
            {STAGES.map((stage) => {
              const count = PROSPECTS.filter((p) => p.stageId === stage.id).length;
              const total = PROSPECTS.length;
              const pctVal = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={stage.id} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stage.color }} />
                      {stage.name}
                    </span>
                    <span className="text-gray-400 font-medium">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pctVal}%`, backgroundColor: stage.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Prospects */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Top Prospects</h2>
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
      <div className="card p-5 border-electric/10 glow-electric">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-electric">
              <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
              <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
              <path d="M8.56 14h6.88" />
              <path d="M9.44 17.5h5.12" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-electric mb-1">AI Insights</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Based on your pipeline data, <span className="text-white font-medium">DeAndre Williams</span> shows
              the highest commitment probability at <span className="text-emerald-400 font-semibold">85%</span>.
              Your Southeast region continues to produce the best conversion rates.
              Consider increasing outreach to <span className="text-white font-medium">CB</span> and
              <span className="text-white font-medium"> S </span> positions — current class is
              below target fill rate.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
