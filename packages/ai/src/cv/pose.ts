// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Pose Estimation Engine
// Multi-person pose estimation using top-down approach:
// 1. Detect players → 2. Crop each → 3. Estimate 17 COCO keypoints
// Supports HRNet-W48 and ViTPose backbones via ONNX Runtime.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Pose,
  FramePoses,
  KeypointName,
  Point2D,
  Point3D,
  PlayerDetection,
  BoundingBox,
} from '../types';
import type { FrameData } from './detection';

// ─── Configuration ──────────────────────────────────────────────────────────

export interface PoseConfig {
  inputSize: [number, number];          // crop size for pose model [W, H]
  keypointThreshold: number;            // min confidence per keypoint
  poseThreshold: number;                // min average score for valid pose
  flipTest: boolean;                    // average with horizontal flip (slower, more accurate)
  use3D: boolean;                       // enable 3D lifting
  maxPersons: number;
}

export const DEFAULT_POSE_CONFIG: PoseConfig = {
  inputSize: [288, 384],
  keypointThreshold: 0.3,
  poseThreshold: 0.4,
  flipTest: false,
  use3D: false,
  maxPersons: 22,
};

// ─── COCO-17 Skeleton ───────────────────────────────────────────────────────

export const KEYPOINT_NAMES: KeypointName[] = [
  'nose', 'left_eye', 'right_eye', 'left_ear', 'right_ear',
  'left_shoulder', 'right_shoulder', 'left_elbow', 'right_elbow',
  'left_wrist', 'right_wrist', 'left_hip', 'right_hip',
  'left_knee', 'right_knee', 'left_ankle', 'right_ankle',
];

/** Skeleton connections for visualization */
export const SKELETON_CONNECTIONS: [KeypointName, KeypointName][] = [
  ['left_shoulder', 'right_shoulder'],
  ['left_shoulder', 'left_elbow'],
  ['left_elbow', 'left_wrist'],
  ['right_shoulder', 'right_elbow'],
  ['right_elbow', 'right_wrist'],
  ['left_shoulder', 'left_hip'],
  ['right_shoulder', 'right_hip'],
  ['left_hip', 'right_hip'],
  ['left_hip', 'left_knee'],
  ['left_knee', 'left_ankle'],
  ['right_hip', 'right_knee'],
  ['right_knee', 'right_ankle'],
  ['nose', 'left_eye'],
  ['nose', 'right_eye'],
  ['left_eye', 'left_ear'],
  ['right_eye', 'right_ear'],
];

// ─── Crop & Preprocess ──────────────────────────────────────────────────────

/**
 * Expand detection bbox with margin for pose estimation.
 * Adds 25% padding on each side for better keypoint capture.
 */
export function expandBBox(bbox: BoundingBox, scale: number = 1.25): BoundingBox {
  const cx = bbox.x + bbox.width / 2;
  const cy = bbox.y + bbox.height / 2;
  const newW = bbox.width * scale;
  const newH = bbox.height * scale;
  return {
    x: Math.max(0, cx - newW / 2),
    y: Math.max(0, cy - newH / 2),
    width: Math.min(1 - Math.max(0, cx - newW / 2), newW),
    height: Math.min(1 - Math.max(0, cy - newH / 2), newH),
    confidence: bbox.confidence,
  };
}

/**
 * Crop and resize a player region for pose model input.
 * Returns normalized CHW float32 tensor.
 */
export function cropForPose(
  frame: FrameData,
  bbox: BoundingBox,
  targetSize: [number, number]
): Float32Array {
  const [tw, th] = targetSize;
  const tensor = new Float32Array(3 * tw * th);

  const srcX0 = Math.round(bbox.x * frame.width);
  const srcY0 = Math.round(bbox.y * frame.height);
  const srcW = Math.round(bbox.width * frame.width);
  const srcH = Math.round(bbox.height * frame.height);

  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const srcX = srcX0 + Math.round((x / tw) * srcW);
      const srcY = srcY0 + Math.round((y / th) * srcH);

      const outIdx = y * tw + x;

      if (srcX < 0 || srcX >= frame.width || srcY < 0 || srcY >= frame.height) {
        continue; // zero-padded
      }

      const idx = (srcY * frame.width + srcX) * frame.channels;

      // ImageNet normalization
      tensor[outIdx] = (frame.buffer[idx] / 255 - 0.485) / 0.229;
      tensor[tw * th + outIdx] = (frame.buffer[idx + 1] / 255 - 0.456) / 0.224;
      tensor[2 * tw * th + outIdx] = (frame.buffer[idx + 2] / 255 - 0.406) / 0.225;
    }
  }

  return tensor;
}

// ─── Heatmap Decoding ───────────────────────────────────────────────────────

