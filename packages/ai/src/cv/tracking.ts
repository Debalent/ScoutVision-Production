// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Multi-Object Tracker
// Deep SORT / ByteTrack hybrid for robust multi-player tracking across
// occlusions, camera cuts, and fast motion. Maintains persistent track IDs.
// ═══════════════════════════════════════════════════════════════════════════

import type { PlayerDetection, PlayerTrack, BoundingBox } from '../types';
import { computeIoU } from './detection';

// ─── Configuration ──────────────────────────────────────────────────────────

export interface TrackerConfig {
  maxAge: number;              // frames before track is killed
  minHits: number;             // minimum detections before track is confirmed
  iouThreshold: number;        // IoU threshold for matching
  reidThreshold: number;       // cosine similarity threshold for re-ID
  maxTracklets: number;        // max concurrent tracks
  useReID: boolean;            // use appearance-based re-identification
  kalmanNoise: number;         // process noise for Kalman filter
}

export const DEFAULT_TRACKER_CONFIG: TrackerConfig = {
  maxAge: 30,
  minHits: 3,
  iouThreshold: 0.3,
  reidThreshold: 0.5,
  maxTracklets: 50,
  useReID: true,
  kalmanNoise: 0.05,
};

// ─── Kalman Filter State ────────────────────────────────────────────────────

interface KalmanState {
  x: number;  // center x
  y: number;  // center y
  w: number;  // width
  h: number;  // height
  vx: number; // velocity x
  vy: number; // velocity y
  vw: number; // velocity w
  vh: number; // velocity h
}

function initKalman(bbox: BoundingBox): KalmanState {
  return {
    x: bbox.x + bbox.width / 2,
    y: bbox.y + bbox.height / 2,
    w: bbox.width,
    h: bbox.height,
    vx: 0, vy: 0, vw: 0, vh: 0,
  };
}

function predictKalman(state: KalmanState, noise: number): KalmanState {
  return {
    x: state.x + state.vx,
    y: state.y + state.vy,
    w: Math.max(state.w + state.vw, 0.01),
    h: Math.max(state.h + state.vh, 0.01),
    vx: state.vx * (1 - noise),
    vy: state.vy * (1 - noise),
    vw: state.vw * (1 - noise),
    vh: state.vh * (1 - noise),
  };
}

function updateKalman(state: KalmanState, bbox: BoundingBox, alpha: number): KalmanState {
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  return {
    x: state.x + alpha * (cx - state.x),
    y: state.y + alpha * (cy - state.y),
    w: state.w + alpha * (bbox.width - state.w),
    h: state.h + alpha * (bbox.height - state.h),
    vx: state.vx + alpha * (cx - state.x),
    vy: state.vy + alpha * (cy - state.y),
    vw: state.vw + alpha * (bbox.width - state.w),
    vh: state.vh + alpha * (bbox.height - state.h),
  };
}

function kalmanToBBox(state: KalmanState): BoundingBox {
  return {
    x: state.x - state.w / 2,
    y: state.y - state.h / 2,
    width: state.w,
    height: state.h,
    confidence: 1.0,
  };
}

// ─── Tracklet ───────────────────────────────────────────────────────────────

interface Tracklet {
  trackId: string;
  state: KalmanState;
  detections: PlayerDetection[];
  age: number;                // frames since last match
  hits: number;               // total successful matches
  confirmed: boolean;
  teamId: string | null;
  jerseyNumber: number | null;
  reidFeature: Float32Array | null; // appearance embedding
}

// ─── Tracker ────────────────────────────────────────────────────────────────

export class MultiObjectTracker {
  private tracklets: Tracklet[] = [];
  private nextId = 0;
  private config: TrackerConfig;
  private frameCount = 0;

  constructor(config: Partial<TrackerConfig> = {}) {
    this.config = { ...DEFAULT_TRACKER_CONFIG, ...config };
  }

