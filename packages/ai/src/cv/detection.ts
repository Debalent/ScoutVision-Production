// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Player Detection Engine
// YOLOv8-based player detection with team classification, jersey number
// recognition, and referee/coach filtering. Supports ONNX Runtime inference.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  PlayerDetection,
  BoundingBox,
  Sport,
  ModelMetadata,
} from '../types';
import type { AIModel } from '../models/registry';

// ─── Detection Configuration ────────────────────────────────────────────────

export interface DetectionConfig {
  confidenceThreshold: number;   // minimum detection confidence
  nmsThreshold: number;          // non-max suppression IoU threshold
  maxDetections: number;         // max detections per frame
  inputSize: [number, number];   // [width, height]
  classes: string[];             // class names
  teamColorHints?: [number[], number[]]; // RGB for home/away team
}

export const DEFAULT_DETECTION_CONFIG: DetectionConfig = {
  confidenceThreshold: 0.35,
  nmsThreshold: 0.45,
  maxDetections: 50,
  inputSize: [640, 640],
  classes: ['player', 'referee', 'coach', 'ball', 'goalpost'],
  teamColorHints: undefined,
};

// ─── Preprocessing ──────────────────────────────────────────────────────────

export interface FrameData {
  buffer: Buffer;
  width: number;
  height: number;
  channels: 3 | 4;
  frameIndex: number;
  timestamp: number;
}

/**
 * Preprocess a frame for YOLOv8 input.
 * Resizes, normalizes, and converts HWC → CHW float32 tensor.
 */
export function preprocessFrame(
  frame: FrameData,
  targetSize: [number, number]
): Float32Array {
  const [tw, th] = targetSize;
  const pixelCount = tw * th;
  const tensor = new Float32Array(3 * pixelCount);

  // Letterbox resize with padding
  const scale = Math.min(tw / frame.width, th / frame.height);
  const newW = Math.round(frame.width * scale);
  const newH = Math.round(frame.height * scale);
  const padX = (tw - newW) / 2;
  const padY = (th - newH) / 2;

  // Bilinear interpolation + normalization to [0, 1]
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      const srcX = (x - padX) / scale;
      const srcY = (y - padY) / scale;

      const outIdx = y * tw + x;

      if (srcX < 0 || srcX >= frame.width || srcY < 0 || srcY >= frame.height) {
        // Padding region → fill with 114/255 (YOLO convention)
        tensor[outIdx] = 0.447;
        tensor[pixelCount + outIdx] = 0.447;
        tensor[2 * pixelCount + outIdx] = 0.447;
        continue;
      }

      const x0 = Math.floor(srcX);
      const y0 = Math.floor(srcY);
      const idx = (y0 * frame.width + x0) * frame.channels;

      tensor[outIdx] = frame.buffer[idx] / 255;                     // R
      tensor[pixelCount + outIdx] = frame.buffer[idx + 1] / 255;    // G
      tensor[2 * pixelCount + outIdx] = frame.buffer[idx + 2] / 255; // B
    }
  }

  return tensor;
}

// ─── Post-Processing ────────────────────────────────────────────────────────

/**
 * Non-Maximum Suppression on axis-aligned bounding boxes.
 */
export function nonMaxSuppression(
  boxes: BoundingBox[],
  iouThreshold: number
): BoundingBox[] {
  if (boxes.length === 0) return [];

  // Sort by confidence descending
  const sorted = [...boxes].sort((a, b) => b.confidence - a.confidence);
  const keep: BoundingBox[] = [];

  while (sorted.length > 0) {
    const best = sorted.shift()!;
    keep.push(best);

    // Remove boxes with high IoU overlap
    for (let i = sorted.length - 1; i >= 0; i--) {
      if (computeIoU(best, sorted[i]) > iouThreshold) {
        sorted.splice(i, 1);
      }
    }
  }

  return keep;
}

/**
 * Compute Intersection over Union between two boxes.
 */
export function computeIoU(a: BoundingBox, b: BoundingBox): number {
  const xA = Math.max(a.x, b.x);
  const yA = Math.max(a.y, b.y);
  const xB = Math.min(a.x + a.width, b.x + b.width);
  const yB = Math.min(a.y + a.height, b.y + b.height);

  const intersection = Math.max(0, xB - xA) * Math.max(0, yB - yA);
  const areaA = a.width * a.height;
  const areaB = b.width * b.height;
  const union = areaA + areaB - intersection;

  return union > 0 ? intersection / union : 0;
}

/**
 * Parse raw YOLOv8 output tensor into PlayerDetection objects.
 * YOLOv8 output shape: [1, numClasses+4, numPredictions]
 */
