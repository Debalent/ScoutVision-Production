'use client';

import { useState, useEffect, useCallback } from 'react';
import { cn } from '../lib/utils';

// ─── Types ──────────────────────────────────────────────────────────

interface AnalysisJob {
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
  playersDetected: {
    trackId: number;
    teamId: number;
    detectionConfidence: number;
    framesVisible: number;
    metrics: Record<string, number>;
  }[];
  highlights: {
    type: string;
    frameStart: number;
    frameEnd: number;
    confidence: number;
    description: string;
  }[];
  plays: {
    type: string;
    frameStart: number;
    frameEnd: number;
    confidence: number;
  }[];
  overallGrade: string;
  aiInsights: string[];
}

// ─── Stage Labels ───────────────────────────────────────────────────

const STAGE_LABELS: Record<string, string> = {
  queued: 'Queued',
  ingesting: 'Ingesting Video',
  preprocessing: 'Preprocessing Frames',
  detecting_players: 'Detecting Players',
  tracking: 'Tracking Movement',
  pose_estimation: 'Estimating Poses',
  biomechanics: 'Analyzing Biomechanics',
  sport_metrics: 'Computing Metrics',
  highlights: 'Extracting Highlights',
  play_classification: 'Classifying Plays',
  generating_output: 'Generating Output',
  complete: 'Complete',
};

// ─── Main Component ─────────────────────────────────────────────────

