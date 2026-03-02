// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Soccer Module
// Sprint acceleration, pressing intensity, off-ball movement, xG,
// distance covered, high-intensity runs, tackle success, cross accuracy.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  SoccerMetrics,
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
  computeAvgSpeed,
} from './base';

// ── Metric Definitions ──────────────────────────────────────────────────

const METRIC_DEFS: MetricDefinition[] = [
  { key: 'sprintAcceleration', name: 'Sprint Acceleration', unit: 'm/s²', description: 'Peak acceleration during sprints', range: [0, 8], higherIsBetter: true, positions: ['*'] },
  { key: 'pressingIntensity', name: 'Pressing Intensity', unit: '/10', description: 'Frequency and quality of pressing actions', range: [0, 10], higherIsBetter: true, positions: ['*'] },
  { key: 'offBallMovement', name: 'Off-Ball Movement', unit: '/10', description: 'Quality of runs without the ball', range: [0, 10], higherIsBetter: true, positions: ['*'] },
  { key: 'passCompletionRate', name: 'Pass Completion', unit: '%', description: 'Percentage of successful passes', range: [0, 1], higherIsBetter: true, positions: ['*'] },
  { key: 'xG', name: 'Expected Goals', unit: 'xG', description: 'Quality of scoring chances created/taken', range: [0, 3], higherIsBetter: true, positions: ['ST', 'CF', 'LW', 'RW', 'CAM'] },
  { key: 'distanceCovered', name: 'Distance Covered', unit: 'km', description: 'Total distance covered during analysis', range: [0, 14], higherIsBetter: true, positions: ['*'] },
  { key: 'highIntensityRuns', name: 'High-Intensity Runs', unit: 'count', description: 'Number of sprints above 5.5 m/s', range: [0, 60], higherIsBetter: true, positions: ['*'] },
  { key: 'tackleSuccessRate', name: 'Tackle Success', unit: '%', description: 'Percentage of successful tackles', range: [0, 1], higherIsBetter: true, positions: ['CB', 'LB', 'RB', 'CDM'] },
  { key: 'crossAccuracy', name: 'Cross Accuracy', unit: '%', description: 'Percentage of successful crosses', range: [0, 1], higherIsBetter: true, positions: ['LB', 'RB', 'LW', 'RW', 'LM', 'RM'] },
];

// ── Soccer Module ───────────────────────────────────────────────────────

