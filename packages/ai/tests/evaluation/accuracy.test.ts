/**
 * ScoutVision AI - CV Accuracy Evaluation Tests
 * Tests for model evaluation metrics used in training pipeline
 */

import { describe, it, expect } from 'vitest';

// Evaluation metric implementations
interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface PredictionResult {
  bbox: BBox;
  confidence: number;
  classId: number;
  isTP?: boolean;
}

interface GroundTruth {
  bbox: BBox;
  classId: number;
  matched?: boolean;
}

function computeIoU(a: BBox, b: BBox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);

  const inter = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const union = a.width * a.height + b.width * b.height - inter;
  return union > 0 ? inter / union : 0;
}

function computePrecisionRecall(
  predictions: PredictionResult[],
  groundTruths: GroundTruth[],
  iouThreshold: number = 0.5
): { precision: number; recall: number; f1: number } {
  const sorted = [...predictions].sort((a, b) => b.confidence - a.confidence);
  const gtMatched = new Set<number>();

  let tp = 0;
  let fp = 0;

  for (const pred of sorted) {
    let bestIoU = 0;
    let bestGtIdx = -1;

    for (let i = 0; i < groundTruths.length; i++) {
      if (gtMatched.has(i)) continue;
      if (groundTruths[i].classId !== pred.classId) continue;

      const iou = computeIoU(pred.bbox, groundTruths[i].bbox);
      if (iou > bestIoU) {
        bestIoU = iou;
        bestGtIdx = i;
      }
    }

    if (bestIoU >= iouThreshold && bestGtIdx >= 0) {
      tp++;
      gtMatched.add(bestGtIdx);
    } else {
      fp++;
    }
  }

  const fn = groundTruths.length - tp;
  const precision = tp + fp > 0 ? tp / (tp + fp) : 0;
  const recall = tp + fn > 0 ? tp / (tp + fn) : 0;
  const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;

  return { precision, recall, f1 };
}

function computeAP(
  precisions: number[],
  recalls: number[]
): number {
  // 11-point interpolation
  let ap = 0;
  for (let t = 0; t <= 1; t += 0.1) {
    let maxPrec = 0;
    for (let i = 0; i < recalls.length; i++) {
      if (recalls[i] >= t) {
        maxPrec = Math.max(maxPrec, precisions[i]);
      }
    }
    ap += maxPrec;
  }
  return ap / 11;
}

function computeOKS(
  predicted: { x: number; y: number; v: number }[],
  groundTruth: { x: number; y: number; v: number }[],
  bboxArea: number
): number {
  const sigmas = [
    0.026, 0.025, 0.025, 0.035, 0.035, 0.079, 0.079,
    0.072, 0.072, 0.062, 0.062, 0.107, 0.107,
    0.087, 0.087, 0.089, 0.089,
  ];

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < Math.min(predicted.length, groundTruth.length, sigmas.length); i++) {
    if (groundTruth[i].v === 0) continue;

    const dx = predicted[i].x - groundTruth[i].x;
    const dy = predicted[i].y - groundTruth[i].y;
    const d2 = dx * dx + dy * dy;
    const s2 = bboxArea;
    const k2 = sigmas[i] * sigmas[i];

    numerator += Math.exp(-d2 / (2 * s2 * k2));
    denominator++;
  }

  return denominator > 0 ? numerator / denominator : 0;
}