export default function AIAnalysisPanel({ videoId }: { videoId: string }) {
  const [job, setJob] = useState<AnalysisJob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'players' | 'highlights' | 'plays'>('overview');

  const startAnalysis = useCallback(async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId, sport: 'football' }),
      });
      const data = await res.json();
      setJob({ jobId: data.jobId, videoId, sport: 'football', status: 'queued', progress: 0, stage: 'queued', createdAt: new Date().toISOString() });
    } catch {
      setIsAnalyzing(false);
    }
  }, [videoId]);

  // Poll for status
  useEffect(() => {
    if (!job || job.status === 'completed' || job.status === 'failed') return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/analysis?jobId=${job.jobId}`);
        const data: AnalysisJob = await res.json();
        setJob(data);
        if (data.status === 'completed' || data.status === 'failed') {
          setIsAnalyzing(false);
          clearInterval(interval);
        }
      } catch { /* continue polling */ }
    }, 500);

    return () => clearInterval(interval);
  }, [job]);

  // ─── No analysis yet ─────────────────────────────────────────────
  if (!job) {
    return (
      <div className="card p-6 text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-electric/10 flex items-center justify-center">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-electric">
            <path d="M12 2a4 4 0 0 1 4 4v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1V6a4 4 0 0 1 4-4z" />
            <path d="M8 7v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V7" />
            <circle cx="12" cy="16" r="3" />
            <path d="M12 19v3" /><path d="M8 22h8" />
          </svg>
        </div>
        <div>
          <p className="font-semibold text-white">AI Video Analysis</p>
          <p className="text-sm text-gray-400 mt-1">Run AI detection, tracking, pose estimation, and sport-specific metrics on this film</p>
        </div>
        <button onClick={startAnalysis} disabled={isAnalyzing} className="btn-primary text-sm px-6">
          Analyze with AI
        </button>
      </div>
    );
  }

  // ─── Processing ───────────────────────────────────────────────────
  if (job.status === 'queued' || job.status === 'processing') {
    return (
      <div className="card p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-electric animate-pulse" />
          <span className="font-semibold text-white">AI Analysis in Progress</span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{STAGE_LABELS[job.stage] || job.stage}</span>
            <span className="text-electric font-medium">{job.progress}%</span>
          </div>
          <div className="h-2 bg-charcoal rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-electric to-emerald-400 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>

        {/* Pipeline stages */}
        <div className="grid grid-cols-5 gap-1 mt-2">
          {Object.entries(STAGE_LABELS).filter(([k]) => k !== 'queued' && k !== 'complete').map(([key, label]) => {
            const stageKeys = Object.keys(STAGE_LABELS).filter(k => k !== 'queued' && k !== 'complete');
            const currentIdx = stageKeys.indexOf(job.stage);
            const thisIdx = stageKeys.indexOf(key);
            const isDone = thisIdx < currentIdx;
            const isCurrent = key === job.stage;
            return (
              <div key={key} className="text-center">
                <div className={cn(
                  'h-1 rounded-full mb-1',
                  isDone ? 'bg-green-500' : isCurrent ? 'bg-electric animate-pulse' : 'bg-charcoal'
                )} />
                <span className={cn(
                  'text-[9px] leading-tight',
                  isDone ? 'text-green-400' : isCurrent ? 'text-electric' : 'text-gray-600'
                )}>{label.split(' ').slice(0, 2).join(' ')}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── Failed ───────────────────────────────────────────────────────
  if (job.status === 'failed') {
    return (
      <div className="card p-6 border border-red-500/20">
        <p className="font-semibold text-red-400">Analysis Failed</p>
        <p className="text-sm text-gray-400 mt-1">{job.error || 'An unexpected error occurred'}</p>
        <button onClick={startAnalysis} className="btn-primary text-sm mt-3">Retry Analysis</button>
      </div>
    );
  }

  // ─── Results ──────────────────────────────────────────────────────
  const result = job.result!;

  return (
    <div className="card p-0 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="font-semibold text-white">AI Analysis Complete</span>
          <span className="text-xs text-gray-500">{(result.processingTimeMs / 1000).toFixed(1)}s</span>
        </div>
        <span className={cn(
          'text-2xl font-bold',
          result.overallGrade.startsWith('A') ? 'text-green-400' : result.overallGrade.startsWith('B') ? 'text-amber-400' : 'text-red-400'
        )}>
          {result.overallGrade}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/5">
        {(['overview', 'players', 'highlights', 'plays'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors',
              activeTab === tab
                ? 'border-electric text-electric'
                : 'border-transparent text-gray-400 hover:text-white'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'overview' && <OverviewTab result={result} />}
        {activeTab === 'players' && <PlayersTab result={result} />}
        {activeTab === 'highlights' && <HighlightsTab result={result} />}
        {activeTab === 'plays' && <PlaysTab result={result} />}
      </div>
    </div>
  );
}

// ─── Sub-tabs ───────────────────────────────────────────────────────

function OverviewTab({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-5">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        <div className="bg-charcoal rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-500">Frames</p>
          <p className="text-lg font-bold text-white">{result.framesProcessed.toLocaleString()}</p>
        </div>
        <div className="bg-charcoal rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-500">Players</p>
          <p className="text-lg font-bold text-white">{result.playersDetected.length}</p>
        </div>
        <div className="bg-charcoal rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-500">Highlights</p>
          <p className="text-lg font-bold text-electric">{result.highlights.length}</p>
        </div>
        <div className="bg-charcoal rounded-xl px-4 py-3 text-center">
          <p className="text-xs text-gray-500">Plays</p>
          <p className="text-lg font-bold text-white">{result.plays.length}</p>
        </div>
      </div>

      {/* AI Insights */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3">AI Insights</h4>
        <div className="space-y-2">
          {result.aiInsights.map((insight, i) => (
            <div key={i} className="flex gap-3 p-3 bg-electric/5 border border-electric/10 rounded-lg">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-electric flex-shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
              </svg>
              <p className="text-sm text-gray-300">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PlayersTab({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-3">
      {result.playersDetected.map((player) => (
        <div key={player.trackId} className="flex items-center gap-4 p-4 bg-charcoal rounded-xl">
          <div className={cn(
            'w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold',
            player.teamId === 0 ? 'bg-blue-500/20 text-blue-400' : 'bg-red-500/20 text-red-400'
          )}>
            #{player.trackId}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Player {player.trackId}</span>
              <span className={cn(
                'text-xs px-2 py-0.5 rounded-full',
                player.teamId === 0 ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
              )}>
                Team {player.teamId === 0 ? 'A' : 'B'}
              </span>
              <span className="text-xs text-gray-500">{(player.detectionConfidence * 100).toFixed(0)}% conf</span>
            </div>
            <div className="flex gap-4 mt-1.5">
              {Object.entries(player.metrics).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <span className="text-gray-500 capitalize">{key}: </span>
                  <span className="text-white font-medium">
                    {key === 'speed' ? `${val} mph` : key === 'acceleration' ? `${val} m/s²` : key === 'distanceCovered' ? `${val} yds` : val}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">Visible</p>
            <p className="text-sm font-medium text-white">{player.framesVisible} frames</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function HighlightsTab({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-3">
      {result.highlights.map((hl, i) => (
        <div key={i} className="p-4 bg-charcoal rounded-xl border-l-4 border-electric">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium px-2 py-0.5 bg-electric/10 text-electric rounded-full capitalize">
              {hl.type.replace(/_/g, ' ')}
            </span>
            <span className="text-xs text-gray-500">
              Frames {hl.frameStart}–{hl.frameEnd} | {(hl.confidence * 100).toFixed(0)}% conf
            </span>
          </div>
          <p className="text-sm text-gray-300">{hl.description}</p>
        </div>
      ))}
    </div>
  );
}

function PlaysTab({ result }: { result: AnalysisResult }) {
  const typeColors: Record<string, string> = {
    pass: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    run: 'bg-green-500/10 text-green-400 border-green-500/20',
    screen: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };

  return (
    <div className="space-y-2">
      {result.plays.map((play, i) => (
        <div key={i} className="flex items-center gap-4 p-3 bg-charcoal rounded-lg">
          <span className="text-xs text-gray-500 w-8">#{i + 1}</span>
          <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full border capitalize', typeColors[play.type] || 'bg-gray-500/10 text-gray-400 border-gray-500/20')}>
            {play.type}
          </span>
          <div className="flex-1 h-1.5 bg-navy rounded-full overflow-hidden">
            <div
              className="h-full bg-electric/40 rounded-full"
              style={{ width: `${play.confidence * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500 w-20 text-right">
            {play.frameStart}–{play.frameEnd}
          </span>
          <span className="text-xs font-medium text-white w-10 text-right">
            {(play.confidence * 100).toFixed(0)}%
          </span>
        </div>
      ))}
    </div>
  );
}
