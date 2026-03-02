// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision — AI Scouting Report API Route
// POST: Generate AI scouting report for a prospect
// GET:  Retrieve saved reports
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { PROSPECTS } from '../../lib/mock-data';

export const dynamic = 'force-dynamic';

interface ScoutingReport {
  id: string;
  prospectId: string;
  prospectName: string;
  sport: string;
  generatedAt: string;
  overallGrade: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  projections: {
    category: string;
    current: number;
    projected: number;
    confidence: number;
  }[];
  comparison: {
    playerName: string;
    similarity: number;
    reason: string;
  }[];
  recommendation: string;
  fitScore: number;
  recruitingPriority: 'must-have' | 'high' | 'medium' | 'low' | 'monitor';
}

// In-memory report store
const reports = new Map<string, ScoutingReport>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospectId, sport = 'football' } = body;

    if (!prospectId) {
      return NextResponse.json({ error: 'prospectId is required' }, { status: 400 });
    }

    const prospect = PROSPECTS.find((p) => p.id === prospectId);
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Generate mock AI scouting report
    const report = generateReport(prospect, sport);
    reports.set(report.id, report);

    return NextResponse.json(report, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to generate report' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const prospectId = searchParams.get('prospectId');

  if (prospectId) {
    const prospectReports = Array.from(reports.values())
      .filter((r) => r.prospectId === prospectId)
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
    return NextResponse.json({ reports: prospectReports });
  }

  const allReports = Array.from(reports.values())
    .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime())
    .slice(0, 50);

  return NextResponse.json({ reports: allReports });
}

function generateReport(prospect: any, sport: string): ScoutingReport {
  const positionStrengths: Record<string, string[]> = {
    QB: ['Pocket awareness', 'Arm strength', 'Decision making under pressure', 'Read progression'],
    WR: ['Route running', 'Catch radius', 'YAC ability', 'Release at line of scrimmage'],
    RB: ['Vision and patience', 'Breakaway speed', 'Pass protection', 'Ball security'],
    DE: ['First-step quickness', 'Hand technique', 'Motor and effort', 'Edge setting'],
    LB: ['Sideline-to-sideline range', 'Coverage skills', 'Football IQ', 'Tackling technique'],
    CB: ['Ball skills', 'Hip fluidity', 'Recovery speed', 'Press technique'],
  };

  const positionWeaknesses: Record<string, string[]> = {
    QB: ['Footwork under pressure', 'Deep ball accuracy'],
    WR: ['Contested catches', 'Blocking effort'],
    RB: ['Gap discipline', 'Third-down efficiency'],
    DE: ['Run defense consistency', 'Counter moves'],
    LB: ['Zone drop discipline', 'Block shedding vs OL'],
    CB: ['Tackling willingness', 'Route recognition vs vets'],
  };

  const pos = prospect.position || 'QB';
  const strengths = positionStrengths[pos] || positionStrengths.QB;
  const weaknesses = positionWeaknesses[pos] || positionWeaknesses.QB;

  const score = prospect.commitmentScore ?? 70;
  const fitScore = Math.min(98, score + Math.floor(Math.random() * 15));
  const grade = fitScore >= 90 ? 'A' : fitScore >= 80 ? 'A-' : fitScore >= 70 ? 'B+' : fitScore >= 60 ? 'B' : 'B-';

  const priority: ScoutingReport['recruitingPriority'] =
    fitScore >= 90 ? 'must-have' : fitScore >= 80 ? 'high' : fitScore >= 65 ? 'medium' : 'low';

  return {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    prospectId: prospect.id,
    prospectName: `${prospect.firstName} ${prospect.lastName}`,
    sport,
    generatedAt: new Date().toISOString(),
    overallGrade: grade,
    summary: `${prospect.firstName} ${prospect.lastName} is a ${prospect.height}, ${prospect.weight}lb ${pos} from ${prospect.highSchool} (${prospect.city}, ${prospect.state}). ${prospect.bio || ''} AI analysis of available film and metrics indicates a strong fit for the program's system with a ${fitScore}% overall fit score.`,
    strengths,
    weaknesses,
    projections: [
      { category: 'Athleticism', current: 72 + Math.floor(Math.random() * 15), projected: 82 + Math.floor(Math.random() * 10), confidence: 0.85 },
      { category: 'Technical Skill', current: 68 + Math.floor(Math.random() * 15), projected: 78 + Math.floor(Math.random() * 12), confidence: 0.78 },
      { category: 'Football IQ', current: 70 + Math.floor(Math.random() * 12), projected: 85 + Math.floor(Math.random() * 8), confidence: 0.82 },
      { category: 'Leadership', current: 65 + Math.floor(Math.random() * 20), projected: 80 + Math.floor(Math.random() * 10), confidence: 0.70 },
    ],
    comparison: [
      { playerName: 'Similar D2 All-Conference player (2024)', similarity: 0.84, reason: `Comparable ${pos} metrics and physical profile` },
      { playerName: 'Program\'s top recruit (2023 class)', similarity: 0.76, reason: 'Similar athletic testing numbers and position fit' },
    ],
    recommendation: fitScore >= 80
      ? `Strong recommendation to extend offer. ${prospect.firstName} projects as an immediate contributor with high developmental ceiling. Schedule official visit ASAP.`
      : fitScore >= 65
      ? `Recommend continued evaluation. ${prospect.firstName} shows promising traits but needs further film review. Consider unofficial visit invite.`
      : `Monitor for now. ${prospect.firstName} has potential but other recruits at ${pos} are higher priority for current class needs.`,
    fitScore,
    recruitingPriority: priority,
  };
}
