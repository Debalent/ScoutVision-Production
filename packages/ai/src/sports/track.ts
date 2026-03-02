// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Track & Field Module
// Stride efficiency, split times, hurdle form, block start, max velocity,
// acceleration phase, deceleration, ground-contact asymmetry.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  TrackMetrics,
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
  computeDistanceCovered,
} from './base';

// ── Metric Definitions ──────────────────────────────────────────────────

const METRIC_DEFS: MetricDefinition[] = [
  { key: 'strideEfficiency', name: 'Stride Efficiency', unit: '/10', description: 'Overall stride quality and symmetry', range: [0, 10], higherIsBetter: true, positions: ['*'] },
  { key: 'splitTimes', name: 'Split Times', unit: 's', description: 'Segment split times', range: [0, 60], higherIsBetter: false, positions: ['*'] },
  { key: 'hurdleForm', name: 'Hurdle Form', unit: '/10', description: 'Technical quality of hurdle clearance', range: [0, 10], higherIsBetter: true, positions: ['HURDLER'] },
  { key: 'blockStart', name: 'Block Start', unit: '/10', description: 'Reaction time and drive phase quality', range: [0, 10], higherIsBetter: true, positions: ['SPRINTER', 'HURDLER'] },
  { key: 'maxVelocity', name: 'Max Velocity', unit: 'm/s', description: 'Peak running velocity', range: [0, 13], higherIsBetter: true, positions: ['*'] },
  { key: 'accelerationPhase', name: 'Acceleration Phase', unit: '/10', description: 'Quality and duration of acceleration', range: [0, 10], higherIsBetter: true, positions: ['*'] },
  { key: 'decelerationRate', name: 'Deceleration Rate', unit: 'm/s²', description: 'Speed loss in late race', range: [0, 5], higherIsBetter: false, positions: ['SPRINTER'] },
  { key: 'groundContactAsymmetry', name: 'GC Asymmetry', unit: '%', description: 'Left-right ground contact time difference', range: [0, 20], higherIsBetter: false, positions: ['*'] },
];

// ── Helpers ─────────────────────────────────────────────────────────────

interface SpeedProfile {
  time: number;
  speed: number;
}

function buildSpeedProfile(
  bio: Array<{ timestamp: number; velocity: { x: number; y: number } }>,
): SpeedProfile[] {
  return bio.map((b) => ({
    time: b.timestamp,
    speed: Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2),
  }));
}

function findPeakVelocityIndex(profile: SpeedProfile[]): number {
  let peakIdx = 0;
  for (let i = 1; i < profile.length; i++) {
    if (profile[i].speed > profile[peakIdx].speed) peakIdx = i;
  }
  return peakIdx;
}

function computeAccelerationScore(profile: SpeedProfile[]): number {
  if (profile.length < 5) return 5;

  const peakIdx = findPeakVelocityIndex(profile);
  const peakSpeed = profile[peakIdx].speed;

  // Acceleration phase: frames from start to peak
  const accelDuration = (profile[peakIdx].time - profile[0].time) / 1000;
  if (accelDuration <= 0) return 5;

  const avgAccel = peakSpeed / accelDuration;

  // Score: higher acceleration = better (elite sprinters ~4–5 m/s² avg)
  return Math.min(10, avgAccel * 2);
}

function computeDecelerationRate(profile: SpeedProfile[]): number {
  const peakIdx = findPeakVelocityIndex(profile);
  if (peakIdx >= profile.length - 2) return 0;

  const postPeak = profile.slice(peakIdx);
  const lastSpeed = postPeak[postPeak.length - 1].speed;
  const peakSpeed = postPeak[0].speed;
  const dt = (postPeak[postPeak.length - 1].time - postPeak[0].time) / 1000;

  if (dt <= 0) return 0;
  return Math.max(0, (peakSpeed - lastSpeed) / dt);
}

function computeStrideEfficiency(
  bio: Array<{ timestamp: number; velocity: { x: number; y: number }; position: { x: number; y: number } }>,
): number {
  if (bio.length < 10) return 5;

  // Measure velocity consistency (lower coefficient of variation = better)
  const speeds = bio.map((b) => Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2));
  const meanSpeed = speeds.reduce((a, b) => a + b, 0) / speeds.length;
  if (meanSpeed === 0) return 5;

  const variance = speeds.reduce((s, v) => s + (v - meanSpeed) ** 2, 0) / speeds.length;
  const cv = Math.sqrt(variance) / meanSpeed;

  // Lower CV = more efficient stride (less wasted motion)
  return Math.min(10, Math.max(0, 10 - cv * 8));
}

function computeGroundContactAsymmetry(
  poses: Array<{ keypoints: Record<string, { x: number; y: number; confidence: number }> }>,
): number {
  // Estimate left vs right ground contact by ankle vertical position patterns
  const leftAnkles = poses
    .map((p) => p.keypoints.left_ankle?.y ?? 0)
    .filter((y) => y > 0);
  const rightAnkles = poses
    .map((p) => p.keypoints.right_ankle?.y ?? 0)
    .filter((y) => y > 0);

  if (leftAnkles.length < 5 || rightAnkles.length < 5) return 0;

  // Count frames where each ankle is at "ground" level (near max y)
  const maxY = Math.max(...leftAnkles, ...rightAnkles);
  const threshold = maxY * 0.95;

  const leftGround = leftAnkles.filter((y) => y >= threshold).length;
  const rightGround = rightAnkles.filter((y) => y >= threshold).length;

  const total = leftGround + rightGround;
  if (total === 0) return 0;

  return Math.abs(leftGround - rightGround) / total * 100;
}

