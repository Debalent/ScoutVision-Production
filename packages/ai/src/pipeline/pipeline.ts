// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Full Inference Pipeline
// Video → Preprocess → Detect → Track → Pose → Biomechanics →
// Sport Metrics → Highlights → Play Classification → LLM → Output
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Sport,
  PipelineInput,
  PipelineConfig,
  PipelineOutput,
  PipelineError,
  PlayerDetection,
  BallDetection,
  PlayerTrack,
  Pose,
  FramePoses,
  BiomechanicsFrame,
  PlayClassification,
  Highlight,
} from '../types';

import { registry } from '../models/registry';
import { MultiObjectTracker } from '../cv/tracking';
import { PoseSmoother } from '../cv/pose';
import { getSportModule } from '../sports';

// ═══════════════════════════════════════════════════════════════════════════
// Pipeline Stage Types
// ═══════════════════════════════════════════════════════════════════════════

export type PipelineStage =
  | 'ingest'
  | 'preprocess'
  | 'detect'
  | 'track'
  | 'pose'
  | 'biomechanics'
  | 'sport_metrics'
  | 'highlights'
  | 'play_classification'
  | 'llm_summary'
  | 'output';

export interface PipelineProgress {
  stage: PipelineStage;
  progress: number; // 0-1
  framesProcessed: number;
  totalFrames: number;
  elapsedMs: number;
  estimatedRemainingMs: number;
}

export type ProgressCallback = (progress: PipelineProgress) => void;

// ═══════════════════════════════════════════════════════════════════════════
// Video Ingestion
// ═══════════════════════════════════════════════════════════════════════════

export interface VideoMetadata {
  width: number;
  height: number;
  fps: number;
  durationMs: number;
  totalFrames: number;
  codec: string;
  fileSize: number;
}

export interface FrameExtractor {
  getMetadata(): Promise<VideoMetadata>;
  extractFrame(frameIndex: number): Promise<{ data: Buffer; width: number; height: number }>;
  extractFrames(start: number, end: number, step?: number): AsyncGenerator<{
    index: number;
    data: Buffer;
    width: number;
    height: number;
  }>;
  close(): Promise<void>;
}

/**
 * Create a frame extractor from a video source.
 * In production, this wraps FFmpeg or hardware decoders.
 */
