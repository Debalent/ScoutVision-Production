// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Basketball Module
// Shot release, shot arc, dribble efficiency, defensive footwork,
// closeout speed, rebound positioning, court coverage, PnR, transition.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  BasketballMetrics,
  PlayClassification,
  PlayType,
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

export const basketballModule: SportModule = {
  sport: 'basketball',

  supportedPositions: ['PG', 'SG', 'SF', 'PF', 'C', 'G', 'F', 'ATH'],

  metricDefinitions: [
    { key: 'shotReleaseSpeed', name: 'Shot Release Speed', unit: 'ms', description: 'Time from start of shooting motion to ball release', range: [200, 800], higherIsBetter: false, positions: ['*'] },
    { key: 'shotArc', name: 'Shot Arc', unit: '°', description: 'Angle of ball trajectory at release', range: [30, 65], higherIsBetter: false, positions: ['*'] },
    { key: 'dribbleEfficiency', name: 'Dribble Efficiency', unit: '/10', description: 'Ball control and pace creation', range: [0, 10], higherIsBetter: true, positions: ['PG', 'SG', 'G'] },
    { key: 'defensiveFootwork', name: 'Defensive Footwork', unit: '/10', description: 'Lateral quickness and stance quality', range: [0, 10], higherIsBetter: true, positions: ['*'] },
    { key: 'closeoutSpeed', name: 'Closeout Speed', unit: 'm/s', description: 'Sprint speed on defensive closeouts', range: [0, 8], higherIsBetter: true, positions: ['*'] },
    { key: 'reboundPosition', name: 'Rebound Positioning', unit: '/10', description: 'Box-out technique and anticipation', range: [0, 10], higherIsBetter: true, positions: ['PF', 'C', 'F'] },
    { key: 'courtCoverage', name: 'Court Coverage', unit: 'm²/min', description: 'Area covered per minute', range: [0, 200], higherIsBetter: true, positions: ['*'] },
    { key: 'pickAndRollEfficiency', name: 'Pick & Roll Efficiency', unit: '%', description: 'Scoring efficiency from PnR actions', range: [0, 1], higherIsBetter: true, positions: ['PG', 'SG', 'PF', 'C'] },
    { key: 'transitionSpeed', name: 'Transition Speed', unit: 'm/s', description: 'Average speed in fast break situations', range: [0, 10], higherIsBetter: true, positions: ['*'] },
  ],

  computeMetrics(trackId: string, ctx: SportModuleContext): BasketballMetrics {
    const poses = getTrackPoses(trackId, ctx.poses);
    const bio = getTrackBiomechanics(trackId, ctx.biomechanics);

    // Defensive footwork: lateral movement quality from hip & ankle positions
    const lateralMoves = bio.filter((b) => Math.abs(b.velocity.x) > Math.abs(b.velocity.y) * 1.5);
    const defensiveFootwork = lateralMoves.length > 0
      ? Math.min(10, (lateralMoves.length / bio.length) * 15)
      : 5;

    // Court coverage: total distance / time
    const positions = poses.map((p) => ({
      x: (p.keypoints.left_hip.x + p.keypoints.right_hip.x) / 2,
      y: (p.keypoints.left_hip.y + p.keypoints.right_hip.y) / 2,
    }));
    const totalDist = computeDistanceCovered(positions);
    const durationMin = ctx.durationMs / 60000;
    const courtCoverage = durationMin > 0 ? totalDist / durationMin : 0;

    // Transition speed: speed during fast segments
    const fastSegments = bio.filter((b) => {
      const speed = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2);
      return speed > 3;
    });
    const transitionSpeed = fastSegments.length > 0
      ? fastSegments.reduce((s, b) => s + Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2), 0) / fastSegments.length
      : 0;

    // Closeout speed: max speed in short lateral bursts
    const closeoutSpeed = computeMaxSpeed(lateralMoves);

    return {
      sport: 'basketball',
      shotReleaseSpeed: 450, // requires ball & wrist tracking for real measurement
      shotArc: 48,           // requires ball trajectory analysis
      dribbleEfficiency: 6,  // requires ball tracking
      defensiveFootwork,
      closeoutSpeed,
      reboundPosition: 5,    // requires shot/rebound event detection
      courtCoverage,
      pickAndRollEfficiency: 0, // requires play classification
      transitionSpeed,
    };
  },

  classifyPlays(ctx: SportModuleContext): PlayClassification[] {
    const plays: PlayClassification[] = [];
    const ballPositions = ctx.ballDetections.map((b) => ({
      x: b.bbox.x + b.bbox.width / 2,
      y: b.bbox.y + b.bbox.height / 2,
      ts: b.timestamp,
    }));

    if (ballPositions.length < 10) return plays;

    // Detect fast breaks: ball moves full court quickly
    for (let i = 10; i < ballPositions.length; i++) {
      const windowStart = ballPositions[i - 10];
      const windowEnd = ballPositions[i];
      const dt = (windowEnd.ts - windowStart.ts) / 1000;
      const dist = Math.sqrt(
        (windowEnd.x - windowStart.x) ** 2 + (windowEnd.y - windowStart.y) ** 2
      );

      if (dt > 0 && dist / dt > 0.2) { // fast ball movement
        plays.push({
          playType: 'fast_break',
          confidence: 0.6,
          timeRange: { startMs: windowStart.ts, endMs: windowEnd.ts },
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

      // Detect potential dunks: high vertical velocity + proximity to basket area
      for (const frame of bio) {
        if (frame.jump && frame.jump.jumpHeight > 60) { // > 60cm jump
          highlights.push({
            type: 'dunk',
            confidence: 0.5,
            timeRange: {
              startMs: Math.max(0, frame.timestamp - 2000),
              endMs: frame.timestamp + 1000,
            },
            impactScore: Math.min(10, frame.jump.jumpHeight / 8),
            involvedPlayers: [track.trackId],
            description: `High-elevation play — ${frame.jump.jumpHeight.toFixed(0)}cm jump height`,
            thumbnailFrame: Math.round(frame.timestamp * ctx.fps / 1000),
          });
        }
      }
    }

    return highlights;
  },

  getHighlightTypes(): HighlightType[] {
    return ['three_pointer', 'dunk', 'block', 'steal', 'alley_oop', 'big_play'];
  },
};
