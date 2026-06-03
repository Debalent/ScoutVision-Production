// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision — AI Scouting Report API Route
// POST: Generate AI scouting report for a prospect
// GET:  Retrieve saved reports (pre-seeded + generated)
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';
import { PROSPECTS } from '../../lib/mock-data';

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

// ─── Pre-seeded AI Reports ──────────────────────────────────────────
// Generated at build time — no LLM call needed for demo/development

const SEEDED_REPORTS: ScoutingReport[] = [
  {
    id: 'rpt-pr-1',
    prospectId: 'pr-1',
    prospectName: 'Marcus Johnson',
    sport: 'football',
    generatedAt: '2026-05-28T14:00:00Z',
    overallGrade: 'A',
    summary: 'Marcus Johnson is a franchise-caliber dual-threat QB with rare arm talent and elite processing speed. His ability to extend plays with his legs while maintaining accuracy downfield separates him from peers in the 2027 class. Film shows consistent ball placement on deep routes, pre-snap read progression that rivals upperclassmen, and outstanding leadership presence.',
    strengths: [
      'Elite arm strength — consistent accuracy to 55+ yards',
      'Pre-snap read progression is already college-ready',
      'Dual-threat mobility — 4.55 forty with 420 rushing yards',
      'High completion % under pressure (67.4%)',
      'Natural team leader — 3.6 GPA signals academic reliability',
    ],
    weaknesses: [
      'Weight room numbers below average for position (225 bench)',
      'Limited experience vs. elite defensive fronts',
      'Footwork under pocket pressure needs development',
    ],
    projections: [
      { category: 'Arm Strength',  current: 82, projected: 91, confidence: 87 },
      { category: 'Accuracy',      current: 79, projected: 88, confidence: 84 },
      { category: 'Mobility',      current: 74, projected: 80, confidence: 80 },
      { category: 'Leadership',    current: 88, projected: 92, confidence: 90 },
      { category: 'Football IQ',   current: 85, projected: 93, confidence: 88 },
    ],
    comparison: [
      { playerName: 'Sam Howell (UNC 2020)',             similarity: 81, reason: 'Similar dual-threat profile, processing speed, and completion % trajectory' },
      { playerName: 'Grayson McCall (Coastal Carolina)', similarity: 74, reason: 'Comparable decision-making speed and clutch performance metrics' },
    ],
    recommendation: 'Extend scholarship offer immediately. Marcus is a top-10 QB in the 2027 class and will accumulate multiple P5 offers. Move quickly — decision expected by July 4th.',
    fitScore: 91,
    recruitingPriority: 'must-have',
  },
  {
    id: 'rpt-pr-2',
    prospectId: 'pr-2',
    prospectName: 'Jaylen Carter',
    sport: 'football',
    generatedAt: '2026-05-20T10:00:00Z',
    overallGrade: 'B+',
    summary: 'Jaylen Carter is a technically refined WR with excellent route-running fundamentals and reliable hands. His separation ability at the top of routes is above average for the 2027 class. 68 receptions and 1,100 yards against strong Texas competition is legitimate production.',
    strengths: [
      'Elite route-running — separation at top of every route',
      '4.42 forty places in top-10% nationally for WRs',
      'Reliable hands — only 3 drops on 68 targets',
      '38" vertical with exceptional body control',
    ],
    weaknesses: [
      'Contested-catch rate needs improvement',
      'Blocking effort on run plays is below average',
      'May need to add 5–8 lbs of functional strength',
    ],
    projections: [
      { category: 'Route Running', current: 82, projected: 90, confidence: 88 },
      { category: 'Hands',         current: 78, projected: 85, confidence: 82 },
      { category: 'Speed',         current: 84, projected: 87, confidence: 90 },
      { category: 'YAC',           current: 71, projected: 80, confidence: 76 },
    ],
    comparison: [
      { playerName: 'Jalen Nailor (MSU)',           similarity: 78, reason: 'Similar size, route tree, and production profile from Texas competition' },
      { playerName: "Rome Odunze (Washington 2021)", similarity: 73, reason: 'Comparable route precision and release package at the line of scrimmage' },
    ],
    recommendation: 'Strong target for 2027 class. Jaylen projects as a WR2/slot weapon immediately. Extend offer and schedule unofficial visit before other programs do.',
    fitScore: 78,
    recruitingPriority: 'high',
  },
  {
    id: 'rpt-pr-3',
    prospectId: 'pr-3',
    prospectName: 'DeAndre Williams',
    sport: 'football',
    generatedAt: '2026-05-15T09:00:00Z',
    overallGrade: 'A-',
    summary: "DeAndre Williams is an elite edge-rushing prospect with a first step that ranks in the 98th percentile nationally. His relentless motor and developing hand technique project him as an NFL Day 2–3 pick within 3 seasons. 14 sacks as a junior on limited snaps against Illinois-caliber competition is legitimate production.",
    strengths: [
      '98th-percentile first step quickness',
      '14 sacks as junior — elite production for level',
      'Relentless motor — maximum effort every snap',
      '3.8 GPA — academic reliability on roster',
      'Developing counter moves (chop, spin already present)',
    ],
    weaknesses: [
      'Point-of-attack strength is still developmental',
      'Counter-move repertoire limited beyond swim and rip',
      'Needs bulk to handle NFL-style B-gap runs',
    ],
    projections: [
      { category: 'Pass Rush',      current: 89, projected: 95, confidence: 88 },
      { category: 'Run Defense',    current: 71, projected: 83, confidence: 82 },
      { category: 'Athleticism',    current: 91, projected: 93, confidence: 92 },
      { category: 'Hand Technique', current: 68, projected: 82, confidence: 78 },
    ],
    comparison: [
      { playerName: 'Myles Murphy (Clemson 2019)', similarity: 78, reason: 'Similar motor, first step, and production trajectory from HS' },
      { playerName: 'Dallas Turner (Alabama)',     similarity: 72, reason: 'Comparable measurables and sack production relative to competition' },
    ],
    recommendation: 'Top defensive priority in the 2027 class. Offer already extended — push for commitment visit before the summer dead period (June 25).',
    fitScore: 88,
    recruitingPriority: 'must-have',
  },
  {
    id: 'rpt-pr-4',
    prospectId: 'pr-4',
    prospectName: 'Khalil Brown',
    sport: 'football',
    generatedAt: '2026-04-01T10:00:00Z',
    overallGrade: 'A+',
    summary: 'Khalil Brown is a complete linebacker who brings elite instincts, coverage versatility, and locker-room leadership that cannot be quantified. His 112-tackle, 3-INT, 6-sack junior season at a program-caliber level is exceptional. His commitment is the top win of the 2027 cycle.',
    strengths: [
      'All-world instincts — rarely out of position',
      'Coverage in man and zone at elite level',
      '112 tackles, 6 sacks — dominant production',
      '3-year team captain — character immeasurable',
      '3.9 GPA, 1280 SAT — no eligibility risk',
    ],
    weaknesses: [
      'Needs 5–10 lbs before college camp',
      'Zone drops vs. 4-verticals concepts need polish',
    ],
    projections: [
      { category: 'Coverage',    current: 87, projected: 94, confidence: 90 },
      { category: 'Run Stopping', current: 85, projected: 90, confidence: 88 },
      { category: 'Pass Rush',   current: 76, projected: 84, confidence: 82 },
      { category: 'Leadership',  current: 97, projected: 98, confidence: 97 },
    ],
    comparison: [
      { playerName: 'Deion Jones (LSU 2016)',  similarity: 84, reason: 'Coverage athleticism, zone instincts, and leadership metrics' },
      { playerName: 'Roquan Smith (Georgia)', similarity: 79, reason: 'Tackle efficiency and sideline-to-sideline range' },
    ],
    recommendation: 'Committed. Begin orientation planning and connect with academic advising. Khalil is a 4-year starter and leadership cornerstone.',
    fitScore: 97,
    recruitingPriority: 'must-have',
  },
  {
    id: 'rpt-pr-5',
    prospectId: 'pr-5',
    prospectName: 'Tyrese Mitchell',
    sport: 'football',
    generatedAt: '2026-05-10T11:00:00Z',
    overallGrade: 'B+',
    summary: 'Tyrese Mitchell is a raw but supremely talented CB with 4.38 speed and 40" vertical. His track background (All-State 100m/200m) gives him athletic metrics that rank in the national top-10 for cornerbacks. Technique is developmental, but the tools are D1-caliber.',
    strengths: [
      '4.38 forty — top-5% speed for CB nationally',
      '40" vertical with elite closing burst',
      '8 INTs, 16 PBUs — elite ball production',
      'Two-sport athlete: track instincts transfer to football',
    ],
    weaknesses: [
      'Press coverage technique is raw and needs work',
      'Football-specific agility still developing',
      'Core GPA (2.9) bears monitoring for NCAA eligibility',
    ],
    projections: [
      { category: 'Speed/Burst',    current: 94, projected: 95, confidence: 95 },
      { category: 'Press Coverage', current: 61, projected: 78, confidence: 74 },
      { category: 'Ball Skills',    current: 79, projected: 86, confidence: 80 },
      { category: 'Run Support',    current: 65, projected: 74, confidence: 72 },
    ],
    comparison: [
      { playerName: 'Asante Samuel Jr. (FSU)', similarity: 74, reason: 'Similar elite speed profile and raw-but-talented early CB archetype' },
    ],
    recommendation: 'Target for 2028 class. Get him on campus junior day. Academic eligibility must be confirmed before extending formal offer.',
    fitScore: 72,
    recruitingPriority: 'high',
  },
  {
    id: 'rpt-pr-7',
    prospectId: 'pr-7',
    prospectName: 'Isaiah Thompson',
    sport: 'football',
    generatedAt: '2026-05-22T13:00:00Z',
    overallGrade: 'A-',
    summary: 'Isaiah Thompson is a matchup nightmare TE with rare blend of size (6\'4", 230 lbs) and athleticism (4.62 forty). He runs routes like a WR while projecting to block like a TE. His receiving metrics — 42/680/8 — are elite at the HS level against PA-area competition.',
    strengths: [
      'Rare size-speed combination for TE (6\'4", 4.62)',
      '42 catches, 8 TDs — elite TE production at HS level',
      'Routes refined enough to play WR at D1',
      '3.5 GPA — no eligibility concerns',
    ],
    weaknesses: [
      'Run-blocking technique needs college-level refinement',
      'Hand strength vs. physical press needs work',
    ],
    projections: [
      { category: 'Receiving',  current: 85, projected: 92, confidence: 88 },
      { category: 'Blocking',   current: 70, projected: 82, confidence: 80 },
      { category: 'Athleticism', current: 83, projected: 87, confidence: 86 },
      { category: 'Route Running', current: 80, projected: 89, confidence: 85 },
    ],
    comparison: [
      { playerName: 'Trey McBride (Colorado State)', similarity: 76, reason: 'Similar receiving TE who moved to blocking as needed — same size-speed profile' },
    ],
    recommendation: 'Priority TE. Only one quality TE target in the 2027 class — Isaiah fills that role. Schedule official visit and move to Offer stage.',
    fitScore: 84,
    recruitingPriority: 'must-have',
  },
  {
    id: 'rpt-pr-8',
    prospectId: 'pr-8',
    prospectName: 'Cameron Lee',
    sport: 'football',
    generatedAt: '2026-05-18T09:00:00Z',
    overallGrade: 'A-',
    summary: 'Cameron Lee is a technically elite OT with the frame (6\'5", 295 lbs) and tools to play OT at the D1 level from Day 1. His 48 pancakes and only 1 sack allowed in film tells the story — he dominates. All-State selection in a loaded Texas OL class validates the production.',
    strengths: [
      '6\'5", 295 lbs — ideal OT frame with room to grow',
      '48 pancake blocks — dominant run blocker',
      'Only 1 sack allowed — elite pass protection',
      'Quick feet for position — effective at pulling',
    ],
    weaknesses: [
      'Needs to improve lateral mobility for NFL-style stunts',
      '2 penalties in film study — hand discipline in development',
    ],
    projections: [
      { category: 'Run Blocking',    current: 88, projected: 93, confidence: 90 },
      { category: 'Pass Protection', current: 85, projected: 91, confidence: 87 },
      { category: 'Athleticism',     current: 76, projected: 82, confidence: 80 },
      { category: 'Hand Discipline', current: 74, projected: 84, confidence: 78 },
    ],
    comparison: [
      { playerName: 'Darnell Wright (Tennessee 2019)', similarity: 77, reason: 'Similar size profile and dominant HS run-blocking metrics' },
    ],
    recommendation: 'Extend offer. Cameron fills our biggest roster need at OL and projects as 4-year starter. Schedule official visit before June dead period.',
    fitScore: 85,
    recruitingPriority: 'must-have',
  },
  {
    id: 'rpt-pr-9',
    prospectId: 'pr-9',
    prospectName: 'Darius Cole',
    sport: 'football',
    generatedAt: '2026-05-25T11:00:00Z',
    overallGrade: 'A-',
    summary: 'Darius Cole is an elite safety with sideline-to-sideline range, bone-crushing contact skills, and scheme versatility to play SS, FS, or LB hybrid. His 94-tackle, 5-INT season against top-tier California competition is exceptional for a safety.',
    strengths: [
      'Sideline-to-sideline range is 99th percentile',
      '5 INTs from safety position — ball-hawk instincts',
      'Scheme versatility: plays SS, FS, and LB hybrid',
      'Elite special teams contributor (18+ ST tackles)',
    ],
    weaknesses: [
      'Press coverage technique needs refinement',
      'Occasional overpursuit in gap-scheme runs',
    ],
    projections: [
      { category: 'Range',        current: 93, projected: 95, confidence: 93 },
      { category: 'Coverage',     current: 79, projected: 88, confidence: 82 },
      { category: 'Run Support',  current: 88, projected: 91, confidence: 89 },
      { category: 'Blitz Package', current: 84, projected: 90, confidence: 86 },
    ],
    comparison: [
      { playerName: 'Jevon Holland (Oregon)',  similarity: 76, reason: 'Similar range, versatility, and special teams impact profile' },
      { playerName: 'Daxton Hill (Michigan)', similarity: 71, reason: 'Comparable hybrid safety/LB athleticism metrics' },
    ],
    recommendation: 'High priority — extend offer this week. St. John Bosco prospects are routinely targeted by multiple P5 programs. Do not wait.',
    fitScore: 86,
    recruitingPriority: 'high',
  },
];