export function createFrameExtractor(source: string | Buffer): FrameExtractor {
  // Mock implementation — real one uses fluent-ffmpeg or native bindings
  const metadata: VideoMetadata = {
    width: 1920,
    height: 1080,
    fps: 30,
    durationMs: 120000,
    totalFrames: 3600,
    codec: 'h264',
    fileSize: typeof source === 'string' ? 0 : source.length,
  };

  return {
    async getMetadata() {
      return metadata;
    },

    async extractFrame(frameIndex: number) {
      // In production: decode frame at index via FFmpeg
      const data = Buffer.alloc(metadata.width * metadata.height * 3);
      return { data, width: metadata.width, height: metadata.height };
    },

    async *extractFrames(start: number, end: number, step = 1) {
      for (let i = start; i <= end; i += step) {
        const frame = await this.extractFrame(i);
        yield { index: i, ...frame };
      }
    },

    async close() {
      // Release resources
    },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Frame Sampling Strategy
// ═══════════════════════════════════════════════════════════════════════════

export interface SamplingStrategy {
  type: 'uniform' | 'keyframe' | 'adaptive' | 'all';
  /** For uniform: frames per second to sample */
  targetFps?: number;
  /** For adaptive: motion threshold to trigger frame capture */
  motionThreshold?: number;
  /** Max frames to process */
  maxFrames?: number;
}

export function computeSampleIndices(
  totalFrames: number,
  sourceFps: number,
  strategy: SamplingStrategy,
): number[] {
  const indices: number[] = [];

  switch (strategy.type) {
    case 'all': {
      for (let i = 0; i < totalFrames; i++) indices.push(i);
      break;
    }

    case 'uniform': {
      const targetFps = strategy.targetFps ?? 5;
      const step = Math.max(1, Math.round(sourceFps / targetFps));
      for (let i = 0; i < totalFrames; i += step) indices.push(i);
      break;
    }

    case 'keyframe': {
      // Sample at scene changes + regular intervals
      const baseStep = Math.max(1, Math.round(sourceFps / 3)); // 3 fps base
      for (let i = 0; i < totalFrames; i += baseStep) indices.push(i);
      break;
    }

    case 'adaptive': {
      // Process every frame but may skip similar ones
      const step = Math.max(1, Math.round(sourceFps / (strategy.targetFps ?? 10)));
      for (let i = 0; i < totalFrames; i += step) indices.push(i);
      break;
    }
  }

  // Apply max frames limit
  if (strategy.maxFrames && indices.length > strategy.maxFrames) {
    const step = indices.length / strategy.maxFrames;
    const limited: number[] = [];
    for (let i = 0; i < strategy.maxFrames; i++) {
      limited.push(indices[Math.floor(i * step)]);
    }
    return limited;
  }

  return indices;
}

// ═══════════════════════════════════════════════════════════════════════════
// Pipeline Orchestrator
// ═══════════════════════════════════════════════════════════════════════════

const DEFAULT_CONFIG: PipelineConfig = {
  sport: 'football',
  samplingFps: 5,
  enableTracking: true,
  enablePose: true,
  enableBiomechanics: true,
  enableHighlights: true,
  enablePlayClassification: true,
  enableLLM: false,
  detectionConfidence: 0.5,
  maxConcurrentFrames: 4,
  gpuDeviceId: 0,
};

export class ScoutVisionPipeline {
  private config: PipelineConfig;
  private onProgress?: ProgressCallback;
  private startTime: number = 0;
  private aborted: boolean = false;

  constructor(config: Partial<PipelineConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set a progress callback for real-time updates.
   */
  setProgressCallback(cb: ProgressCallback): this {
    this.onProgress = cb;
    return this;
  }

  /**
   * Abort a running pipeline.
   */
  abort(): void {
    this.aborted = true;
  }

  /**
   * Run the full inference pipeline on a video.
   */
  async process(input: PipelineInput): Promise<PipelineOutput> {
    this.startTime = Date.now();
    this.aborted = false;

    const errors: PipelineError[] = [];
    const sport = input.sport ?? this.config.sport;

    // ── Stage 1: Ingest ──────────────────────────────────────────────
    this.emitProgress('ingest', 0, 0, 0);

    let extractor: FrameExtractor;
    let metadata: VideoMetadata;
    try {
      extractor = createFrameExtractor(input.videoSource);
      metadata = await extractor.getMetadata();
    } catch (err) {
      return this.errorOutput(sport, 'ingest', err);
    }

    this.emitProgress('ingest', 1, 0, metadata.totalFrames);

    // ── Stage 2: Preprocess (frame sampling) ─────────────────────────
    this.emitProgress('preprocess', 0, 0, metadata.totalFrames);

    const sampleIndices = computeSampleIndices(metadata.totalFrames, metadata.fps, {
      type: 'uniform',
      targetFps: this.config.samplingFps ?? 5,
      maxFrames: 1000,
    });

    this.emitProgress('preprocess', 1, sampleIndices.length, metadata.totalFrames);

    // ── Stage 3: Detection ───────────────────────────────────────────
    const allPlayerDetections: Map<number, PlayerDetection[]> = new Map();
    const allBallDetections: BallDetection[] = [];

    try {
      let processed = 0;
      for (const frameIdx of sampleIndices) {
        if (this.aborted) throw new Error('Pipeline aborted');

        // In production: run detection model on frame
        // Mock: generate synthetic detections
        const timestamp = (frameIdx / metadata.fps) * 1000;
        const mockDetections: PlayerDetection[] = [
          {
            playerId: 'player_1',
            bbox: { x: 200, y: 300, width: 60, height: 150 },
            confidence: 0.92,
            teamId: 'home',
            jerseyColor: { r: 200, g: 30, b: 30 },
            jerseyNumber: 12,
            timestamp,
          },
          {
            playerId: 'player_2',
            bbox: { x: 600, y: 280, width: 55, height: 145 },
            confidence: 0.88,
            teamId: 'away',
            jerseyColor: { r: 30, g: 30, b: 200 },
            jerseyNumber: 7,
            timestamp,
          },
        ];

        const mockBall: BallDetection = {
          bbox: { x: 400 + Math.sin(frameIdx * 0.1) * 100, y: 250, width: 15, height: 15 },
          confidence: 0.85,
          sport,
          velocity: { x: Math.cos(frameIdx * 0.1) * 5, y: -2 },
          timestamp,
        };

        allPlayerDetections.set(frameIdx, mockDetections);
        allBallDetections.push(mockBall);

        processed++;
        this.emitProgress('detect', processed / sampleIndices.length, processed, sampleIndices.length);
      }
    } catch (err) {
      if (this.aborted) return this.errorOutput(sport, 'detect', new Error('Aborted'));
      errors.push({ stage: 'detect', message: String(err), recoverable: true });
    }

    // ── Stage 4: Tracking ────────────────────────────────────────────
    const tracks: PlayerTrack[] = [];
    if (this.config.enableTracking) {
      this.emitProgress('track', 0, 0, sampleIndices.length);
      try {
        const tracker = new MultiObjectTracker({
          maxAge: 30,
          minHits: 3,
          iouThreshold: 0.3,
          useReID: false,
        });

        for (const frameIdx of sampleIndices) {
          const dets = allPlayerDetections.get(frameIdx) ?? [];
          tracker.update(dets);
        }

        const rawTracks = tracker.getTracks();
        for (const [trackId, t] of Object.entries(rawTracks)) {
          if (t.positions.length >= 3) {
            tracks.push({
              trackId,
              playerId: t.playerId ?? trackId,
              positions: t.positions,
              teamId: t.teamId,
              jerseyNumber: t.jerseyNumber,
              startFrame: 0,
              endFrame: sampleIndices[sampleIndices.length - 1],
              confidenceAvg: t.avgConfidence ?? 0.85,
            });
          }
        }

        this.emitProgress('track', 1, sampleIndices.length, sampleIndices.length);
      } catch (err) {
        errors.push({ stage: 'track', message: String(err), recoverable: true });
      }
    }

    // ── Stage 5: Pose Estimation ─────────────────────────────────────
    const allPoses: FramePoses[] = [];
    if (this.config.enablePose) {
      this.emitProgress('pose', 0, 0, sampleIndices.length);
      try {
        const smoother = new PoseSmoother(0.4);
        let processed = 0;

        for (const frameIdx of sampleIndices) {
          // Mock pose data — in production, run pose model on detection crops
          const timestamp = (frameIdx / metadata.fps) * 1000;
          const mockPoses: Pose[] = (allPlayerDetections.get(frameIdx) ?? []).map((det) => ({
            playerId: det.playerId!,
            keypoints: generateMockKeypoints(det.bbox),
            confidence: 0.87,
            bbox: det.bbox,
          }));

          // Apply temporal smoothing
          const smoothed = mockPoses.map((p) => smoother.smooth(p));

          allPoses.push({
            frameIndex: frameIdx,
            timestamp,
            poses: smoothed,
          });

          processed++;
          this.emitProgress('pose', processed / sampleIndices.length, processed, sampleIndices.length);
        }
      } catch (err) {
        errors.push({ stage: 'pose', message: String(err), recoverable: true });
      }
    }

    // ── Stage 6: Biomechanics ────────────────────────────────────────
    const biomechanics: BiomechanicsFrame[] = [];
    if (this.config.enableBiomechanics && allPoses.length > 0) {
      this.emitProgress('biomechanics', 0, 0, allPoses.length);
      try {
        for (let i = 0; i < allPoses.length; i++) {
          const fp = allPoses[i];
          for (const pose of fp.poses) {
            biomechanics.push({
              playerId: pose.playerId ?? 'unknown',
              timestamp: fp.timestamp,
              frameIndex: fp.frameIndex,
              position: {
                x: (pose.keypoints.left_hip?.x + pose.keypoints.right_hip?.x) / 2 || 0,
                y: (pose.keypoints.left_hip?.y + pose.keypoints.right_hip?.y) / 2 || 0,
              },
              velocity: { x: 0, y: 0 },
              acceleration: { x: 0, y: 0 },
              jointAngles: [],
              strideMetrics: null,
              jump: null,
            });
          }
          this.emitProgress('biomechanics', (i + 1) / allPoses.length, i + 1, allPoses.length);
        }

        // Compute velocities and accelerations from position history
        computeKinematics(biomechanics, metadata.fps);
      } catch (err) {
        errors.push({ stage: 'biomechanics', message: String(err), recoverable: true });
      }
    }

    // ── Stage 7: Sport Metrics ───────────────────────────────────────
    let sportMetrics: Record<string, any> = {};
    const sportModule = getSportModule(sport);

    if (sportModule) {
      this.emitProgress('sport_metrics', 0, 0, tracks.length);
      try {
        const ctx = {
          poses: allPoses,
          biomechanics,
          tracks,
          ballDetections: allBallDetections,
          fieldCalibration: null,
          fps: metadata.fps,
          durationMs: metadata.durationMs,
        };

        for (const track of tracks) {
          sportMetrics[track.trackId] = sportModule.computeMetrics(track.trackId, ctx);
        }

        this.emitProgress('sport_metrics', 1, tracks.length, tracks.length);
      } catch (err) {
        errors.push({ stage: 'sport_metrics', message: String(err), recoverable: true });
      }
    }

    // ── Stage 8: Highlights ──────────────────────────────────────────
    let highlights: Highlight[] = [];
    if (this.config.enableHighlights && sportModule) {
      this.emitProgress('highlights', 0, 0, 1);
      try {
        const ctx = {
          poses: allPoses,
          biomechanics,
          tracks,
          ballDetections: allBallDetections,
          fieldCalibration: null,
          fps: metadata.fps,
          durationMs: metadata.durationMs,
        };
        highlights = sportModule.detectHighlights(ctx);
        this.emitProgress('highlights', 1, 1, 1);
      } catch (err) {
        errors.push({ stage: 'highlights', message: String(err), recoverable: true });
      }
    }

    // ── Stage 9: Play Classification ─────────────────────────────────
    let plays: PlayClassification[] = [];
    if (this.config.enablePlayClassification && sportModule) {
      this.emitProgress('play_classification', 0, 0, 1);
      try {
        const ctx = {
          poses: allPoses,
          biomechanics,
          tracks,
          ballDetections: allBallDetections,
          fieldCalibration: null,
          fps: metadata.fps,
          durationMs: metadata.durationMs,
        };
        plays = sportModule.classifyPlays(ctx);
        this.emitProgress('play_classification', 1, 1, 1);
      } catch (err) {
        errors.push({ stage: 'play_classification', message: String(err), recoverable: true });
      }
    }

    // ── Stage 10: Output ─────────────────────────────────────────────
    this.emitProgress('output', 1, sampleIndices.length, sampleIndices.length);

    await extractor!.close();

    return {
      videoId: input.videoId,
      sport,
      metadata: {
        width: metadata.width,
        height: metadata.height,
        fps: metadata.fps,
        durationMs: metadata.durationMs,
        totalFrames: metadata.totalFrames,
        processedFrames: sampleIndices.length,
      },
      detections: Array.from(allPlayerDetections.entries()).map(([frame, dets]) => ({
        frameIndex: frame,
        timestamp: (frame / metadata.fps) * 1000,
        players: dets,
        ball: allBallDetections.find((b) => Math.abs(b.timestamp - (frame / metadata.fps) * 1000) < 50) ?? null,
      })),
      tracks,
      poses: allPoses,
      biomechanics,
      sportMetrics,
      highlights,
      plays,
      errors,
      processingTimeMs: Date.now() - this.startTime,
    };
  }

  // ── Helpers ──────────────────────────────────────────────────────────

  private emitProgress(
    stage: PipelineStage,
    progress: number,
    framesProcessed: number,
    totalFrames: number,
  ): void {
    if (!this.onProgress) return;
    const elapsed = Date.now() - this.startTime;
    const estimatedRemaining = progress > 0
      ? (elapsed / progress) * (1 - progress)
      : 0;

    this.onProgress({
      stage,
      progress: Math.min(1, progress),
      framesProcessed,
      totalFrames,
      elapsedMs: elapsed,
      estimatedRemainingMs: estimatedRemaining,
    });
  }

  private errorOutput(sport: Sport, stage: string, err: unknown): PipelineOutput {
    return {
      videoId: '',
      sport,
      metadata: { width: 0, height: 0, fps: 0, durationMs: 0, totalFrames: 0, processedFrames: 0 },
      detections: [],
      tracks: [],
      poses: [],
      biomechanics: [],
      sportMetrics: {},
      highlights: [],
      plays: [],
      errors: [{
        stage,
        message: err instanceof Error ? err.message : String(err),
        recoverable: false,
      }],
      processingTimeMs: Date.now() - this.startTime,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Kinematics computation
// ═══════════════════════════════════════════════════════════════════════════

function computeKinematics(frames: BiomechanicsFrame[], fps: number): void {
  // Group by player
  const byPlayer = new Map<string, BiomechanicsFrame[]>();
  for (const f of frames) {
    if (!byPlayer.has(f.playerId)) byPlayer.set(f.playerId, []);
    byPlayer.get(f.playerId)!.push(f);
  }

  const dt = 1 / fps;

  for (const playerFrames of byPlayer.values()) {
    playerFrames.sort((a, b) => a.timestamp - b.timestamp);

    for (let i = 1; i < playerFrames.length; i++) {
      const prev = playerFrames[i - 1];
      const curr = playerFrames[i];
      const frameDt = (curr.timestamp - prev.timestamp) / 1000 || dt;

      curr.velocity = {
        x: (curr.position.x - prev.position.x) / frameDt,
        y: (curr.position.y - prev.position.y) / frameDt,
      };
    }

    for (let i = 1; i < playerFrames.length; i++) {
      const prev = playerFrames[i - 1];
      const curr = playerFrames[i];
      const frameDt = (curr.timestamp - prev.timestamp) / 1000 || dt;

      curr.acceleration = {
        x: (curr.velocity.x - prev.velocity.x) / frameDt,
        y: (curr.velocity.y - prev.velocity.y) / frameDt,
      };
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Mock keypoint generator (for pipeline testing)
// ═══════════════════════════════════════════════════════════════════════════

function generateMockKeypoints(bbox: { x: number; y: number; width: number; height: number }): Record<string, { x: number; y: number; confidence: number }> {
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  const w = bbox.width;
  const h = bbox.height;

  return {
    nose: { x: cx, y: cy - h * 0.4, confidence: 0.92 },
    left_eye: { x: cx - w * 0.1, y: cy - h * 0.42, confidence: 0.9 },
    right_eye: { x: cx + w * 0.1, y: cy - h * 0.42, confidence: 0.9 },
    left_ear: { x: cx - w * 0.2, y: cy - h * 0.4, confidence: 0.85 },
    right_ear: { x: cx + w * 0.2, y: cy - h * 0.4, confidence: 0.85 },
    left_shoulder: { x: cx - w * 0.35, y: cy - h * 0.25, confidence: 0.88 },
    right_shoulder: { x: cx + w * 0.35, y: cy - h * 0.25, confidence: 0.88 },
    left_elbow: { x: cx - w * 0.45, y: cy - h * 0.05, confidence: 0.85 },
    right_elbow: { x: cx + w * 0.45, y: cy - h * 0.05, confidence: 0.85 },
    left_wrist: { x: cx - w * 0.4, y: cy + h * 0.1, confidence: 0.8 },
    right_wrist: { x: cx + w * 0.4, y: cy + h * 0.1, confidence: 0.8 },
    left_hip: { x: cx - w * 0.2, y: cy + h * 0.1, confidence: 0.9 },
    right_hip: { x: cx + w * 0.2, y: cy + h * 0.1, confidence: 0.9 },
    left_knee: { x: cx - w * 0.2, y: cy + h * 0.3, confidence: 0.87 },
    right_knee: { x: cx + w * 0.2, y: cy + h * 0.3, confidence: 0.87 },
    left_ankle: { x: cx - w * 0.2, y: cy + h * 0.48, confidence: 0.83 },
    right_ankle: { x: cx + w * 0.2, y: cy + h * 0.48, confidence: 0.83 },
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// Convenience factory
// ═══════════════════════════════════════════════════════════════════════════

export function createPipeline(config?: Partial<PipelineConfig>): ScoutVisionPipeline {
  return new ScoutVisionPipeline(config);
}