describe('CV Evaluation Metrics', () => {
  describe('computePrecisionRecall', () => {
    it('should compute perfect precision and recall', () => {
      const preds: PredictionResult[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, confidence: 0.9, classId: 0 },
        { bbox: { x: 200, y: 200, width: 60, height: 60 }, confidence: 0.85, classId: 0 },
      ];
      const gts: GroundTruth[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, classId: 0 },
        { bbox: { x: 200, y: 200, width: 60, height: 60 }, classId: 0 },
      ];

      const { precision, recall, f1 } = computePrecisionRecall(preds, gts);
      expect(precision).toBe(1);
      expect(recall).toBe(1);
      expect(f1).toBe(1);
    });

    it('should handle false positives', () => {
      const preds: PredictionResult[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, confidence: 0.9, classId: 0 },
        { bbox: { x: 500, y: 500, width: 30, height: 30 }, confidence: 0.8, classId: 0 }, // FP
      ];
      const gts: GroundTruth[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, classId: 0 },
      ];

      const { precision, recall } = computePrecisionRecall(preds, gts);
      expect(precision).toBe(0.5);
      expect(recall).toBe(1);
    });

    it('should handle false negatives', () => {
      const preds: PredictionResult[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, confidence: 0.9, classId: 0 },
      ];
      const gts: GroundTruth[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, classId: 0 },
        { bbox: { x: 300, y: 300, width: 40, height: 40 }, classId: 0 }, // FN
      ];

      const { precision, recall } = computePrecisionRecall(preds, gts);
      expect(precision).toBe(1);
      expect(recall).toBe(0.5);
    });

    it('should handle empty predictions', () => {
      const gts: GroundTruth[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, classId: 0 },
      ];
      const { precision, recall, f1 } = computePrecisionRecall([], gts);
      expect(precision).toBe(0);
      expect(recall).toBe(0);
      expect(f1).toBe(0);
    });

    it('should handle empty ground truths', () => {
      const preds: PredictionResult[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, confidence: 0.9, classId: 0 },
      ];
      const { precision, recall } = computePrecisionRecall(preds, []);
      expect(precision).toBe(0);
      expect(recall).toBe(0);
    });

    it('should match by class', () => {
      const preds: PredictionResult[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, confidence: 0.9, classId: 0 },
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, confidence: 0.8, classId: 1 },
      ];
      const gts: GroundTruth[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, classId: 0 },
      ];

      const { precision, recall } = computePrecisionRecall(preds, gts);
      expect(precision).toBe(0.5); // 1 TP, 1 FP (wrong class)
      expect(recall).toBe(1); // GT matched
    });

    it('should respect IoU threshold', () => {
      const preds: PredictionResult[] = [
        { bbox: { x: 10, y: 10, width: 50, height: 50 }, confidence: 0.9, classId: 0 },
      ];
      const gts: GroundTruth[] = [
        { bbox: { x: 35, y: 35, width: 50, height: 50 }, classId: 0 }, // Partial overlap
      ];

      const strict = computePrecisionRecall(preds, gts, 0.7);
      const lenient = computePrecisionRecall(preds, gts, 0.1);

      expect(strict.precision).toBeLessThanOrEqual(lenient.precision);
    });
  });

  describe('computeAP', () => {
    it('should compute AP for perfect detector', () => {
      const precisions = [1, 1, 1, 1, 1];
      const recalls = [0.2, 0.4, 0.6, 0.8, 1.0];
      const ap = computeAP(precisions, recalls);
      expect(ap).toBeCloseTo(1, 1);
    });

    it('should compute lower AP for degrading precision', () => {
      const precisions = [1, 0.8, 0.6, 0.4, 0.2];
      const recalls = [0.2, 0.4, 0.6, 0.8, 1.0];
      const ap = computeAP(precisions, recalls);
      expect(ap).toBeLessThan(1);
      expect(ap).toBeGreaterThan(0);
    });

    it('should handle empty inputs', () => {
      const ap = computeAP([], []);
      expect(ap).toBe(0);
    });
  });

  describe('computeOKS', () => {
    it('should return 1 for identical poses', () => {
      const pose = Array.from({ length: 17 }, (_, i) => ({
        x: 100 + i * 10, y: 100 + i * 5, v: 1,
      }));
      const oks = computeOKS(pose, pose, 5000);
      expect(oks).toBeCloseTo(1, 2);
    });

    it('should return lower score for different poses', () => {
      const pred = Array.from({ length: 17 }, (_, i) => ({
        x: 100 + i * 10 + 20, y: 100 + i * 5 + 20, v: 1,
      }));
      const gt = Array.from({ length: 17 }, (_, i) => ({
        x: 100 + i * 10, y: 100 + i * 5, v: 1,
      }));

      const oks = computeOKS(pred, gt, 5000);
      expect(oks).toBeLessThan(1);
      expect(oks).toBeGreaterThan(0);
    });

    it('should ignore invisible keypoints', () => {
      const pred = Array.from({ length: 17 }, (_, i) => ({
        x: i * 10, y: i * 5, v: 1,
      }));
      const gt = Array.from({ length: 17 }, (_, i) => ({
        x: i * 10, y: i * 5, v: i < 5 ? 1 : 0, // Only first 5 visible
      }));

      const oks = computeOKS(pred, gt, 5000);
      expect(oks).toBeCloseTo(1, 2);
    });

    it('should handle larger bounding boxes (more tolerant)', () => {
      const offset = 10;
      const pred = Array.from({ length: 17 }, (_, i) => ({
        x: 100 + i * 10 + offset, y: 100 + i * 5 + offset, v: 1,
      }));
      const gt = Array.from({ length: 17 }, (_, i) => ({
        x: 100 + i * 10, y: 100 + i * 5, v: 1,
      }));

      const smallBox = computeOKS(pred, gt, 1000);
      const largeBox = computeOKS(pred, gt, 50000);
      expect(largeBox).toBeGreaterThan(smallBox);
    });
  });
});
