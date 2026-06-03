// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision — Video Analysis API Route
// POST: Submit video for AI analysis (returns pre-generated results instantly)
// GET:  Check analysis status / retrieve results
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

// In-memory job store
const jobs = new Map<string, AnalysisJobStatus>();

interface AnalysisJobStatus {
  jobId: string;
  videoId: string;
  sport: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  createdAt: string;
  completedAt?: string;
  result?: AnalysisResult;
  error?: string;
}

interface AnalysisResult {
  videoId: string;
  sport: string;
  processingTimeMs: number;
  framesProcessed: number;
  playersDetected: PlayerSummary[];
  highlights: HighlightSummary[];
  plays: PlaySummary[];
  overallGrade: string;
  aiInsights: string[];
}

interface PlayerSummary {
  trackId: number;
  teamId: number;
  detectionConfidence: number;
  framesVisible: number;
  metrics: Record<string, number>;
}

interface HighlightSummary {
  type: string;
  frameStart: number;
  frameEnd: number;
  confidence: number;
  description: string;
}

interface PlaySummary {
  type: string;
  frameStart: number;
  frameEnd: number;
  confidence: number;
}

// ─── Pre-seeded analysis results for known video IDs ────────────────

const PREBUILT_RESULTS: Record<string, AnalysisResult> = {
  'v1': {
    videoId: 'v1', sport: 'football', processingTimeMs: 9400, framesProcessed: 1800,
    playersDetected: [
      { trackId: 1, teamId: 0, detectionConfidence: 0.94, framesVisible: 1650, metrics: { speed: 18.2, acceleration: 4.1, distanceCovered: 342 } },
      { trackId: 2, teamId: 0, detectionConfidence: 0.91, framesVisible: 1580, metrics: { speed: 16.8, acceleration: 3.8, distanceCovered: 298 } },
      { trackId: 3, teamId: 1, detectionConfidence: 0.89, framesVisible: 1720, metrics: { speed: 17.5, acceleration: 4.3, distanceCovered: 365 } },
      { trackId: 4, teamId: 1, detectionConfidence: 0.92, framesVisible: 1490, metrics: { speed: 19.1, acceleration: 4.7, distanceCovered: 410 } },
    ],
    highlights: [
      { type: 'explosive_play', frameStart: 120, frameEnd: 210, confidence: 0.87, description: 'QB #1 explosive scramble — 18.2 mph sustained speed, decisive pocket escape' },
      { type: 'deep_completion', frameStart: 480, frameEnd: 560, confidence: 0.91, description: '53-yard completion — perfect ball placement, 0.62s release time' },
      { type: 'athletic_display', frameStart: 890, frameEnd: 950, confidence: 0.82, description: 'Elite hip mobility on back-shoulder fade route — pro-level throw mechanics' },
    ],
    plays: [
      { type: 'pass_deep', frameStart: 0, frameEnd: 180, confidence: 0.91 },
      { type: 'scramble', frameStart: 180, frameEnd: 420, confidence: 0.88 },
      { type: 'pass_intermediate', frameStart: 420, frameEnd: 600, confidence: 0.85 },
      { type: 'run_option', frameStart: 600, frameEnd: 780, confidence: 0.79 },
      { type: 'pass_deep', frameStart: 780, frameEnd: 960, confidence: 0.87 },
    ],
    overallGrade: 'A',
    aiInsights: [
      'Release time averages 0.38s — 94th percentile nationally for QB class of 2027',
      'Completion % on throws 20+ yards: 71% — exceptional for high school level',
      'Hip rotation mechanics score 88/100 — projects to handle NFL-style rush packages',
      'Pocket presence rating: 9.1/10 — feels pressure without visual cues and resets efficiently',
      'Recommend accelerating offer timeline — film quality places Marcus in top-5 of 2027 QBs nationally',
    ],
  },
  'v2': {
    videoId: 'v2', sport: 'football', processingTimeMs: 7200, framesProcessed: 1440,
    playersDetected: [
      { trackId: 1, teamId: 0, detectionConfidence: 0.96, framesVisible: 1380, metrics: { speed: 17.8, acceleration: 4.4, distanceCovered: 288 } },
      { trackId: 2, teamId: 1, detectionConfidence: 0.88, framesVisible: 1200, metrics: { speed: 15.2, acceleration: 3.6, distanceCovered: 210 } },
    ],
    highlights: [
      { type: 'route_execution', frameStart: 60, frameEnd: 140, confidence: 0.90, description: 'Perfect curl route — 3.1 yards of separation at top of route vs. man coverage' },
      { type: 'concentration_catch', frameStart: 420, frameEnd: 490, confidence: 0.84, description: 'Back-of-the-end-zone grab — elite body control and toe-tap technique' },
    ],
    plays: [
      { type: 'curl_route', frameStart: 0, frameEnd: 180, confidence: 0.90 },
      { type: 'slant', frameStart: 180, frameEnd: 360, confidence: 0.86 },
      { type: 'fade', frameStart: 360, frameEnd: 540, confidence: 0.82 },
      { type: 'seam', frameStart: 540, frameEnd: 720, confidence: 0.88 },
    ],
    overallGrade: 'A-',
    aiInsights: [
      'Average separation at catch point: 2.8 yards — above D1 average (2.2 yards)',
      'Route efficiency on 5-route tree analysis: 87% — elite consistency',
      'Ball security under contact: no fumbles detected in 12 contested catch attempts',
      'Recommend tracking combine invites and evaluating late-season film for consistency check',
    ],
  },
};