  /**
   * Process detections for one frame and return updated detections
   * with assigned track IDs.
   */
  update(
    detections: PlayerDetection[],
    reidFeatures?: Float32Array[]
  ): PlayerDetection[] {
    this.frameCount++;
    const players = detections.filter((d) => d.classification === 'player');
    const nonPlayers = detections.filter((d) => d.classification !== 'player');

    // 1. Predict all tracklets forward
    for (const t of this.tracklets) {
      t.state = predictKalman(t.state, this.config.kalmanNoise);
      t.age++;
    }

    // 2. Compute cost matrix (IoU + optional ReID)
    const costMatrix = this.computeCostMatrix(players, reidFeatures);

    // 3. Hungarian-style greedy matching
    const { matched, unmatchedDetections, unmatchedTracklets } =
      this.greedyMatch(costMatrix, players.length, this.tracklets.length);

    // 4. Update matched tracklets
    for (const [detIdx, trackIdx] of matched) {
      const tracklet = this.tracklets[trackIdx];
      const det = players[detIdx];
      tracklet.state = updateKalman(tracklet.state, det.bbox, 0.6);
      tracklet.age = 0;
      tracklet.hits++;
      tracklet.confirmed = tracklet.hits >= this.config.minHits;
      if (det.teamId) tracklet.teamId = det.teamId;
      if (det.jerseyNumber) tracklet.jerseyNumber = det.jerseyNumber;
      if (reidFeatures?.[detIdx]) tracklet.reidFeature = reidFeatures[detIdx];

      // Assign track ID to detection
      det.trackId = tracklet.trackId;
      det.teamId = tracklet.teamId;
      det.jerseyNumber = tracklet.jerseyNumber;
      tracklet.detections.push(det);
    }

    // 5. Create new tracklets for unmatched detections
    for (const detIdx of unmatchedDetections) {
      if (this.tracklets.length >= this.config.maxTracklets) break;
      const det = players[detIdx];
      const trackId = `t_${this.nextId++}`;
      det.trackId = trackId;

      this.tracklets.push({
        trackId,
        state: initKalman(det.bbox),
        detections: [det],
        age: 0,
        hits: 1,
        confirmed: false,
        teamId: det.teamId,
        jerseyNumber: det.jerseyNumber,
        reidFeature: reidFeatures?.[detIdx] ?? null,
      });
    }

    // 6. Remove dead tracklets
    this.tracklets = this.tracklets.filter((t) => t.age < this.config.maxAge);

    return [...players, ...nonPlayers];
  }

  /**
   * Get all confirmed tracks.
   */
  getTracks(): PlayerTrack[] {
    return this.tracklets
      .filter((t) => t.confirmed)
      .map((t) => ({
        trackId: t.trackId,
        detections: t.detections,
        startFrame: t.detections[0]?.frameIndex ?? 0,
        endFrame: t.detections[t.detections.length - 1]?.frameIndex ?? 0,
        avgConfidence:
          t.detections.reduce((s, d) => s + d.bbox.confidence, 0) / t.detections.length,
        teamId: t.teamId,
        jerseyNumber: t.jerseyNumber,
      }));
  }

  /** Reset tracker state */
  reset(): void {
    this.tracklets = [];
    this.nextId = 0;
    this.frameCount = 0;
  }

  // ── Internal ──

  private computeCostMatrix(
    detections: PlayerDetection[],
    reidFeatures?: Float32Array[]
  ): number[][] {
    const numDets = detections.length;
    const numTracks = this.tracklets.length;
    const matrix: number[][] = [];

    for (let d = 0; d < numDets; d++) {
      const row: number[] = [];
      for (let t = 0; t < numTracks; t++) {
        const predictedBox = kalmanToBBox(this.tracklets[t].state);
        const iou = computeIoU(detections[d].bbox, predictedBox);

        let cost = 1 - iou; // IoU cost

        // Blend with ReID similarity if available
        if (
          this.config.useReID &&
          reidFeatures?.[d] &&
          this.tracklets[t].reidFeature
        ) {
          const sim = cosineSimilarity(reidFeatures[d], this.tracklets[t].reidFeature!);
          cost = cost * 0.6 + (1 - sim) * 0.4; // weighted combination
        }

        row.push(cost);
      }
      matrix.push(row);
    }

    return matrix;
  }

  private greedyMatch(
    costMatrix: number[][],
    numDets: number,
    numTracks: number
  ): {
    matched: [number, number][];
    unmatchedDetections: number[];
    unmatchedTracklets: number[];
  } {
    const matched: [number, number][] = [];
    const usedDets = new Set<number>();
    const usedTracks = new Set<number>();

    // Flatten and sort by cost
    const pairs: { det: number; track: number; cost: number }[] = [];
    for (let d = 0; d < numDets; d++) {
      for (let t = 0; t < numTracks; t++) {
        pairs.push({ det: d, track: t, cost: costMatrix[d][t] });
      }
    }
    pairs.sort((a, b) => a.cost - b.cost);

    // Greedy assign
    for (const { det, track, cost } of pairs) {
      if (cost > (1 - this.config.iouThreshold)) continue;
      if (usedDets.has(det) || usedTracks.has(track)) continue;
      matched.push([det, track]);
      usedDets.add(det);
      usedTracks.add(track);
    }

    const unmatchedDetections = Array.from({ length: numDets }, (_, i) => i).filter(
      (i) => !usedDets.has(i)
    );
    const unmatchedTracklets = Array.from({ length: numTracks }, (_, i) => i).filter(
      (i) => !usedTracks.has(i)
    );

    return { matched, unmatchedDetections, unmatchedTracklets };
  }
}

// ─── Utilities ──────────────────────────────────────────────────────────────

function cosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  return denom > 0 ? dot / denom : 0;
}
