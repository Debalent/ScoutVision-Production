// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision — Analytics API Route
// GET: Pipeline metrics, geographic distribution, position fill, dashboard stats
// ═══════════════════════════════════════════════════════════════════════════

import { NextResponse } from 'next/server';
import {
  PROSPECTS,
  STAGES,
  PIPELINE_METRICS,
  DASHBOARD_STATS,
  EVALUATIONS,
  VISITS,
} from '../../lib/mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || '';

function isSafeApiUrl(url: string): boolean {
  if (!url) return false;
  try {
    const parsed = new URL(url);
    const allowed = (process.env.ALLOWED_API_HOST || 'localhost').split(',').map((h) => h.trim());
    return allowed.includes(parsed.hostname);
  } catch {
    return false;
  }
}

const VALIDATED_API_URL = isSafeApiUrl(API_URL) ? API_URL : '';

export async function GET() {
  // When the Express API is available, proxy to it
  if (VALIDATED_API_URL) {
    try {
      const [prospectsRes, metricsRes] = await Promise.all([
        fetch(`${VALIDATED_API_URL}/prospects`),
        fetch(`${VALIDATED_API_URL}/analytics/metrics`),
      ]);
      if (prospectsRes.ok) {
        const prospects = await prospectsRes.json();
        const metrics   = metricsRes.ok ? await metricsRes.json() : PIPELINE_METRICS;
        return NextResponse.json(buildAnalytics(prospects, metrics));
      }
    } catch {
      // Fall through to mock data
    }
  }

  // Serve derived analytics from the in-memory mock dataset
  return NextResponse.json(buildAnalytics(PROSPECTS, PIPELINE_METRICS));
}

// ─── Derive all analytics payloads from prospects + metrics ─────────

function buildAnalytics(prospects: typeof PROSPECTS, metrics: typeof PIPELINE_METRICS) {
  const totalProspects  = prospects.length;
  const activeProspects = prospects.filter((p) => p.status === 'active').length;
  const committed       = prospects.filter((p) => p.status === 'committed').length;
  const conversionRate  = totalProspects > 0
    ? parseFloat(((committed / totalProspects) * 100).toFixed(1))
    : 0;

  // Avg eval score across all evaluations embedded in prospects
  const allEvals = EVALUATIONS;
  const avgEvalScore = allEvals.length > 0
    ? parseFloat((allEvals.reduce((s, e) => s + e.overallScore, 0) / allEvals.length).toFixed(1))
    : 0;

  // Upcoming visits count
  const now = Date.now();
  const upcomingVisits = VISITS.filter((v) => {
    return v.status === 'scheduled' && new Date(v.date).getTime() > now;
  }).length;

  const dashboardStats = {
    totalProspects,
    activeProspects,
    committed,
    conversionRate,
    upcomingVisits,
    complianceAlerts: 3,
    emailsSentThisWeek: 47,
    avgEvalScore,
  };

  // Pipeline funnel — stage counts
  const stageCounts = STAGES.map((stage) => ({
    ...stage,
    count: prospects.filter((p) => p.stageId === stage.id).length,
  }));

  // Geographic breakdown derived from prospects
  const stateMap: Record<string, number> = {};
  for (const p of prospects) {
    if (p.state) stateMap[p.state] = (stateMap[p.state] || 0) + 1;
  }
  const geographicBreakdown = Object.entries(stateMap)
    .map(([state, count]) => ({ state, count }))
    .sort((a, b) => b.count - a.count);

  // Position breakdown
  const positionMap: Record<string, { active: number; committed: number; total: number }> = {};
  for (const p of prospects) {
    const pos = p.position || 'Unknown';
    if (!positionMap[pos]) positionMap[pos] = { active: 0, committed: 0, total: 0 };
    positionMap[pos].total++;
    if (p.status === 'committed') positionMap[pos].committed++;
    else positionMap[pos].active++;
  }
  const positionBreakdown = Object.entries(positionMap)
    .map(([position, data]) => ({ position, ...data }))
    .sort((a, b) => b.total - a.total);

  // Commitment score distribution
  const scoreRanges = [
    { label: '80–100 (Hot)', min: 80, max: 100, count: 0 },
    { label: '60–79 (Warm)', min: 60, max: 79, count: 0 },
    { label: '40–59 (Cool)', min: 40, max: 59, count: 0 },
    { label: '0–39 (Cold)',  min: 0,  max: 39, count: 0 },
  ];
  for (const p of prospects) {
    const score = p.commitmentScore ?? 0;
    const range = scoreRanges.find((r) => score >= r.min && score <= r.max);
    if (range) range.count++;
  }

  // Class year breakdown
  const classYearMap: Record<number, number> = {};
  for (const p of prospects) {
    if (p.classYear) classYearMap[p.classYear] = (classYearMap[p.classYear] || 0) + 1;
  }
  const classYearBreakdown = Object.entries(classYearMap)
    .map(([year, count]) => ({ year: Number(year), count }))
    .sort((a, b) => a.year - b.year);

  return {
    dashboardStats,
    stageCounts,
    geographicBreakdown,
    positionBreakdown,
    scoreDistribution: scoreRanges,
    classYearBreakdown,
    pipelineMetrics: metrics,
  };
}