// ── Track Module ────────────────────────────────────────────────────────

export const trackModule: SportModule = {
  sport: 'track',

  supportedPositions: [
    'SPRINTER', 'MIDDLE_DISTANCE', 'DISTANCE', 'HURDLER',
    'JUMPER', 'THROWER', 'MULTI', 'ATH',
  ],

  metricDefinitions: METRIC_DEFS,

  computeMetrics(trackId: string, ctx: SportModuleContext): TrackMetrics {
    const poses = getTrackPoses(trackId, ctx.poses);
    const bio = getTrackBiomechanics(trackId, ctx.biomechanics);
    const speedProfile = buildSpeedProfile(bio);

    const maxVelocity = computeMaxSpeed(bio);
    const accelerationPhase = computeAccelerationScore(speedProfile);
    const decelerationRate = computeDecelerationRate(speedProfile);
    const strideEfficiency = computeStrideEfficiency(bio);
    const groundContactAsymmetry = computeGroundContactAsymmetry(poses);

    // Split times: divide into 4 equal segments
    const splitTimes: number[] = [];
    if (speedProfile.length >= 4) {
      const segSize = Math.floor(speedProfile.length / 4);
      for (let s = 0; s < 4; s++) {
        const segStart = speedProfile[s * segSize];
        const segEnd = speedProfile[Math.min((s + 1) * segSize, speedProfile.length - 1)];
        splitTimes.push((segEnd.time - segStart.time) / 1000);
      }
    }

    // Block start: quality of initial acceleration (first 10 frames)
    const startFrames = speedProfile.slice(0, Math.min(10, speedProfile.length));
    const blockStart = startFrames.length >= 2
      ? Math.min(10, (startFrames[startFrames.length - 1].speed - startFrames[0].speed) * 3)
      : 5;

    // Hurdle form: trunk stability during vertical movement phases
    let hurdleForm = 5;
    if (bio.length > 5) {
      const trunkAngles = bio
        .filter((b) => b.jointAngles)
        .map((b) => b.jointAngles?.find((j: any) => j.joint === 'trunk_lean'))
        .filter(Boolean);

      if (trunkAngles.length > 3) {
        const angles = trunkAngles.map((t: any) => t.angle);
        const mean = angles.reduce((a: number, b: number) => a + b, 0) / angles.length;
        const variance = angles.reduce((s: number, v: number) => s + (v - mean) ** 2, 0) / angles.length;
        // Lower trunk angle variance = better hurdle form
        hurdleForm = Math.min(10, Math.max(0, 10 - Math.sqrt(variance) * 0.5));
      }
    }

    return {
      sport: 'track',
      strideEfficiency,
      splitTimes,
      hurdleForm,
      blockStart,
      maxVelocity,
      accelerationPhase,
      decelerationRate,
      groundContactAsymmetry,
    };
  },

  classifyPlays(ctx: SportModuleContext): PlayClassification[] {
    // Track events are typically single continuous actions
    const plays: PlayClassification[] = [];

    if (ctx.tracks.length > 0) {
      plays.push({
        playType: 'sprint' as any,
        confidence: 0.7,
        timeRange: { startMs: 0, endMs: ctx.durationMs },
        formation: null,
        personnel: null,
        result: null,
        involvedPlayers: ctx.tracks.map((t) => t.trackId),
      });
    }

    return plays;
  },

  detectHighlights(ctx: SportModuleContext): Highlight[] {
    const highlights: Highlight[] = [];

    for (const track of ctx.tracks) {
      const bio = getTrackBiomechanics(track.trackId, ctx.biomechanics);
      const profile = buildSpeedProfile(bio);
      const maxSpeed = computeMaxSpeed(bio);

      // Peak velocity highlight
      if (maxSpeed > 9) { // elite sprint territory
        const peakIdx = findPeakVelocityIndex(profile);
        const peakTime = profile[peakIdx]?.time ?? 0;

        highlights.push({
          type: 'big_play',
          confidence: 0.75,
          timeRange: {
            startMs: Math.max(0, peakTime - 2000),
            endMs: Math.min(ctx.durationMs, peakTime + 2000),
          },
          impactScore: Math.min(10, maxSpeed / 1.2),
          involvedPlayers: [track.trackId],
          description: `Peak velocity — ${maxSpeed.toFixed(1)} m/s`,
          thumbnailFrame: Math.round(peakTime * ctx.fps / 1000),
        });
      }

      // Explosive start highlight
      if (profile.length >= 10) {
        const accelScore = computeAccelerationScore(profile);
        if (accelScore > 7) {
          highlights.push({
            type: 'big_play',
            confidence: 0.6,
            timeRange: {
              startMs: profile[0].time,
              endMs: profile[Math.min(15, profile.length - 1)].time,
            },
            impactScore: accelScore,
            involvedPlayers: [track.trackId],
            description: `Explosive block start — acceleration score ${accelScore.toFixed(1)}/10`,
            thumbnailFrame: 0,
          });
        }
      }
    }

    return highlights;
  },

  getHighlightTypes(): HighlightType[] {
    return ['personal_best', 'photo_finish', 'big_play'];
  },
};