// In-memory report store: seeded reports + any generated at runtime
const reports = new Map<string, ScoutingReport>(
  SEEDED_REPORTS.map((r) => [r.id, r])
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prospectId, sport = 'football' } = body;

    if (!prospectId) {
      return NextResponse.json({ error: 'prospectId is required' }, { status: 400 });
    }

    // Return existing seeded report if available
    const existing = SEEDED_REPORTS.find((r) => r.prospectId === prospectId);
    if (existing) {
      return NextResponse.json({ ...existing, generatedAt: new Date().toISOString() }, { status: 201 });
    }

    const prospect = PROSPECTS.find((p) => p.id === prospectId);
    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 });
    }

    // Generate dynamic report for prospects without a pre-seeded one
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

// ─── Dynamic report generator (for prospects without seeded reports) ──

function generateReport(prospect: (typeof PROSPECTS)[0], sport: string): ScoutingReport {
  const positionStrengths: Record<string, string[]> = {
    QB:  ['Pocket awareness', 'Arm strength', 'Decision making under pressure', 'Read progression'],
    WR:  ['Route running', 'Catch radius', 'YAC ability', 'Release at line of scrimmage'],
    RB:  ['Vision and patience', 'Breakaway speed', 'Pass protection', 'Ball security'],
    TE:  ['Size-speed combination', 'Blocking in line', 'Seam route ability', 'Red zone target'],
    OL:  ['Run blocking technique', 'Pass protection footwork', 'Strength', 'Football IQ'],
    DE:  ['First-step quickness', 'Hand technique', 'Motor and effort', 'Edge setting'],
    DT:  ['Penetration ability', 'Two-gap technique', 'Strength', 'Pass-rush moves'],
    LB:  ['Sideline-to-sideline range', 'Coverage skills', 'Football IQ', 'Tackling technique'],
    CB:  ['Ball skills', 'Hip fluidity', 'Recovery speed', 'Press technique'],
    S:   ['Range and instincts', 'Ball hawking', 'Run support', 'Zone coverage'],
  };

  const positionWeaknesses: Record<string, string[]> = {
    QB:  ['Footwork under pressure', 'Deep ball accuracy in wind'],
    WR:  ['Contested catches', 'Blocking effort on run plays'],
    RB:  ['Gap discipline', 'Third-down pass protection'],
    TE:  ['Run-blocking technique', 'Hand strength vs. press'],
    OL:  ['Lateral mobility on stunts', 'Hand discipline on contact'],
    DE:  ['Run defense consistency', 'Counter moves beyond primary rush'],
    DT:  ['Pass-rush stamina', 'Chase range in space'],
    LB:  ['Zone drop discipline', 'Block shedding vs. OL'],
    CB:  ['Tackling willingness', 'Route recognition vs. veterans'],
    S:   ['Press technique', 'Overpursuit in gap schemes'],
  };

  const pos = prospect.position || 'QB';
  const strengths  = positionStrengths[pos]  || positionStrengths.QB;
  const weaknesses = positionWeaknesses[pos] || positionWeaknesses.QB;

  const score    = prospect.commitmentScore ?? 70;
  const fitScore = Math.min(98, score + Math.floor(Math.random() * 12) + 3);
  const grade    = fitScore >= 90 ? 'A' : fitScore >= 82 ? 'A-' : fitScore >= 74 ? 'B+' : fitScore >= 66 ? 'B' : 'B-';

  const priority: ScoutingReport['recruitingPriority'] =
    fitScore >= 90 ? 'must-have' : fitScore >= 80 ? 'high' : fitScore >= 65 ? 'medium' : 'low';

  return {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    prospectId: prospect.id,
    prospectName: `${prospect.firstName} ${prospect.lastName}`,
    sport,
    generatedAt: new Date().toISOString(),
    overallGrade: grade,
    summary: `${prospect.firstName} ${prospect.lastName} is a ${prospect.height ?? ''}, ${prospect.weight ?? ''}lb ${pos} from ${prospect.highSchool ?? 'unknown school'} (${prospect.city ?? ''}, ${prospect.state ?? ''}). ${prospect.bio ?? ''} AI analysis of available film and metrics indicates a ${fitScore}% system fit with significant developmental upside.`,
    strengths,
    weaknesses,
    projections: [
      { category: 'Athleticism',   current: 72 + Math.floor(Math.random() * 14), projected: 82 + Math.floor(Math.random() * 10), confidence: 85 },
      { category: 'Technical Skill', current: 68 + Math.floor(Math.random() * 14), projected: 78 + Math.floor(Math.random() * 12), confidence: 78 },
      { category: 'Football IQ',   current: 70 + Math.floor(Math.random() * 12), projected: 85 + Math.floor(Math.random() * 8),  confidence: 82 },
      { category: 'Leadership',    current: 65 + Math.floor(Math.random() * 20), projected: 80 + Math.floor(Math.random() * 10), confidence: 70 },
    ],
    comparison: [
      { playerName: 'Comparable D1 All-Conference Player (2024)', similarity: 0.84, reason: `Matched on ${pos} measurables and positional fit metrics` },
      { playerName: "Program's top historical recruit at position",  similarity: 0.76, reason: 'Similar athletic testing profile and system fit indicators' },
    ],
    recommendation: fitScore >= 80
      ? `Strong recommendation to extend offer. ${prospect.firstName} projects as an immediate contributor. Schedule official visit ASAP.`
      : fitScore >= 65
      ? `Continue evaluation. Invite for unofficial visit to assess coachability and campus fit before committing resources.`
      : `Monitor for now. Other priorities at ${pos} are higher for current class needs.`,
    fitScore,
    recruitingPriority: priority,
  };
}


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