// ─── POST: Submit analysis job ──────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, sport = 'football' } = body;

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    // Return pre-built result immediately if available
    const prebuilt = PREBUILT_RESULTS[videoId];
    const job: AnalysisJobStatus = {
      jobId,
      videoId,
      sport,
      status: prebuilt ? 'completed' : 'queued',
      progress: prebuilt ? 100 : 0,
      stage: prebuilt ? 'complete' : 'queued',
      createdAt: new Date().toISOString(),
      completedAt: prebuilt ? new Date().toISOString() : undefined,
      result: prebuilt ?? undefined,
    };

    jobs.set(jobId, job);

    // For unknown video IDs, run the async simulation
    if (!prebuilt) simulateAnalysis(jobId);

    return NextResponse.json({
      jobId,
      status: job.status,
      message: prebuilt
        ? 'Analysis results loaded from cache'
        : 'Video analysis job submitted successfully',
      result: prebuilt ? job.result : undefined,
    }, { status: prebuilt ? 200 : 202 });
  } catch {
    return NextResponse.json(
      { error: 'Failed to submit analysis job' },
      { status: 500 }
    );
  }
}

// ─── GET: Check status ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const job = jobs.get(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  }

  // Return all jobs (latest first)
  const allJobs = Array.from(jobs.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  return NextResponse.json({ jobs: allJobs });
}

// ─── Mock Analysis Pipeline (for unknown video IDs) ─────────────────

async function simulateAnalysis(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return;

  const stages = [
    { name: 'ingesting',           duration: 400 },
    { name: 'preprocessing',       duration: 300 },
    { name: 'detecting_players',   duration: 700 },
    { name: 'tracking',            duration: 600 },
    { name: 'pose_estimation',     duration: 900 },
    { name: 'biomechanics',        duration: 500 },
    { name: 'sport_metrics',       duration: 400 },
    { name: 'highlights',          duration: 300 },
    { name: 'play_classification', duration: 350 },
    { name: 'generating_output',   duration: 200 },
  ];

  job.status = 'processing';

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    job.stage    = stage.name;
    job.progress = Math.round(((i + 1) / stages.length) * 100);
    await delay(stage.duration);
  }

  job.status      = 'completed';
  job.progress    = 100;
  job.stage       = 'complete';
  job.completedAt = new Date().toISOString();
  job.result      = generateMockResult(job.videoId, job.sport);
}

