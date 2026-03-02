/**
 * ScoutVision AI - Detection Pipeline Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Test NMS (Non-Maximum Suppression) implementation
interface BBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Detection {
  bbox: BBox;
  confidence: number;
  classId: number;
  className: string;
}

function computeIoU(a: BBox, b: BBox): number {
  const x1 = Math.max(a.x, b.x);
  const y1 = Math.max(a.y, b.y);
  const x2 = Math.min(a.x + a.width, b.x + b.width);
  const y2 = Math.min(a.y + a.height, b.y + b.height);

  const intersection = Math.max(0, x2 - x1) * Math.max(0, y2 - y1);
  const areaA = a.width * a.height;
  const areaB = b.width * b.height;
  const union = areaA + areaB - intersection;

  return union > 0 ? intersection / union : 0;
}

function nonMaxSuppression(
  detections: Detection[],
  iouThreshold: number = 0.5,
  confidenceThreshold: number = 0.3
): Detection[] {
  const filtered = detections
    .filter(d => d.confidence >= confidenceThreshold)
    .sort((a, b) => b.confidence - a.confidence);

  const kept: Detection[] = [];

  for (const det of filtered) {
    let shouldKeep = true;
    for (const kept_det of kept) {
      if (det.classId === kept_det.classId) {
        const iou = computeIoU(det.bbox, kept_det.bbox);
        if (iou > iouThreshold) {
          shouldKeep = false;
          break;
        }
      }
    }
    if (shouldKeep) kept.push(det);
  }

  return kept;
}

function classifyTeam(
  detection: Detection,
  avgColor: [number, number, number],
  teamColors: { team1: [number, number, number]; team2: [number, number, number] }
): 'team1' | 'team2' | 'unknown' {
  const dist1 = Math.sqrt(
    (avgColor[0] - teamColors.team1[0]) ** 2 +
    (avgColor[1] - teamColors.team1[1]) ** 2 +
    (avgColor[2] - teamColors.team1[2]) ** 2
  );
  const dist2 = Math.sqrt(
    (avgColor[0] - teamColors.team2[0]) ** 2 +
    (avgColor[1] - teamColors.team2[1]) ** 2 +
    (avgColor[2] - teamColors.team2[2]) ** 2
  );

  const threshold = 100;
  if (dist1 < dist2 && dist1 < threshold) return 'team1';
  if (dist2 < dist1 && dist2 < threshold) return 'team2';
  return 'unknown';
}

describe('Detection Pipeline', () => {
  describe('computeIoU', () => {
    it('should return 1.0 for identical boxes', () => {
      const box = { x: 0, y: 0, width: 100, height: 100 };
      expect(computeIoU(box, box)).toBe(1);
    });

    it('should return 0 for non-overlapping boxes', () => {
      const a = { x: 0, y: 0, width: 50, height: 50 };
      const b = { x: 100, y: 100, width: 50, height: 50 };
      expect(computeIoU(a, b)).toBe(0);
    });

    it('should compute partial overlap correctly', () => {
      const a = { x: 0, y: 0, width: 100, height: 100 };
      const b = { x: 50, y: 0, width: 100, height: 100 };
      // Intersection: 50 * 100 = 5000
      // Union: 10000 + 10000 - 5000 = 15000
      expect(computeIoU(a, b)).toBeCloseTo(5000 / 15000, 4);
    });

    it('should handle contained box', () => {
      const outer = { x: 0, y: 0, width: 200, height: 200 };
      const inner = { x: 50, y: 50, width: 50, height: 50 };
      // Intersection = 2500, Union = 40000 + 2500 - 2500 = 40000
      expect(computeIoU(outer, inner)).toBeCloseTo(2500 / 40000, 4);
    });

    it('should handle zero-area box', () => {
      const a = { x: 0, y: 0, width: 0, height: 0 };
      const b = { x: 0, y: 0, width: 100, height: 100 };
      expect(computeIoU(a, b)).toBe(0);
    });
  });

  describe('nonMaxSuppression', () => {
    it('should keep single detection', () => {
      const dets: Detection[] = [
        { bbox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, classId: 0, className: 'person' },
      ];
      const result = nonMaxSuppression(dets);
      expect(result).toHaveLength(1);
    });

    it('should remove overlapping detections of same class', () => {
      const dets: Detection[] = [
        { bbox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, classId: 0, className: 'person' },
        { bbox: { x: 10, y: 10, width: 100, height: 100 }, confidence: 0.8, classId: 0, className: 'person' },
      ];
      const result = nonMaxSuppression(dets, 0.5);
      expect(result).toHaveLength(1);
      expect(result[0].confidence).toBe(0.9);
    });

    it('should keep non-overlapping detections', () => {
      const dets: Detection[] = [
        { bbox: { x: 0, y: 0, width: 50, height: 50 }, confidence: 0.9, classId: 0, className: 'person' },
        { bbox: { x: 200, y: 200, width: 50, height: 50 }, confidence: 0.85, classId: 0, className: 'person' },
      ];
      const result = nonMaxSuppression(dets);
      expect(result).toHaveLength(2);
    });

    it('should keep overlapping detections of different classes', () => {
      const dets: Detection[] = [
        { bbox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, classId: 0, className: 'person' },
        { bbox: { x: 10, y: 10, width: 100, height: 100 }, confidence: 0.85, classId: 1, className: 'ball' },
      ];
      const result = nonMaxSuppression(dets, 0.5);
      expect(result).toHaveLength(2);
    });

    it('should filter low confidence detections', () => {
      const dets: Detection[] = [
        { bbox: { x: 0, y: 0, width: 100, height: 100 }, confidence: 0.9, classId: 0, className: 'person' },
        { bbox: { x: 200, y: 200, width: 50, height: 50 }, confidence: 0.1, classId: 0, className: 'person' },
      ];
      const result = nonMaxSuppression(dets, 0.5, 0.3);
      expect(result).toHaveLength(1);
    });

    it('should return empty array for no detections', () => {
      expect(nonMaxSuppression([])).toHaveLength(0);
    });

    it('should handle many overlapping detections', () => {
      const dets: Detection[] = Array.from({ length: 20 }, (_, i) => ({
        bbox: { x: i * 5, y: i * 5, width: 100, height: 100 },
        confidence: 0.95 - i * 0.02,
        classId: 0,
        className: 'person',
      }));
      const result = nonMaxSuppression(dets, 0.5);
      // Should keep significantly fewer than 20
      expect(result.length).toBeLessThan(10);
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('classifyTeam', () => {
    const teamColors = {
      team1: [255, 0, 0] as [number, number, number],   // Red
      team2: [0, 0, 255] as [number, number, number],   // Blue
    };
    const det: Detection = {
      bbox: { x: 0, y: 0, width: 50, height: 100 },
      confidence: 0.9,
      classId: 0,
      className: 'person',
    };

    it('should classify red jersey as team1', () => {
      expect(classifyTeam(det, [240, 20, 20], teamColors)).toBe('team1');
    });

    it('should classify blue jersey as team2', () => {
      expect(classifyTeam(det, [20, 20, 240], teamColors)).toBe('team2');
    });

    it('should return unknown for ambiguous colors', () => {
      expect(classifyTeam(det, [128, 128, 128], teamColors)).toBe('unknown');
    });
  });
});
