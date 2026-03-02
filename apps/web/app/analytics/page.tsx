'use client';

import { useState } from 'react';
import { PROSPECTS, PIPELINE_METRICS, STAGES, DASHBOARD_STATS } from '../lib/mock-data';
import { cn, pct } from '../lib/utils';
import StatCard from '../components/StatCard';

type AnalyticsTab = 'pipeline' | 'geographic' | 'positions' | 'predictions';

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<AnalyticsTab>('pipeline');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Analytics & Intelligence</h1>
          <p className="text-sm text-gray-500 mt-1">Pipeline performance, geographic insights, and predictive scoring</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="input w-auto py-2 text-sm bg-navy/50">
            <option>2025-2026 Cycle</option>
            <option>2024-2025 Cycle</option>
          </select>
          <button className="btn-secondary text-sm">Export Report</button>
        </div>
      </div>

      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Pipeline Total" value={DASHBOARD_STATS.totalProspects} change="+18 this month" trend="up" />
        <StatCard label="Conversion Rate" value={`${DASHBOARD_STATS.conversionRate}%`} change="+2.1%" trend="up" />
        <StatCard label="Avg Eval Score" value={DASHBOARD_STATS.avgEvalScore} change="/10" />
        <StatCard label="Committed" value={DASHBOARD_STATS.committed} change={`of ${DASHBOARD_STATS.totalProspects}`} />
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-charcoal rounded-xl p-1 w-fit">
        {(['pipeline', 'geographic', 'positions', 'predictions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all',
              activeTab === tab ? 'bg-electric/10 text-electric' : 'text-gray-400 hover:text-white'
            )}
          >
            {tab === 'predictions' ? 'Predictive' : tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'pipeline' && <PipelineFunnel />}
      {activeTab === 'geographic' && <GeographicView />}
      {activeTab === 'positions' && <PositionFill />}
      {activeTab === 'predictions' && <PredictiveView />}
    </div>
  );
}

// ─── Pipeline Funnel ────────────────────────────────────────────────

