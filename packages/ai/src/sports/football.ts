// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Football Module
// Route separation, burst, pocket movement, tackling form, pass rush,
// completion rate, depth of target, time to throw, YAC, break tackle.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  FootballMetrics,
  PlayClassification,
  PlayType,
  Highlight,
  HighlightType,
  TimeRange,
} from '../types';
import {
  type SportModule,
  type SportModuleContext,
  type MetricDefinition,
  getTrackPoses,
  getTrackBiomechanics,
  computeMaxSpeed,
  computeAvgSpeed,
  computeDistanceCovered,
} from './base';

export const footballModule: SportModule = {
  sport: 'football',

  supportedPositions: [
    'QB', 'RB', 'WR', 'TE', 'OL',
    'DE', 'DT', 'LB', 'CB', 'S',
    'K', 'P', 'ATH',
  ],

  metricDefinitions: [
    { key: 'routeSeparation', name: 'Route Separation', unit: 'yards', description: 'Average distance from nearest defender at catch point', range: [0, 10], higherIsBetter: true, positions: ['WR', 'TE', 'RB'] },
    { key: 'burstScore', name: 'Burst Score', unit: '/10', description: 'Explosive acceleration ability', range: [0, 10], higherIsBetter: true, positions: ['*'] },
    { key: 'pocketMovement', name: 'Pocket Movement', unit: 'yards', description: 'Total distance traveled in pocket', range: [0, 15], higherIsBetter: false, positions: ['QB'] },
    { key: 'tacklingForm', name: 'Tackling Form', unit: '/10', description: 'Technical quality of tackle mechanics', range: [0, 10], higherIsBetter: true, positions: ['LB', 'DE', 'DT', 'CB', 'S'] },
    { key: 'passRushWinRate', name: 'Pass Rush Win Rate', unit: '%', description: 'Percentage of snaps beating the blocker', range: [0, 1], higherIsBetter: true, positions: ['DE', 'DT', 'LB'] },
    { key: 'completionRate', name: 'Completion Rate', unit: '%', description: 'Passes completed / attempts', range: [0, 1], higherIsBetter: true, positions: ['QB'] },
    { key: 'avgDepthOfTarget', name: 'Average Depth of Target', unit: 'yards', description: 'Average air distance on passes', range: [0, 40], higherIsBetter: false, positions: ['QB'] },
    { key: 'timeToThrow', name: 'Time to Throw', unit: 'sec', description: 'Snap to throw release', range: [1, 6], higherIsBetter: false, positions: ['QB'] },
    { key: 'yardsAfterCatch', name: 'Yards After Catch', unit: 'yards', description: 'Average yards gained after reception', range: [0, 20], higherIsBetter: true, positions: ['WR', 'TE', 'RB'] },
    { key: 'breakTackleRate', name: 'Break Tackle Rate', unit: '%', description: 'Percentage of contact situations where tackle is broken', range: [0, 1], higherIsBetter: true, positions: ['RB', 'WR', 'TE'] },
  ],

  computeMetrics(trackId: string, ctx: SportModuleContext): FootballMetrics {
    const poses = getTrackPoses(trackId, ctx.poses);
    const bio = getTrackBiomechanics(trackId, ctx.biomechanics);

    // Burst score: based on max acceleration in first 3 seconds
    const earlyBio = bio.filter((b) => b.timestamp < bio[0]?.timestamp + 3000);
    const maxAccel = earlyBio.length > 0
      ? Math.max(...earlyBio.map((b) => Math.sqrt(b.acceleration.x ** 2 + b.acceleration.y ** 2)))
      : 0;
    const burstScore = Math.min(10, maxAccel / 3 * 10);

    // Route separation: avg distance from nearest non-teammate at end of route
    const routeSeparation = this.estimateRouteSeparation(trackId, ctx);

    // Pocket movement: total distance for QB in pocket phase
    const pocketPositions = poses.slice(0, Math.min(60, poses.length)) // first ~2 seconds
      .map((p) => ({ x: p.keypoints.left_hip.x, y: p.keypoints.left_hip.y }));
    const pocketMovement = computeDistanceCovered(pocketPositions) * 10; // to yards

    return {
      sport: 'football',
      routeSeparation,
      burstScore,
      pocketMovement,
      tacklingForm: this.estimateTacklingForm(bio),
      passRushWinRate: 0, // requires play-level annotation
      completionRate: 0,  // requires play-level annotation
      avgDepthOfTarget: 0, // requires ball tracking
      timeToThrow: 0,      // requires snap detection
      yardsAfterCatch: 0,  // requires catch event detection
      breakTackleRate: 0,  // requires contact event detection
    };
  },

  classifyPlays(ctx: SportModuleContext): PlayClassification[] {
    const plays: PlayClassification[] = [];
    const tracks = ctx.tracks.filter((t) => t.detections.length > 10);

    // Simple heuristic: if ball moves forward quickly → pass play
    // If ball carrier runs → run play
    const ballPositions = ctx.ballDetections.map((b) => ({
      x: b.bbox.x + b.bbox.width / 2,
      y: b.bbox.y + b.bbox.height / 2,
      ts: b.timestamp,
    }));

    if (ballPositions.length < 5) return plays;

    // Segment into plays by detecting dead-ball periods
    const playSegments = segmentPlays(ballPositions);

    for (const segment of playSegments) {
      const ballMovement = Math.abs(segment.end.y - segment.start.y);
      const lateralMovement = Math.abs(segment.end.x - segment.start.x);
      const verticalSpeed = ballMovement / (segment.duration / 1000);

      let playType: PlayType;
      let confidence: number;

      if (verticalSpeed > 0.3) {
        playType = 'pass_play';
        confidence = 0.7;
      } else if (lateralMovement > 0.1) {
        playType = 'screen';
        confidence = 0.5;
      } else {
        playType = 'run_play';
        confidence = 0.6;
      }

      plays.push({
        playType,
        confidence,
        timeRange: { startMs: segment.startMs, endMs: segment.endMs },
        formation: null,
        personnel: null,
        result: null,
        involvedPlayers: tracks.map((t) => t.trackId),
      });
    }

    return plays;
  },

  detectHighlights(ctx: SportModuleContext): Highlight[] {
    const highlights: Highlight[] = [];

    // Detect big plays based on ball speed + player acceleration
    for (const track of ctx.tracks) {
      const bio = getTrackBiomechanics(track.trackId, ctx.biomechanics);
      const maxSpeed = computeMaxSpeed(bio);

      if (maxSpeed > 8) { // > 8 m/s ≈ fast breakaway
        const peakFrame = bio.reduce((best, b) => {
          const speed = Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2);
          return speed > Math.sqrt(best.velocity.x ** 2 + best.velocity.y ** 2) ? b : best;
        }, bio[0]);

        highlights.push({
          type: 'big_play',
          confidence: 0.6,
          timeRange: {
            startMs: Math.max(0, peakFrame.timestamp - 3000),
            endMs: peakFrame.timestamp + 2000,
          },
          impactScore: Math.min(10, maxSpeed / 1.0),
          involvedPlayers: [track.trackId],
          description: `Explosive play — ${track.jerseyNumber ? '#' + track.jerseyNumber : 'player'} reached ${maxSpeed.toFixed(1)} m/s`,
          thumbnailFrame: Math.round(peakFrame.timestamp * ctx.fps / 1000),
        });
      }
    }

    return highlights;
  },

  getHighlightTypes(): HighlightType[] {
    return ['touchdown', 'interception', 'sack', 'big_hit', 'big_play', 'momentum_shift'];
  },

  // ── Private helpers ──

  estimateRouteSeparation(trackId: string, ctx: SportModuleContext): number {
    const trackPoses = getTrackPoses(trackId, ctx.poses);
    if (trackPoses.length < 5) return 0;

    // Estimate by looking at min distance to other tracks at route endpoint
    const endPose = trackPoses[trackPoses.length - 1];
    const endPos = {
      x: (endPose.keypoints.left_hip.x + endPose.keypoints.right_hip.x) / 2,
      y: (endPose.keypoints.left_hip.y + endPose.keypoints.right_hip.y) / 2,
    };

    let minDist = Infinity;
    for (const otherTrack of ctx.tracks) {
      if (otherTrack.trackId === trackId) continue;
      if (otherTrack.teamId === ctx.tracks.find((t) => t.trackId === trackId)?.teamId) continue;

      const otherPoses = getTrackPoses(otherTrack.trackId, ctx.poses);
      const closestToEnd = otherPoses.reduce((best, p) => {
        const dist = Math.abs(p.timestamp - endPose.timestamp);
        return dist < Math.abs(best.timestamp - endPose.timestamp) ? p : best;
      }, otherPoses[0]);

      if (!closestToEnd) continue;
      const otherPos = {
        x: (closestToEnd.keypoints.left_hip.x + closestToEnd.keypoints.right_hip.x) / 2,
        y: (closestToEnd.keypoints.left_hip.y + closestToEnd.keypoints.right_hip.y) / 2,
      };

      const dist = Math.sqrt((endPos.x - otherPos.x) ** 2 + (endPos.y - otherPos.y) ** 2);
      minDist = Math.min(minDist, dist);
    }

    return minDist === Infinity ? 0 : minDist * 53.3; // convert to yards (field width approximation)
  },

  estimateTacklingForm(bio: import('../types').BiomechanicsFrame[]): number {
    if (bio.length === 0) return 5;
    // Good tackling form: low center of mass, wide base, forward lean
    const avgPosture = bio.reduce((s, b) => {
      const hipWidth = Math.abs(
        (b.jointAngles.find((j) => j.joint === 'left_hip')?.angle ?? 90) -
        (b.jointAngles.find((j) => j.joint === 'right_hip')?.angle ?? 90)
      );
      return s + (hipWidth > 10 ? 1 : 0.5);
    }, 0) / bio.length;
    return Math.min(10, avgPosture * 10);
  },
} as SportModule & {
  estimateRouteSeparation: (trackId: string, ctx: SportModuleContext) => number;
  estimateTacklingForm: (bio: import('../types').BiomechanicsFrame[]) => number;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

interface PlaySegment {
  start: { x: number; y: number };
  end: { x: number; y: number };
  startMs: number;
  endMs: number;
  duration: number;
}

function segmentPlays(
  positions: Array<{ x: number; y: number; ts: number }>
): PlaySegment[] {
  const segments: PlaySegment[] = [];
  let segStart = 0;

  for (let i = 1; i < positions.length; i++) {
    const dt = positions[i].ts - positions[i - 1].ts;
    // Gap > 3 seconds = new play
    if (dt > 3000 || i === positions.length - 1) {
      if (i - segStart > 3) {
        segments.push({
          start: positions[segStart],
          end: positions[i - 1],
          startMs: positions[segStart].ts,
          endMs: positions[i - 1].ts,
          duration: positions[i - 1].ts - positions[segStart].ts,
        });
      }
      segStart = i;
    }
  }

  return segments;
}
