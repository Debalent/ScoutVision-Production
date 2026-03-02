// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Baseball Module
// Pitch velocity, spin, break, bat speed, launch angle, exit velocity,
// swing path, reaction time, catcher pop time.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  BaseballMetrics,
  PlayClassification,
  Highlight,
  HighlightType,
} from '../types';
import {
  type SportModule,
  type SportModuleContext,
  type MetricDefinition,
  getTrackPoses,
  getTrackBiomechanics,
  computeMaxSpeed,
} from './base';

// ── Metric Definitions ──────────────────────────────────────────────────

const METRIC_DEFS: MetricDefinition[] = [
  { key: 'pitchVelocity', name: 'Pitch Velocity', unit: 'mph', description: 'Peak fastball velocity', range: [50, 105], higherIsBetter: true, positions: ['P', 'SP', 'RP'] },
  { key: 'pitchSpin', name: 'Pitch Spin Rate', unit: 'rpm', description: 'Spin rate on primary pitch', range: [1000, 3500], higherIsBetter: true, positions: ['P', 'SP', 'RP'] },
  { key: 'pitchBreak', name: 'Pitch Break', unit: 'in', description: 'Movement on breaking ball', range: [0, 24], higherIsBetter: true, positions: ['P', 'SP', 'RP'] },
  { key: 'batSpeed', name: 'Bat Speed', unit: 'mph', description: 'Bat speed through the zone', range: [40, 90], higherIsBetter: true, positions: ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'] },
  { key: 'launchAngle', name: 'Launch Angle', unit: '°', description: 'Average launch angle', range: [-10, 50], higherIsBetter: false, positions: ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'] },
  { key: 'exitVelocity', name: 'Exit Velocity', unit: 'mph', description: 'Ball speed off the bat', range: [50, 120], higherIsBetter: true, positions: ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'] },
  { key: 'swingPath', name: 'Swing Path Efficiency', unit: '/10', description: 'Bat path quality and timing', range: [0, 10], higherIsBetter: true, positions: ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'] },
  { key: 'reactionTime', name: 'Reaction Time', unit: 'ms', description: 'Time from pitch release to swing initiation', range: [100, 400], higherIsBetter: false, positions: ['C', '1B', '2B', '3B', 'SS', 'LF', 'CF', 'RF', 'DH'] },
  { key: 'catcherPopTime', name: 'Pop Time', unit: 's', description: 'Catcher pitch-to-base time', range: [1.6, 2.5], higherIsBetter: false, positions: ['C'] },
];

// ── Helpers ─────────────────────────────────────────────────────────────

function estimatePitchVelocity(
  ballDetections: SportModuleContext['ballDetections'],
): number {
  // Find fastest ball segment (pitch-like motion — near-horizontal, rapid)
  let maxVel = 0;
  for (let i = 1; i < ballDetections.length; i++) {
    const prev = ballDetections[i - 1];
    const curr = ballDetections[i];
    const dt = (curr.timestamp - prev.timestamp) / 1000;
    if (dt <= 0 || dt > 1) continue;

    const dx = (curr.bbox.x + curr.bbox.width / 2) - (prev.bbox.x + prev.bbox.width / 2);
    const dy = (curr.bbox.y + curr.bbox.height / 2) - (prev.bbox.y + prev.bbox.height / 2);
    const dist = Math.sqrt(dx ** 2 + dy ** 2);

    // Convert pixel velocity to approximate mph (rough calibration)
    const pixVel = dist / dt;
    if (pixVel > maxVel) maxVel = pixVel;
  }

  // Rough pixel-to-mph mapping (calibration dependent)
  return Math.min(105, maxVel * 0.08);
}

function estimateSwingMetrics(
  trackId: string,
  ctx: SportModuleContext,
): { batSpeed: number; swingPath: number; reactionTime: number } {
  const bio = getTrackBiomechanics(trackId, ctx.biomechanics);

  // Swing detection: rapid wrist/hand movement
  let maxWristSpeed = 0;
  for (const frame of bio) {
    // Use upper body acceleration as proxy for swing
    const upperBodySpeed = Math.sqrt(
      frame.velocity.x ** 2 + frame.velocity.y ** 2
    );
    if (upperBodySpeed > maxWristSpeed) maxWristSpeed = upperBodySpeed;
  }

  return {
    batSpeed: Math.min(90, maxWristSpeed * 8),  // proxy
    swingPath: Math.min(10, maxWristSpeed * 1.2),
    reactionTime: 250, // requires precise pitch-release detection
  };
}

// ── Baseball Module ─────────────────────────────────────────────────────

export const baseballModule: SportModule = {
  sport: 'baseball',

  supportedPositions: [
    'P', 'SP', 'RP', 'C', '1B', '2B', '3B', 'SS',
    'LF', 'CF', 'RF', 'DH', 'ATH',
  ],

  metricDefinitions: METRIC_DEFS,

  computeMetrics(trackId: string, ctx: SportModuleContext): BaseballMetrics {
    const pitchVelocity = estimatePitchVelocity(ctx.ballDetections);
    const swing = estimateSwingMetrics(trackId, ctx);
    const bio = getTrackBiomechanics(trackId, ctx.biomechanics);

    // Catcher pop time: time between catch-like and throw-like motions
    // (simplified — real implementation needs event detection)
    let catcherPopTime = 2.0;
    for (let i = 1; i < bio.length; i++) {
      const speed = Math.sqrt(bio[i].velocity.x ** 2 + bio[i].velocity.y ** 2);
      if (speed > 3) {
        // Found rapid arm motion — approximate throw
        const dt = (bio[i].timestamp - bio[0].timestamp) / 1000;
        if (dt > 1.5 && dt < 2.5) {
          catcherPopTime = dt;
          break;
        }
      }
    }

    return {
      sport: 'baseball',
      pitchVelocity,
      pitchSpin: 2200,     // requires high-speed camera data
      pitchBreak: 14,       // requires trajectory analysis
      batSpeed: swing.batSpeed,
      launchAngle: 12,      // requires ball trajectory post-contact
      exitVelocity: pitchVelocity > 0 ? swing.batSpeed * 1.2 : 0, // rough proxy
      swingPath: swing.swingPath,
      reactionTime: swing.reactionTime,
      catcherPopTime,
    };
  },

  classifyPlays(ctx: SportModuleContext): PlayClassification[] {
    const plays: PlayClassification[] = [];
    const ballPositions = ctx.ballDetections.map((b) => ({
      x: b.bbox.x + b.bbox.width / 2,
      y: b.bbox.y + b.bbox.height / 2,
      ts: b.timestamp,
    }));

    if (ballPositions.length < 3) return plays;

    // Segment at-bats by gaps in ball tracking (ball leaves frame between pitches)
    let segStart = 0;
    for (let i = 1; i < ballPositions.length; i++) {
      const gap = ballPositions[i].ts - ballPositions[i - 1].ts;
      if (gap > 3000 || i === ballPositions.length - 1) {
        // End of segment
        const segment = ballPositions.slice(segStart, i);
        if (segment.length >= 2) {
          plays.push({
            playType: 'pitch',
            confidence: 0.6,
            timeRange: {
              startMs: segment[0].ts,
              endMs: segment[segment.length - 1].ts,
            },
            formation: null,
            personnel: null,
            result: null,
            involvedPlayers: [],
          });
        }
        segStart = i;
      }
    }

    return plays;
  },

  detectHighlights(ctx: SportModuleContext): Highlight[] {
    const highlights: Highlight[] = [];

    // Detect high exit velocity events (proxy for hard hits)
    const ballSpeeds: { speed: number; ts: number }[] = [];
    for (let i = 1; i < ctx.ballDetections.length; i++) {
      const prev = ctx.ballDetections[i - 1];
      const curr = ctx.ballDetections[i];
      const dt = (curr.timestamp - prev.timestamp) / 1000;
      if (dt <= 0 || dt > 0.5) continue;

      const dx = (curr.bbox.x + curr.bbox.width / 2) - (prev.bbox.x + prev.bbox.width / 2);
      const dy = (curr.bbox.y + curr.bbox.height / 2) - (prev.bbox.y + prev.bbox.height / 2);
      const speed = Math.sqrt(dx ** 2 + dy ** 2) / dt;
      ballSpeeds.push({ speed, ts: curr.timestamp });
    }

    // Find peak ball speed moments (potential home runs, hard hits)
    const threshold = ballSpeeds.length > 0
      ? ballSpeeds.reduce((max, s) => Math.max(max, s.speed), 0) * 0.8
      : Infinity;

    for (const s of ballSpeeds) {
      if (s.speed >= threshold && s.speed > 100) {
        highlights.push({
          type: 'home_run',
          confidence: 0.4,
          timeRange: {
            startMs: Math.max(0, s.ts - 3000),
            endMs: s.ts + 5000,
          },
          impactScore: Math.min(10, s.speed / 50),
          involvedPlayers: [],
          description: `Hard contact — high ball exit speed detected`,
          thumbnailFrame: Math.round(s.ts * ctx.fps / 1000),
        });
      }
    }

    return highlights;
  },

  getHighlightTypes(): HighlightType[] {
    return ['home_run', 'strikeout', 'diving_catch', 'double_play', 'big_play'];
  },
};