export function parseDetections(
  output: Float32Array,
  numPredictions: number,
  numClasses: number,
  config: DetectionConfig,
  frameIndex: number,
  timestamp: number,
  origWidth: number,
  origHeight: number
): PlayerDetection[] {
  const stride = numClasses + 4; // x, y, w, h, class scores
  const detections: PlayerDetection[] = [];
  const rawBoxes: (BoundingBox & { classIdx: number })[] = [];

  for (let i = 0; i < numPredictions; i++) {
    // Extract box coordinates (center format)
    const cx = output[0 * numPredictions + i];
    const cy = output[1 * numPredictions + i];
    const w = output[2 * numPredictions + i];
    const h = output[3 * numPredictions + i];

    // Find best class
    let bestClass = 0;
    let bestScore = 0;
    for (let c = 0; c < numClasses; c++) {
      const score = output[(4 + c) * numPredictions + i];
      if (score > bestScore) {
        bestScore = score;
        bestClass = c;
      }
    }

    if (bestScore < config.confidenceThreshold) continue;

    // Convert from center to corner format, normalize
    const [tw, th] = config.inputSize;
    rawBoxes.push({
      x: (cx - w / 2) / tw,
      y: (cy - h / 2) / th,
      width: w / tw,
      height: h / th,
      confidence: bestScore,
      classIdx: bestClass,
    });
  }

  // NMS per class
  const byClass = new Map<number, typeof rawBoxes>();
  for (const box of rawBoxes) {
    if (!byClass.has(box.classIdx)) byClass.set(box.classIdx, []);
    byClass.get(box.classIdx)!.push(box);
  }

  let detId = 0;
  for (const [classIdx, boxes] of byClass) {
    const kept = nonMaxSuppression(boxes, config.nmsThreshold);
    for (const box of kept) {
      if (detections.length >= config.maxDetections) break;
      const className = config.classes[classIdx] ?? 'other';
      detections.push({
        id: `det_${frameIndex}_${detId++}`,
        trackId: null,
        bbox: {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
          confidence: box.confidence,
        },
        teamId: null,
        jerseyNumber: null,
        classification: mapClassification(className),
        frameIndex,
        timestamp,
      });
    }
  }

  return detections;
}

function mapClassification(cls: string): PlayerDetection['classification'] {
  switch (cls) {
    case 'player': return 'player';
    case 'referee': return 'referee';
    case 'coach': return 'coach';
    default: return 'other';
  }
}

// ─── Team Classification ────────────────────────────────────────────────────

/**
 * Classify team membership using jersey color histograms.
 * Uses K-means on dominant jersey colors to split into 2 teams.
 */
export function classifyTeams(
  detections: PlayerDetection[],
  frame: FrameData,
  teamColorHints?: [number[], number[]]
): PlayerDetection[] {
  const players = detections.filter((d) => d.classification === 'player');
  if (players.length < 2) return detections;

  // Extract dominant color from each player's bbox center region
  const colors: number[][] = [];
  for (const player of players) {
    const color = extractDominantColor(frame, player.bbox);
    colors.push(color);
  }

  // Simple 2-means clustering on RGB
  const [team0, team1] = kMeans2(colors, teamColorHints);

  for (let i = 0; i < players.length; i++) {
    const distToTeam0 = colorDistance(colors[i], team0);
    const distToTeam1 = colorDistance(colors[i], team1);
    players[i].teamId = distToTeam0 < distToTeam1 ? 'team_home' : 'team_away';
  }

  return detections;
}

function extractDominantColor(frame: FrameData, bbox: BoundingBox): number[] {
  const cx = Math.round((bbox.x + bbox.width / 2) * frame.width);
  const cy = Math.round((bbox.y + bbox.height * 0.3) * frame.height); // upper body
  const sampleSize = 5;

  let r = 0, g = 0, b = 0, count = 0;
  for (let dy = -sampleSize; dy <= sampleSize; dy++) {
    for (let dx = -sampleSize; dx <= sampleSize; dx++) {
      const px = cx + dx;
      const py = cy + dy;
      if (px < 0 || px >= frame.width || py < 0 || py >= frame.height) continue;
      const idx = (py * frame.width + px) * frame.channels;
      r += frame.buffer[idx];
      g += frame.buffer[idx + 1];
      b += frame.buffer[idx + 2];
      count++;
    }
  }

  return count > 0 ? [r / count, g / count, b / count] : [128, 128, 128];
}

function kMeans2(
  points: number[][],
  hints?: [number[], number[]]
): [number[], number[]] {
  // Initialize centroids
  let c0 = hints?.[0] ?? points[0] ?? [128, 128, 128];
  let c1 = hints?.[1] ?? points[points.length - 1] ?? [0, 0, 0];

  for (let iter = 0; iter < 10; iter++) {
    const group0: number[][] = [];
    const group1: number[][] = [];

    for (const p of points) {
      if (colorDistance(p, c0) < colorDistance(p, c1)) {
        group0.push(p);
      } else {
        group1.push(p);
      }
    }

    if (group0.length > 0) c0 = centroid(group0);
    if (group1.length > 0) c1 = centroid(group1);
  }

  return [c0, c1];
}

function centroid(points: number[][]): number[] {
  const dim = points[0].length;
  const sum = new Array(dim).fill(0);
  for (const p of points) {
    for (let i = 0; i < dim; i++) sum[i] += p[i];
  }
  return sum.map((s) => s / points.length);
}

function colorDistance(a: number[], b: number[]): number {
  let sum = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}