function PipelineFunnel() {
  const conversionMetrics = PIPELINE_METRICS.filter((m) => m.type === 'conversion_rate');
  const stageData = STAGES.map((stage) => {
    const count = PROSPECTS.filter((p) => p.stageId === stage.id).length;
    return { ...stage, count };
  });
  const maxCount = Math.max(...stageData.map((s) => s.count), 1);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Funnel Visualization */}
      <div className="card p-6">
        <h3 className="section-title mb-6">Recruiting Funnel</h3>
        <div className="space-y-3">
          {stageData.map((stage, i) => {
            const widthPct = (stage.count / maxCount) * 100;
            return (
              <div key={stage.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{stage.name}</span>
                  <span className="text-gray-400">{stage.count} prospects</span>
                </div>
                <div className="h-8 bg-white/5 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-700 flex items-center px-3"
                    style={{
                      width: `${Math.max(widthPct, 8)}%`,
                      backgroundColor: stage.color,
                      opacity: 0.7,
                    }}
                  >
                    <span className="text-xs font-bold text-white drop-shadow">{stage.count}</span>
                  </div>
                </div>
                {i < stageData.length - 1 && (
                  <div className="flex justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-600">
                      <path d="m7 7 5 5 5-5" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Conversion Rates */}
      <div className="card p-6">
        <h3 className="section-title mb-6">Stage-to-Stage Conversion</h3>
        <div className="space-y-4">
          {conversionMetrics.map((metric) => (
            <div key={metric.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">{metric.dimension}</span>
                <span className="text-sm font-bold text-electric">{metric.value}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-electric/80 to-electric transition-all duration-700"
                  style={{ width: `${metric.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Overall Pipeline Yield</span>
            <span className="text-lg font-bold text-emerald-400">
              {pct(DASHBOARD_STATS.conversionRate)}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            From Identified to Committed across all classes
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Geographic Heatmap ─────────────────────────────────────────────

function GeographicView() {
  const regionalMetrics = PIPELINE_METRICS.filter((m) => m.type === 'regional_yield');
  const maxRegional = Math.max(...regionalMetrics.map((r) => r.value), 1);

  const stateData = PROSPECTS.reduce<Record<string, number>>((acc, p) => {
    if (p.state) acc[p.state] = (acc[p.state] || 0) + 1;
    return acc;
  }, {});

  const sortedStates = Object.entries(stateData).sort((a, b) => b[1] - a[1]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Regional Breakdown */}
      <div className="card p-6">
        <h3 className="section-title mb-6">Regional Pipeline Yield</h3>
        <div className="space-y-4">
          {regionalMetrics.sort((a, b) => b.value - a.value).map((metric) => {
            const barWidth = (metric.value / maxRegional) * 100;
            return (
              <div key={metric.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{metric.dimension}</span>
                  <span className="text-electric font-bold">{metric.value}%</span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${barWidth}%`,
                      background: `linear-gradient(90deg, rgba(0,230,255,0.6), rgba(0,255,178,0.6))`,
                    }}
                  />
                </div>
                {metric.metadata && (
                  <div className="flex flex-wrap gap-1">
                    {(metric.metadata as { states: string[] }).states?.map((s: string) => (
                      <span key={s} className="text-[10px] text-gray-600">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* State Breakdown */}
      <div className="card p-6">
        <h3 className="section-title mb-6">Prospects by State</h3>
        <div className="space-y-2">
          {sortedStates.map(([state, count]) => {
            const maxState = sortedStates[0][1];
            const barWidth = (count / maxState) * 100;
            return (
              <div key={state} className="flex items-center gap-3">
                <span className="w-8 text-sm font-bold text-electric">{state}</span>
                <div className="flex-1 h-6 bg-white/5 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg flex items-center px-2 transition-all duration-500"
                    style={{
                      width: `${Math.max(barWidth, 8)}%`,
                      background: 'linear-gradient(90deg, rgba(0,230,255,0.3), rgba(0,230,255,0.15))',
                    }}
                  >
                    <span className="text-xs font-medium text-electric">{count}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Geographic Heatmap Placeholder */}
        <div className="mt-6 pt-4 border-t border-white/5">
          <div className="rounded-xl bg-navy/50 border border-white/5 p-8 text-center">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600 mx-auto mb-3">
              <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            <p className="text-sm text-gray-500">Interactive heatmap available in Growth plan</p>
            <button className="btn-primary text-xs mt-3">Upgrade to Growth</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Position Fill Rates ────────────────────────────────────────────

function PositionFill() {
  const positionMetrics = PIPELINE_METRICS.filter((m) => m.type === 'position_fill');

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="section-title mb-2">Class of 2027 — Position Needs</h3>
        <p className="text-sm text-gray-500 mb-6">Current commitments vs. recruiting targets by position</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {positionMetrics.map((metric) => {
            const target = (metric.metadata as { target: number })?.target ?? 0;
            const filled = metric.value;
            const fillPct = target > 0 ? (filled / target) * 100 : 0;
            const isFull = filled >= target;

            return (
              <div key={metric.id} className={cn(
                'rounded-xl p-4 border transition-all',
                isFull
                  ? 'bg-emerald-500/5 border-emerald-500/20'
                  : filled > 0
                  ? 'bg-white/[0.02] border-white/5'
                  : 'bg-red-500/5 border-red-500/10'
              )}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-bold">{metric.dimension}</span>
                  <span className={cn(
                    'text-sm font-bold',
                    isFull ? 'text-emerald-400' : filled > 0 ? 'text-amber-400' : 'text-red-400'
                  )}>
                    {filled}/{target}
                  </span>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      isFull ? 'bg-emerald-400' : filled > 0 ? 'bg-amber-400' : 'bg-red-400'
                    )}
                    style={{ width: `${Math.min(fillPct, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {isFull ? 'Position filled ✓' : `${target - filled} more needed`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Position Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card px-5 py-4">
          <p className="stat-label">Positions Filled</p>
          <p className="stat-value text-emerald-400">
            {positionMetrics.filter((m) => m.value >= ((m.metadata as { target: number })?.target ?? 0)).length}
          </p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">Total Committed</p>
          <p className="stat-value">{positionMetrics.reduce((sum, m) => sum + m.value, 0)}</p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">Total Targets</p>
          <p className="stat-value">{positionMetrics.reduce((sum, m) => sum + ((m.metadata as { target: number })?.target ?? 0), 0)}</p>
        </div>
        <div className="card px-5 py-4">
          <p className="stat-label">Fill Rate</p>
          <p className="stat-value text-electric">
            {pct(
              (positionMetrics.reduce((s, m) => s + m.value, 0) /
               positionMetrics.reduce((s, m) => s + ((m.metadata as { target: number })?.target ?? 1), 0)) * 100
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Predictive View ────────────────────────────────────────────────

function PredictiveView() {
  const rankedProspects = PROSPECTS
    .filter((p) => p.commitmentScore !== null && p.status === 'active')
    .sort((a, b) => (b.commitmentScore ?? 0) - (a.commitmentScore ?? 0));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Likelihood Rankings */}
      <div className="card p-6">
        <h3 className="section-title mb-2">Commitment Probability Rankings</h3>
        <p className="text-sm text-gray-500 mb-6">AI-powered likelihood scores based on engagement, academics, and pipeline signals</p>

        <div className="space-y-3">
          {rankedProspects.map((prospect, i) => {
            const score = prospect.commitmentScore ?? 0;
            const scoreColor = score >= 75 ? 'text-emerald-400' : score >= 50 ? 'text-amber-400' : 'text-red-400';
            const barColor = score >= 75 ? 'from-emerald-500/50 to-emerald-400/30' : score >= 50 ? 'from-amber-500/50 to-amber-400/30' : 'from-red-500/50 to-red-400/30';

            return (
              <div key={prospect.id} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all">
                <span className="text-lg font-bold text-gray-600 w-6 text-center">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold">{prospect.firstName} {prospect.lastName}</p>
                  <p className="text-xs text-gray-500">{prospect.position} · {prospect.highSchool}</p>
                </div>
                <div className="w-24">
                  <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn('h-full rounded-full bg-gradient-to-r', barColor)}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
                <span className={cn('text-sm font-bold w-12 text-right', scoreColor)}>
                  {score}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Insights Panel */}
      <div className="space-y-4">
        <div className="card p-6 border-electric/10 glow-electric">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-electric/10 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-electric">
                <path d="M12 2a4 4 0 0 1 4 4c0 1.95-1.4 3.58-3.25 3.93L12 22" />
                <path d="M12 2a4 4 0 0 0-4 4c0 1.95 1.4 3.58 3.25 3.93" />
                <path d="M8.56 14h6.88" /><path d="M9.44 17.5h5.12" />
              </svg>
            </div>
            <div>
              <h3 className="section-title">AI Recruiting Insights</h3>
              <p className="text-xs text-gray-500">Powered by ScoutVision Intelligence</p>
            </div>
          </div>

          <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="font-medium text-white mb-1">🎯 High-Priority Action</p>
              <p>DeAndre Williams (85% commit score) has not been contacted in 5 days. Schedule follow-up to maintain momentum.</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="font-medium text-white mb-1">📈 Trending Up</p>
              <p>Marcus Johnson's engagement increased 23% after his campus visit. Academic profile meets eligibility threshold.</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="font-medium text-white mb-1">⚠️ At Risk</p>
              <p>Andre Davis's academic standing (2.7 GPA) may affect NCAA eligibility. Consider academic support outreach.</p>
            </div>
            <div className="p-3 rounded-lg bg-white/[0.03] border border-white/5">
              <p className="font-medium text-white mb-1">🗺️ Geographic Gap</p>
              <p>West region producing only 8% pipeline yield. Increase camp presence in CA, NV, and CO markets.</p>
            </div>
          </div>
        </div>

        {/* Historical Conversion */}
        <div className="card p-6">
          <h3 className="section-title mb-4">Historical Conversion Rates</h3>
          <div className="space-y-3">
            {[
              { cycle: '2024-2025', rate: 12.8, total: 118, committed: 15 },
              { cycle: '2023-2024', rate: 11.2, total: 105, committed: 12 },
              { cycle: '2022-2023', rate: 9.5, total: 95, committed: 9 },
            ].map((row) => (
              <div key={row.cycle} className="flex items-center justify-between p-3 rounded-lg bg-white/[0.02] border border-white/5">
                <span className="text-sm font-medium">{row.cycle}</span>
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <span>{row.committed}/{row.total}</span>
                  <span className="font-bold text-electric">{row.rate}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