export const soccerModule: SportModule = {
  sport: 'soccer',

  supportedPositions: [
    'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM',
    'LM', 'RM', 'LW', 'RW', 'ST', 'CF', 'ATH',
  ],

  metricDefinitions: METRIC_DEFS,

  computeMetrics(trackId: string, ctx: SportModuleContext): SoccerMetrics {
    const poses = getTrackPoses(trackId, ctx.poses);
    const bio = getTrackBiomechanics(trackId, ctx.biomechanics);

    // Sprint acceleration: peak acceleration across frames
    let peakAccel = 0;
    for (let i = 1; i < bio.length; i++) {
      const accel = Math.sqrt(
        bio[i].acceleration.x ** 2 + bio[i].acceleration.y ** 2
      );
      if (accel > peakAccel) peakAccel = accel;
    }

    // High-intensity runs: count contiguous segments above 5.5 m/s
    let highIntensityRuns = 0;
    let inSprint = false;
    for (const frame of bio) {
      const speed = Math.sqrt(frame.velocity.x ** 2 + frame.velocity.y ** 2);
      if (speed > 5.5 && !inSprint) {
        highIntensityRuns++;
        inSprint = true;
      } else if (speed <= 4.0) {
        inSprint = false;
      }
    }

    // Distance covered
    const positions = poses.map((p) => ({
      x: (p.keypoints.left_hip.x + p.keypoints.right_hip.x) / 2,
      y: (p.keypoints.left_hip.y + p.keypoints.right_hip.y) / 2,
    }));
    const distM = computeDistanceCovered(positions);
    const distKm = distM / 1000;

    // Pressing intensity: periods where player moves toward ball at high speed
    const ballPositions = ctx.ballDetections.map((b) => ({
      x: b.bbox.x + b.bbox.width / 2,
      y: b.bbox.y + b.bbox.height / 2,
      ts: b.timestamp,
    }));

    let pressingActions = 0;
    for (let i = 1; i < bio.length; i++) {
      const speed = Math.sqrt(bio[i].velocity.x ** 2 + bio[i].velocity.y ** 2);
      if (speed < 3) continue;

      // Check if moving toward ball
      const closestBall = ballPositions.reduce(
        (best, bp) => {
          const d = Math.abs(bp.ts - bio[i].timestamp);
          return d < best.d ? { d, bp } : best;
        },
        { d: Infinity, bp: null as any }
      );

      if (closestBall.bp) {
        const playerPos = { x: bio[i].position.x, y: bio[i].position.y };
        const prevPos = { x: bio[i - 1].position.x, y: bio[i - 1].position.y };
        const distToBallNow = Math.sqrt(
          (playerPos.x - closestBall.bp.x) ** 2 +
          (playerPos.y - closestBall.bp.y) ** 2
        );
        const distToBallPrev = Math.sqrt(
          (prevPos.x - closestBall.bp.x) ** 2 +
          (prevPos.y - closestBall.bp.y) ** 2
        );
        if (distToBallNow < distToBallPrev && speed > 4) {
          pressingActions++;
        }
      }
    }
    const pressingIntensity = Math.min(10, (pressingActions / Math.max(1, bio.length)) * 100);

    // Off-ball movement: lateral + forward runs when ball is far
    let offBallMoves = 0;
    for (const frame of bio) {
      const speed = Math.sqrt(frame.velocity.x ** 2 + frame.velocity.y ** 2);
      if (speed > 2) offBallMoves++;
    }
    const offBallMovement = Math.min(10, (offBallMoves / Math.max(1, bio.length)) * 12);

    return {
      sport: 'soccer',
      sprintAcceleration: peakAccel,
      pressingIntensity,
      offBallMovement,
      passCompletionRate: 0, // requires event-level pass data
      xG: 0,                 // requires shot/goal event data
      distanceCovered: distKm,
      highIntensityRuns,
      tackleSuccessRate: 0,  // requires tackle event data
      crossAccuracy: 0,      // requires cross event data
    };
  },

  classifyPlays(ctx: SportModuleContext): PlayClassification[] {
    const plays: PlayClassification[] = [];
    const ballPositions = ctx.ballDetections.map((b) => ({
      x: b.bbox.x + b.bbox.width / 2,
      y: b.bbox.y + b.bbox.height / 2,
      ts: b.timestamp,
    }));

    if (ballPositions.length < 5) return plays;

    // Detect counter attacks: rapid ball movement from defense to attack
    for (let i = 5; i < ballPositions.length; i++) {
      const segment = ballPositions.slice(i - 5, i + 1);
      const dy = segment[segment.length - 1].y - segment[0].y;
      const dt = (segment[segment.length - 1].ts - segment[0].ts) / 1000;

      if (dt > 0 && Math.abs(dy) / dt > 0.15) {
        plays.push({
          playType: 'counter_attack',
          confidence: 0.55,
          timeRange: { startMs: segment[0].ts, endMs: segment[segment.length - 1].ts },
          formation: null,
          personnel: null,
          result: null,
          involvedPlayers: [],
        });
      }
    }

    // Detect set pieces: ball stationary then moving
    for (let i = 3; i < ballPositions.length - 3; i++) {
      const before = ballPositions.slice(i - 3, i);
      const after = ballPositions.slice(i, i + 3);
      const beforeMovement = before.reduce((s, p, j) => {
        if (j === 0) return 0;
        return s + Math.sqrt((p.x - before[j - 1].x) ** 2 + (p.y - before[j - 1].y) ** 2);
      }, 0);
      const afterMovement = after.reduce((s, p, j) => {
        if (j === 0) return 0;
        return s + Math.sqrt((p.x - after[j - 1].x) ** 2 + (p.y - after[j - 1].y) ** 2);
      }, 0);

      if (beforeMovement < 0.01 && afterMovement > 0.05) {
        plays.push({
          playType: 'free_kick',
          confidence: 0.45,
          timeRange: { startMs: before[0].ts, endMs: after[after.length - 1].ts },
          formation: null,
          personnel: null,
          result: null,
          involvedPlayers: [],
        });
      }
    }

    return plays;
  },

  detectHighlights(ctx: SportModuleContext): Highlight[] {
    const highlights: Highlight[] = [];

    for (const track of ctx.tracks) {
      const bio = getTrackBiomechanics(track.trackId, ctx.biomechanics);
      const maxSpeed = computeMaxSpeed(bio);

      // Detect sprint highlights
      if (maxSpeed > 8) {
        const fastestFrame = bio.reduce((best, f) => {
          const s = Math.sqrt(f.velocity.x ** 2 + f.velocity.y ** 2);
          return s > best.s ? { s, f } : best;
        }, { s: 0, f: bio[0] });

        highlights.push({
          type: 'big_play',
          confidence: 0.6,
          timeRange: {
            startMs: Math.max(0, fastestFrame.f.timestamp - 3000),
            endMs: fastestFrame.f.timestamp + 2000,
          },
          impactScore: Math.min(10, maxSpeed / 1.1),
          involvedPlayers: [track.trackId],
          description: `Explosive sprint — ${maxSpeed.toFixed(1)} m/s peak speed`,
          thumbnailFrame: Math.round(fastestFrame.f.timestamp * ctx.fps / 1000),
        });
      }
    }

    return highlights;
  },

  getHighlightTypes(): HighlightType[] {
    return ['goal', 'assist', 'tackle', 'save', 'big_play'];
  },
};