function generateMockResult(videoId: string, sport: string): AnalysisResult {
  return {
    videoId,
    sport,
    processingTimeMs: 5150,
    framesProcessed: 1800,
    playersDetected: [
      { trackId: 1, teamId: 0, detectionConfidence: 0.94, framesVisible: 1650, metrics: { speed: 18.2, acceleration: 4.1, distanceCovered: 342 } },
      { trackId: 2, teamId: 0, detectionConfidence: 0.91, framesVisible: 1580, metrics: { speed: 16.8, acceleration: 3.8, distanceCovered: 298 } },
      { trackId: 3, teamId: 1, detectionConfidence: 0.89, framesVisible: 1720, metrics: { speed: 17.5, acceleration: 4.3, distanceCovered: 365 } },
      { trackId: 4, teamId: 1, detectionConfidence: 0.92, framesVisible: 1490, metrics: { speed: 19.1, acceleration: 4.7, distanceCovered: 410 } },
    ],
    highlights: [
      { type: 'explosive_play',    frameStart: 120, frameEnd: 210, confidence: 0.87, description: 'Player #4 explosive burst — 19.1 mph top speed, 4.7 m/s² acceleration' },
      { type: 'big_hit',           frameStart: 540, frameEnd: 580, confidence: 0.82, description: 'High-impact collision at frame 560 — potential tackle showcase moment' },
      { type: 'athletic_display',  frameStart: 890, frameEnd: 950, confidence: 0.79, description: 'Player #1 demonstrates elite agility — 3 direction changes in 1.2s' },
    ],
    plays: [
      { type: 'pass', frameStart: 0,   frameEnd: 180, confidence: 0.91 },
      { type: 'run',  frameStart: 180, frameEnd: 420, confidence: 0.85 },
      { type: 'pass', frameStart: 420, frameEnd: 600, confidence: 0.88 },
      { type: 'screen', frameStart: 600, frameEnd: 780, confidence: 0.76 },
      { type: 'run',  frameStart: 780, frameEnd: 960, confidence: 0.83 },
    ],
    overallGrade: 'A-',
    aiInsights: [
      'Player #4 shows D1-caliber burst metrics — 19.1 mph peak speed in 95th percentile for position',
      'Route separation averages 2.8 yards — above average for D2/D3 competition level',
      'Biomechanics indicate excellent hip fluidity and low injury risk markers',
      'Recommend prioritizing Player #4 for evaluation — high commitment likelihood based on profile match',
    ],
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}


// In-memory job store (in production: Redis / database)
const jobs = new Map<string, AnalysisJobStatus>();

interface AnalysisJobStatus {
  jobId: string;
  videoId: string;
  sport: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  progress: number;
  stage: string;
  createdAt: string;
  completedAt?: string;
  result?: AnalysisResult;
  error?: string;
}

interface AnalysisResult {
  videoId: string;
  sport: string;
  processingTimeMs: number;
  framesProcessed: number;
  playersDetected: PlayerSummary[];
  highlights: HighlightSummary[];
  plays: PlaySummary[];
  overallGrade: string;
  aiInsights: string[];
}

interface PlayerSummary {
  trackId: number;
  teamId: number;
  detectionConfidence: number;
  framesVisible: number;
  metrics: Record<string, number>;
}

interface HighlightSummary {
  type: string;
  frameStart: number;
  frameEnd: number;
  confidence: number;
  description: string;
}

interface PlaySummary {
  type: string;
  frameStart: number;
  frameEnd: number;
  confidence: number;
}

// ─── POST: Submit analysis job ──────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { videoId, sport = 'football', priority = 'normal' } = body;

    if (!videoId) {
      return NextResponse.json({ error: 'videoId is required' }, { status: 400 });
    }

    const jobId = `job_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const job: AnalysisJobStatus = {
      jobId,
      videoId,
      sport,
      status: 'queued',
      progress: 0,
      stage: 'queued',
      createdAt: new Date().toISOString(),
    };

    jobs.set(jobId, job);

    // Simulate async processing
    simulateAnalysis(jobId);

    return NextResponse.json({
      jobId,
      status: 'queued',
      message: 'Video analysis job submitted successfully',
    }, { status: 202 });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to submit analysis job' },
      { status: 500 }
    );
  }
}

// ─── GET: Check status ──────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get('jobId');

  if (jobId) {
    const job = jobs.get(jobId);
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }
    return NextResponse.json(job);
  }

  // Return all jobs (latest first)
  const allJobs = Array.from(jobs.values())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 50);

  return NextResponse.json({ jobs: allJobs });
}

// ─── Mock Analysis Pipeline ─────────────────────────────────────────

async function simulateAnalysis(jobId: string) {
  const job = jobs.get(jobId);
  if (!job) return;

  const stages = [
    { name: 'ingesting', duration: 800 },
    { name: 'preprocessing', duration: 600 },
    { name: 'detecting_players', duration: 1500 },
    { name: 'tracking', duration: 1200 },
    { name: 'pose_estimation', duration: 1800 },
    { name: 'biomechanics', duration: 1000 },
    { name: 'sport_metrics', duration: 800 },
    { name: 'highlights', duration: 600 },
    { name: 'play_classification', duration: 700 },
    { name: 'generating_output', duration: 400 },
  ];

  job.status = 'processing';

  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i];
    job.stage = stage.name;
    job.progress = Math.round(((i + 1) / stages.length) * 100);
    await delay(stage.duration);
  }

  job.status = 'completed';
  job.progress = 100;
  job.stage = 'complete';
  job.completedAt = new Date().toISOString();
  job.result = generateMockResult(job.videoId, job.sport);
}

function generateMockResult(videoId: string, sport: string): AnalysisResult {
  return {
    videoId,
    sport,
    processingTimeMs: 9400,
    framesProcessed: 1800,
    playersDetected: [
      { trackId: 1, teamId: 0, detectionConfidence: 0.94, framesVisible: 1650, metrics: { speed: 18.2, acceleration: 4.1, distanceCovered: 342 } },
      { trackId: 2, teamId: 0, detectionConfidence: 0.91, framesVisible: 1580, metrics: { speed: 16.8, acceleration: 3.8, distanceCovered: 298 } },
      { trackId: 3, teamId: 1, detectionConfidence: 0.89, framesVisible: 1720, metrics: { speed: 17.5, acceleration: 4.3, distanceCovered: 365 } },
      { trackId: 4, teamId: 1, detectionConfidence: 0.92, framesVisible: 1490, metrics: { speed: 19.1, acceleration: 4.7, distanceCovered: 410 } },
    ],
    highlights: [
      { type: 'explosive_play', frameStart: 120, frameEnd: 210, confidence: 0.87, description: 'Player #4 explosive burst — 19.1 mph top speed, 4.7 m/s² acceleration' },
      { type: 'big_hit', frameStart: 540, frameEnd: 580, confidence: 0.82, description: 'High-impact collision at frame 560 — potential tackle showcase moment' },
      { type: 'athletic_display', frameStart: 890, frameEnd: 950, confidence: 0.79, description: 'Player #1 demonstrates elite agility — 3 direction changes in 1.2s' },
    ],
    plays: [
      { type: 'pass', frameStart: 0, frameEnd: 180, confidence: 0.91 },
      { type: 'run', frameStart: 180, frameEnd: 420, confidence: 0.85 },
      { type: 'pass', frameStart: 420, frameEnd: 600, confidence: 0.88 },
      { type: 'screen', frameStart: 600, frameEnd: 780, confidence: 0.76 },
      { type: 'run', frameStart: 780, frameEnd: 960, confidence: 0.83 },
    ],
    overallGrade: 'A-',
    aiInsights: [
      'Player #4 shows D1-caliber burst metrics — 19.1 mph peak speed places in 95th percentile for position',
      'Route separation averages 2.8 yards — above average for D2/D3 competition level',
      'Biomechanics indicate excellent hip fluidity and low injury risk markers',
      'Recommend prioritizing Player #4 for evaluation — high commitment likelihood based on academic/athletic profile match',
    ],
  };
}

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