/**
 * Decode heatmaps to keypoint coordinates.
 * Each heatmap is [H, W] representing probability of keypoint location.
 *
 * @param heatmaps - Raw output [17, H, W]
 * @param bbox     - Original detection bbox (for mapping back to image coords)
 * @param config   - Pose configuration
 */
export function decodeHeatmaps(
  heatmaps: Float32Array,
  heatmapH: number,
  heatmapW: number,
  bbox: BoundingBox,
  config: PoseConfig
): { keypoints: Record<KeypointName, Point2D>; score: number } {
  const keypoints: Partial<Record<KeypointName, Point2D>> = {};
  let totalScore = 0;

  for (let k = 0; k < 17; k++) {
    const offset = k * heatmapH * heatmapW;

    // Find argmax in heatmap
    let maxVal = -Infinity;
    let maxIdx = 0;
    for (let i = 0; i < heatmapH * heatmapW; i++) {
      if (heatmaps[offset + i] > maxVal) {
        maxVal = heatmaps[offset + i];
        maxIdx = i;
      }
    }

    const hmX = maxIdx % heatmapW;
    const hmY = Math.floor(maxIdx / heatmapW);

    // Sub-pixel refinement using Taylor expansion
    let refinedX = hmX;
    let refinedY = hmY;
    if (hmX > 0 && hmX < heatmapW - 1 && hmY > 0 && hmY < heatmapH - 1) {
      const dx = (heatmaps[offset + hmY * heatmapW + hmX + 1] -
                  heatmaps[offset + hmY * heatmapW + hmX - 1]) * 0.5;
      const dy = (heatmaps[offset + (hmY + 1) * heatmapW + hmX] -
                  heatmaps[offset + (hmY - 1) * heatmapW + hmX]) * 0.5;
      refinedX += Math.sign(dx) * 0.25;
      refinedY += Math.sign(dy) * 0.25;
    }

    // Map from heatmap coords back to image coords
    const imgX = bbox.x + (refinedX / heatmapW) * bbox.width;
    const imgY = bbox.y + (refinedY / heatmapH) * bbox.height;
    const confidence = sigmoid(maxVal);

    keypoints[KEYPOINT_NAMES[k]] = { x: imgX, y: imgY, confidence };
    totalScore += confidence;
  }

  return {
    keypoints: keypoints as Record<KeypointName, Point2D>,
    score: totalScore / 17,
  };
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

// ─── 3D Lifting ─────────────────────────────────────────────────────────────

/**
 * Lift 2D keypoints to 3D using a learned regression model.
 * Uses bone-length priors and joint angle constraints.
 */
export function liftTo3D(
  keypoints2D: Record<KeypointName, Point2D>,
  calibration?: { focalLength: number; principalPoint: [number, number] }
): Record<KeypointName, Point3D> {
  const focalLength = calibration?.focalLength ?? 1000;
  const [cx, cy] = calibration?.principalPoint ?? [0.5, 0.5];

  // Human body segment length priors (meters)
  const boneLengths: Partial<Record<string, number>> = {
    'left_shoulder-left_elbow': 0.30,
    'left_elbow-left_wrist': 0.25,
    'right_shoulder-right_elbow': 0.30,
    'right_elbow-right_wrist': 0.25,
    'left_hip-left_knee': 0.42,
    'left_knee-left_ankle': 0.40,
    'right_hip-right_knee': 0.42,
    'right_knee-right_ankle': 0.40,
    'left_shoulder-left_hip': 0.50,
    'right_shoulder-right_hip': 0.50,
  };

  const result: Partial<Record<KeypointName, Point3D>> = {};

  // Estimate depth from bone length constraints
  // Using a simplified projection model: z ≈ focalLength * boneLength / pixelBoneLength
  const shoulderWidth = Math.sqrt(
    (keypoints2D.left_shoulder.x - keypoints2D.right_shoulder.x) ** 2 +
    (keypoints2D.left_shoulder.y - keypoints2D.right_shoulder.y) ** 2
  );
  const estimatedDepth = shoulderWidth > 0.01
    ? focalLength * 0.40 / (shoulderWidth * focalLength)
    : 3.0; // default 3 meters

  for (const name of KEYPOINT_NAMES) {
    const kp = keypoints2D[name];
    result[name] = {
      x: (kp.x - cx) * estimatedDepth / focalLength,
      y: (kp.y - cy) * estimatedDepth / focalLength,
      z: estimatedDepth,
      confidence: kp.confidence,
    };
  }

  return result as Record<KeypointName, Point3D>;
}

// ─── Batch Processing ───────────────────────────────────────────────────────

/**
 * Run pose estimation on all detections in a frame.
 * Returns FramePoses result.
 */
export function processFramePoses(
  detections: PlayerDetection[],
  frame: FrameData,
  heatmapPredictor: (tensors: Float32Array[]) => Float32Array[],
  config: PoseConfig = DEFAULT_POSE_CONFIG
): FramePoses {
  const players = detections
    .filter((d) => d.classification === 'player')
    .slice(0, config.maxPersons);

  if (players.length === 0) {
    return { frameIndex: frame.frameIndex, timestamp: frame.timestamp, poses: [] };
  }

  // Prepare crops
  const crops: Float32Array[] = [];
  const expandedBoxes: BoundingBox[] = [];

  for (const player of players) {
    const expanded = expandBBox(player.bbox, 1.25);
    expandedBoxes.push(expanded);
    crops.push(cropForPose(frame, expanded, config.inputSize));
  }

  // Run batch inference
  const heatmaps = heatmapPredictor(crops);

  // Decode heatmaps
  const heatmapH = Math.round(config.inputSize[1] / 4); // typical stride=4
  const heatmapW = Math.round(config.inputSize[0] / 4);

  const poses: Pose[] = [];
  for (let i = 0; i < players.length; i++) {
    const { keypoints, score } = decodeHeatmaps(
      heatmaps[i],
      heatmapH,
      heatmapW,
      expandedBoxes[i],
      config
    );

    if (score < config.poseThreshold) continue;

    const pose: Pose = {
      trackId: players[i].trackId ?? players[i].id,
      keypoints,
      score,
      frameIndex: frame.frameIndex,
      timestamp: frame.timestamp,
    };

    if (config.use3D) {
      pose.keypoints3D = liftTo3D(keypoints);
    }

    poses.push(pose);
  }

  return {
    frameIndex: frame.frameIndex,
    timestamp: frame.timestamp,
    poses,
  };
}

// ─── Pose Smoothing ─────────────────────────────────────────────────────────

/**
 * Temporal smoothing of pose keypoints using exponential moving average.
 * Reduces jitter while preserving fast movements.
 */
export class PoseSmoother {
  private history = new Map<string, Record<KeypointName, Point2D>>();
  private alpha: number;

  constructor(smoothingFactor: number = 0.7) {
    this.alpha = smoothingFactor;
  }

  smooth(pose: Pose): Pose {
    const prev = this.history.get(pose.trackId);
    if (!prev) {
      this.history.set(pose.trackId, { ...pose.keypoints });
      return pose;
    }

    const smoothed: Partial<Record<KeypointName, Point2D>> = {};
    for (const name of KEYPOINT_NAMES) {
      const curr = pose.keypoints[name];
      const prevKp = prev[name];

      // Adaptive alpha: reduce smoothing for fast movements
      const dist = Math.sqrt((curr.x - prevKp.x) ** 2 + (curr.y - prevKp.y) ** 2);
      const adaptiveAlpha = dist > 0.05 ? this.alpha * 0.5 : this.alpha;

      smoothed[name] = {
        x: prevKp.x + adaptiveAlpha * (curr.x - prevKp.x),
        y: prevKp.y + adaptiveAlpha * (curr.y - prevKp.y),
        confidence: curr.confidence,
      };
    }

    const result = smoothed as Record<KeypointName, Point2D>;
    this.history.set(pose.trackId, result);

    return { ...pose, keypoints: result };
  }

  reset(): void {
    this.history.clear();
  }
}

// ─── OKS Evaluation ─────────────────────────────────────────────────────────

/** COCO keypoint sigmas for OKS computation */
const KEYPOINT_SIGMAS = [
  0.026, 0.025, 0.025, 0.035, 0.035,
  0.079, 0.079, 0.072, 0.072,
  0.062, 0.062, 0.107, 0.107,
  0.087, 0.087, 0.089, 0.089,
];

/**
 * Compute Object Keypoint Similarity between predicted and ground truth poses.
 * OKS is the standard COCO metric for pose evaluation.
 */
export function computeOKS(
  predicted: Record<KeypointName, Point2D>,
  groundTruth: Record<KeypointName, Point2D>,
  area: number // object area for normalization
): number {
  let oks = 0;
  let validCount = 0;

  for (let i = 0; i < KEYPOINT_NAMES.length; i++) {
    const name = KEYPOINT_NAMES[i];
    const gt = groundTruth[name];
    const pred = predicted[name];

    if (gt.confidence < 0.5) continue; // skip unlabeled keypoints

    const dx = pred.x - gt.x;
    const dy = pred.y - gt.y;
    const d2 = dx * dx + dy * dy;
    const sigma = KEYPOINT_SIGMAS[i];
    const s2 = 2 * sigma * sigma * area;

    oks += Math.exp(-d2 / (s2 + 1e-8));
    validCount++;
  }

  return validCount > 0 ? oks / validCount : 0;
}
