/**
 * ScoutVision AI - Biomechanics Engine Tests
 */

import { describe, it, expect } from 'vitest';

// Test biomechanics calculations
interface Keypoint {
  x: number;
  y: number;
  z?: number;
  confidence: number;
  name: string;
}

interface JointAngle {
  name: string;
  angle: number;
  normalRange: [number, number];
  isWithinRange: boolean;
}

function computeAngle(a: Keypoint, b: Keypoint, c: Keypoint): number {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  if (magBA === 0 || magBC === 0) return 0;

  const cosAngle = Math.max(-1, Math.min(1, dot / (magBA * magBC)));
  return (Math.acos(cosAngle) * 180) / Math.PI;
}

function computeJointAngle(
  a: Keypoint, b: Keypoint, c: Keypoint,
  name: string, normalRange: [number, number]
): JointAngle {
  const angle = computeAngle(a, b, c);
  return {
    name,
    angle,
    normalRange,
    isWithinRange: angle >= normalRange[0] && angle <= normalRange[1],
  };
}

function computeCenterOfMass(keypoints: Keypoint[]): { x: number; y: number } {
  const validKps = keypoints.filter(kp => kp.confidence > 0.3);
  if (validKps.length === 0) return { x: 0, y: 0 };

  const sumX = validKps.reduce((s, kp) => s + kp.x, 0);
  const sumY = validKps.reduce((s, kp) => s + kp.y, 0);
  return { x: sumX / validKps.length, y: sumY / validKps.length };
}

function computeStride(
  leftAnkle: Keypoint, rightAnkle: Keypoint,
  pixelsPerMeter: number = 100
): { strideLength: number; unit: string } {
  const dx = leftAnkle.x - rightAnkle.x;
  const dy = leftAnkle.y - rightAnkle.y;
  const pixelDist = Math.sqrt(dx ** 2 + dy ** 2);
  return { strideLength: pixelDist / pixelsPerMeter, unit: 'meters' };
}

function assessInjuryRisk(
  jointAngles: JointAngle[],
  velocityMagnitude: number,
  lateralMomentum: number
): { riskLevel: 'low' | 'moderate' | 'high'; factors: string[] } {
  const factors: string[] = [];
  let riskScore = 0;

  const outOfRange = jointAngles.filter(ja => !ja.isWithinRange);
  if (outOfRange.length > 0) {
    riskScore += outOfRange.length * 15;
    factors.push(...outOfRange.map(ja => `${ja.name} angle out of range (${ja.angle.toFixed(1)} deg)`));
  }

  if (velocityMagnitude > 8) {
    riskScore += 20;
    factors.push('High velocity movement');
  }

  if (lateralMomentum > 5) {
    riskScore += 25;
    factors.push('High lateral momentum');
  }

  const riskLevel = riskScore >= 50 ? 'high' : riskScore >= 25 ? 'moderate' : 'low';
  return { riskLevel, factors };
}

