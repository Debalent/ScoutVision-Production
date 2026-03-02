/**
 * ScoutVision AI - Sport Module Tests
 */

import { describe, it, expect } from 'vitest';

// Test sport-specific metric extraction and grading
interface SportMetrics {
  sport: string;
  metrics: Record<string, number>;
  grade: string;
  summary: string;
}

interface GradingScale {
  A: number;
  B: number;
  C: number;
  D: number;
}

function gradeMetric(value: number, scale: GradingScale): string {
  if (value >= scale.A) return 'A';
  if (value >= scale.B) return 'B';
  if (value >= scale.C) return 'C';
  if (value >= scale.D) return 'D';
  return 'F';
}

// Football-specific metrics
function evaluateQBMechanics(metrics: {
  releaseTime: number;  // seconds
  spiralRate: number;   // rpm
  armAngle: number;     // degrees
  footworkScore: number;  // 0-100
}): { grade: string; strengths: string[]; areas: string[] } {
  const strengths: string[] = [];
  const areas: string[] = [];

  if (metrics.releaseTime < 0.4) strengths.push('Quick release');
  else if (metrics.releaseTime > 0.6) areas.push('Slow release time');

  if (metrics.spiralRate > 600) strengths.push('Tight spiral');
  else if (metrics.spiralRate < 400) areas.push('Inconsistent spiral');

  if (metrics.armAngle >= 45 && metrics.armAngle <= 60) strengths.push('Ideal arm slot');
  else areas.push('Non-traditional arm slot');

  if (metrics.footworkScore >= 75) strengths.push('Strong footwork');
  else if (metrics.footworkScore < 50) areas.push('Footwork needs development');

  const overallScore = (
    (metrics.releaseTime < 0.4 ? 25 : metrics.releaseTime < 0.5 ? 15 : 5) +
    (metrics.spiralRate > 600 ? 25 : metrics.spiralRate > 500 ? 15 : 5) +
    (metrics.armAngle >= 45 && metrics.armAngle <= 60 ? 25 : 15) +
    (metrics.footworkScore * 0.25)
  );

  const grade = gradeMetric(overallScore, { A: 85, B: 70, C: 55, D: 40 });
  return { grade, strengths, areas };
}

// Basketball metrics
function evaluateShootingForm(metrics: {
  releaseAngle: number;    // degrees
  releaseHeight: number;   // feet above ground
  followThrough: number;   // 0-100
  consistency: number;     // 0-100 (shot-to-shot variance)
}): { grade: string; arcType: string; recommendations: string[] } {
  const recommendations: string[] = [];

  let arcType: string;
  if (metrics.releaseAngle >= 48 && metrics.releaseAngle <= 55) arcType = 'optimal';
  else if (metrics.releaseAngle > 55) { arcType = 'high'; recommendations.push('Lower release angle for faster shots'); }
  else { arcType = 'flat'; recommendations.push('Increase arc for better conversion'); }

  if (metrics.releaseHeight < 7.5) recommendations.push('Release at higher point');
  if (metrics.followThrough < 70) recommendations.push('Improve follow-through consistency');
  if (metrics.consistency < 60) recommendations.push('Work on shot-to-shot consistency');

  const score = (
    (arcType === 'optimal' ? 30 : 15) +
    Math.min(25, metrics.releaseHeight * 3) +
    metrics.followThrough * 0.25 +
    metrics.consistency * 0.2
  );

  const grade = gradeMetric(score, { A: 85, B: 70, C: 55, D: 40 });
  return { grade, arcType, recommendations };
}

// Track & field metrics
function evaluateSprintMechanics(metrics: {
  reactionTime: number;     // seconds
  drivePhaseAngle: number;  // degrees
  topSpeed: number;         // m/s
  deceleration: number;     // percentage drop in last 20m
  strideFrequency: number;  // steps/second
}): { grade: string; phase: string; feedback: string[] } {
  const feedback: string[] = [];

  if (metrics.reactionTime < 0.15) feedback.push('Excellent reaction time');
  else if (metrics.reactionTime > 0.25) feedback.push('Reaction time needs work');

  let phase = 'acceleration';
  if (metrics.drivePhaseAngle < 40) { phase = 'drive'; feedback.push('Good low drive angle'); }
  else if (metrics.drivePhaseAngle > 55) feedback.push('Drive phase too upright');

  if (metrics.topSpeed > 10.5) feedback.push('Elite top speed');
  else if (metrics.topSpeed > 9.5) feedback.push('Good top speed');

  if (metrics.deceleration > 8) feedback.push('Speed maintenance needs improvement');

  if (metrics.strideFrequency > 4.5) feedback.push('Excellent turnover rate');
  else if (metrics.strideFrequency < 3.8) feedback.push('Increase stride frequency');

  const score = (
    (metrics.reactionTime < 0.18 ? 20 : 10) +
    (metrics.drivePhaseAngle < 45 ? 20 : 10) +
    Math.min(30, metrics.topSpeed * 2.5) +
    (metrics.deceleration < 5 ? 15 : metrics.deceleration < 8 ? 10 : 5) +
    Math.min(15, metrics.strideFrequency * 3)
  );

  const grade = gradeMetric(score, { A: 85, B: 70, C: 55, D: 40 });
  return { grade, phase, feedback };
}