describe('Biomechanics Engine', () => {
  describe('computeAngle', () => {
    it('should compute 90 degrees for right angle', () => {
      const a: Keypoint = { x: 100, y: 0, confidence: 1, name: 'a' };
      const b: Keypoint = { x: 0, y: 0, confidence: 1, name: 'b' };
      const c: Keypoint = { x: 0, y: 100, confidence: 1, name: 'c' };
      expect(computeAngle(a, b, c)).toBeCloseTo(90, 0);
    });

    it('should compute 180 degrees for straight line', () => {
      const a: Keypoint = { x: -100, y: 0, confidence: 1, name: 'a' };
      const b: Keypoint = { x: 0, y: 0, confidence: 1, name: 'b' };
      const c: Keypoint = { x: 100, y: 0, confidence: 1, name: 'c' };
      expect(computeAngle(a, b, c)).toBeCloseTo(180, 0);
    });

    it('should compute 0 degrees for collapsed angle', () => {
      const a: Keypoint = { x: 100, y: 0, confidence: 1, name: 'a' };
      const b: Keypoint = { x: 0, y: 0, confidence: 1, name: 'b' };
      const c: Keypoint = { x: 50, y: 0, confidence: 1, name: 'c' };
      expect(computeAngle(a, b, c)).toBeCloseTo(0, 0);
    });

    it('should compute 60 degrees for equilateral triangle vertex', () => {
      const a: Keypoint = { x: 0, y: 0, confidence: 1, name: 'a' };
      const b: Keypoint = { x: 50, y: 0, confidence: 1, name: 'b' };
      const c: Keypoint = { x: 25, y: 25 * Math.sqrt(3), confidence: 1, name: 'c' };
      expect(computeAngle(a, b, c)).toBeCloseTo(60, 0);
    });

    it('should return 0 for coincident points', () => {
      const p: Keypoint = { x: 50, y: 50, confidence: 1, name: 'p' };
      expect(computeAngle(p, p, p)).toBe(0);
    });
  });

  describe('computeJointAngle', () => {
    it('should mark angle within normal range', () => {
      const shoulder: Keypoint = { x: 0, y: 0, confidence: 1, name: 'shoulder' };
      const elbow: Keypoint = { x: 50, y: 0, confidence: 1, name: 'elbow' };
      const wrist: Keypoint = { x: 50, y: 50, confidence: 1, name: 'wrist' };

      const result = computeJointAngle(shoulder, elbow, wrist, 'right_elbow', [60, 160]);
      expect(result.angle).toBeCloseTo(90, 0);
      expect(result.isWithinRange).toBe(true);
    });

    it('should mark angle outside normal range', () => {
      const hip: Keypoint = { x: 0, y: 0, confidence: 1, name: 'hip' };
      const knee: Keypoint = { x: 0, y: 100, confidence: 1, name: 'knee' };
      const ankle: Keypoint = { x: -90, y: 200, confidence: 1, name: 'ankle' };

      const result = computeJointAngle(hip, knee, ankle, 'right_knee', [160, 180]);
      expect(result.isWithinRange).toBe(false);
    });
  });

  describe('computeCenterOfMass', () => {
    it('should compute center for symmetric keypoints', () => {
      const kps: Keypoint[] = [
        { x: 0, y: 0, confidence: 1, name: 'a' },
        { x: 100, y: 0, confidence: 1, name: 'b' },
        { x: 0, y: 100, confidence: 1, name: 'c' },
        { x: 100, y: 100, confidence: 1, name: 'd' },
      ];
      const com = computeCenterOfMass(kps);
      expect(com.x).toBe(50);
      expect(com.y).toBe(50);
    });

    it('should ignore low confidence keypoints', () => {
      const kps: Keypoint[] = [
        { x: 0, y: 0, confidence: 0.9, name: 'a' },
        { x: 100, y: 100, confidence: 0.9, name: 'b' },
        { x: 1000, y: 1000, confidence: 0.1, name: 'noisy' },
      ];
      const com = computeCenterOfMass(kps);
      expect(com.x).toBe(50);
      expect(com.y).toBe(50);
    });

    it('should return origin for empty keypoints', () => {
      const com = computeCenterOfMass([]);
      expect(com.x).toBe(0);
      expect(com.y).toBe(0);
    });
  });

  describe('computeStride', () => {
    it('should compute stride length in meters', () => {
      const left: Keypoint = { x: 0, y: 0, confidence: 1, name: 'left_ankle' };
      const right: Keypoint = { x: 150, y: 0, confidence: 1, name: 'right_ankle' };
      const result = computeStride(left, right, 100);
      expect(result.strideLength).toBeCloseTo(1.5, 2);
      expect(result.unit).toBe('meters');
    });

    it('should handle diagonal stride', () => {
      const left: Keypoint = { x: 0, y: 0, confidence: 1, name: 'left_ankle' };
      const right: Keypoint = { x: 100, y: 100, confidence: 1, name: 'right_ankle' };
      const result = computeStride(left, right, 100);
      expect(result.strideLength).toBeCloseTo(Math.sqrt(2), 2);
    });
  });

  describe('assessInjuryRisk', () => {
    it('should return low risk for normal mechanics', () => {
      const angles: JointAngle[] = [
        { name: 'knee', angle: 170, normalRange: [160, 180], isWithinRange: true },
        { name: 'hip', angle: 165, normalRange: [150, 180], isWithinRange: true },
      ];
      const result = assessInjuryRisk(angles, 5, 2);
      expect(result.riskLevel).toBe('low');
      expect(result.factors).toHaveLength(0);
    });

    it('should return moderate risk for some abnormalities', () => {
      const angles: JointAngle[] = [
        { name: 'knee', angle: 130, normalRange: [160, 180], isWithinRange: false },
        { name: 'hip', angle: 165, normalRange: [150, 180], isWithinRange: true },
      ];
      const result = assessInjuryRisk(angles, 9, 3);
      expect(result.riskLevel).toBe('moderate');
      expect(result.factors.length).toBeGreaterThan(0);
    });

    it('should return high risk for multiple risk factors', () => {
      const angles: JointAngle[] = [
        { name: 'knee', angle: 130, normalRange: [160, 180], isWithinRange: false },
        { name: 'hip', angle: 120, normalRange: [150, 180], isWithinRange: false },
      ];
      const result = assessInjuryRisk(angles, 10, 7);
      expect(result.riskLevel).toBe('high');
      expect(result.factors.length).toBeGreaterThanOrEqual(3);
    });

    it('should identify specific risk factors', () => {
      const angles: JointAngle[] = [
        { name: 'right_knee', angle: 140, normalRange: [160, 180], isWithinRange: false },
      ];
      const result = assessInjuryRisk(angles, 9, 6);
      expect(result.factors).toContain('High velocity movement');
      expect(result.factors).toContain('High lateral momentum');
      expect(result.factors.some(f => f.includes('right_knee'))).toBe(true);
    });
  });
});