describe('Sport Modules', () => {
  describe('gradeMetric', () => {
    const scale: GradingScale = { A: 90, B: 80, C: 70, D: 60 };

    it('should grade A for top scores', () => {
      expect(gradeMetric(95, scale)).toBe('A');
      expect(gradeMetric(90, scale)).toBe('A');
    });

    it('should grade B for good scores', () => {
      expect(gradeMetric(85, scale)).toBe('B');
    });

    it('should grade F for lowest scores', () => {
      expect(gradeMetric(50, scale)).toBe('F');
    });
  });

  describe('Football - QB Mechanics', () => {
    it('should grade elite QB highly', () => {
      const result = evaluateQBMechanics({
        releaseTime: 0.35,
        spiralRate: 650,
        armAngle: 52,
        footworkScore: 85,
      });
      expect(result.grade).toBe('A');
      expect(result.strengths).toContain('Quick release');
      expect(result.strengths).toContain('Tight spiral');
      expect(result.strengths).toContain('Ideal arm slot');
      expect(result.strengths).toContain('Strong footwork');
    });

    it('should identify development areas', () => {
      const result = evaluateQBMechanics({
        releaseTime: 0.7,
        spiralRate: 350,
        armAngle: 30,
        footworkScore: 40,
      });
      expect(result.areas).toContain('Slow release time');
      expect(result.areas).toContain('Inconsistent spiral');
      expect(result.areas).toContain('Footwork needs development');
    });

    it('should handle mixed mechanics', () => {
      const result = evaluateQBMechanics({
        releaseTime: 0.38,
        spiralRate: 620,
        armAngle: 30,
        footworkScore: 45,
      });
      expect(result.strengths).toContain('Quick release');
      expect(result.strengths).toContain('Tight spiral');
      expect(result.areas).toContain('Non-traditional arm slot');
      expect(result.areas).toContain('Footwork needs development');
    });
  });

  describe('Basketball - Shooting Form', () => {
    it('should rate optimal shooting form highly', () => {
      const result = evaluateShootingForm({
        releaseAngle: 50,
        releaseHeight: 8.5,
        followThrough: 90,
        consistency: 85,
      });
      expect(result.grade).toBe('A');
      expect(result.arcType).toBe('optimal');
      expect(result.recommendations).toHaveLength(0);
    });

    it('should identify flat shot issues', () => {
      const result = evaluateShootingForm({
        releaseAngle: 38,
        releaseHeight: 7,
        followThrough: 60,
        consistency: 50,
      });
      expect(result.arcType).toBe('flat');
      expect(result.recommendations).toContain('Increase arc for better conversion');
    });

    it('should recommend improvements for inconsistency', () => {
      const result = evaluateShootingForm({
        releaseAngle: 51,
        releaseHeight: 8,
        followThrough: 65,
        consistency: 45,
      });
      expect(result.recommendations).toContain('Work on shot-to-shot consistency');
    });
  });

  describe('Track & Field - Sprint Mechanics', () => {
    it('should rate elite sprinter highly', () => {
      const result = evaluateSprintMechanics({
        reactionTime: 0.14,
        drivePhaseAngle: 38,
        topSpeed: 11.0,
        deceleration: 3,
        strideFrequency: 4.7,
      });
      expect(result.grade).toBe('A');
      expect(result.feedback).toContain('Excellent reaction time');
      expect(result.feedback).toContain('Elite top speed');
      expect(result.feedback).toContain('Excellent turnover rate');
    });

    it('should identify areas for improvement', () => {
      const result = evaluateSprintMechanics({
        reactionTime: 0.3,
        drivePhaseAngle: 60,
        topSpeed: 8.5,
        deceleration: 12,
        strideFrequency: 3.5,
      });
      expect(result.feedback).toContain('Reaction time needs work');
      expect(result.feedback).toContain('Drive phase too upright');
      expect(result.feedback).toContain('Speed maintenance needs improvement');
      expect(result.feedback).toContain('Increase stride frequency');
    });

    it('should detect drive phase', () => {
      const result = evaluateSprintMechanics({
        reactionTime: 0.16,
        drivePhaseAngle: 35,
        topSpeed: 10,
        deceleration: 5,
        strideFrequency: 4.2,
      });
      expect(result.phase).toBe('drive');
      expect(result.feedback).toContain('Good low drive angle');
    });
  });
});
