/**
 * ScoutVision AI - Predictive Models Tests
 */

import { describe, it, expect } from 'vitest';

// Test predictive model calculations
interface ProspectProfile {
  age: number;
  position: string;
  sport: string;
  gpa: number;
  height: number;  // inches
  weight: number;  // lbs
  fortyYard?: number;
  verticalJump?: number;
  benchPress?: number;
  stats: Record<string, number>;
  classYear: number;
}

interface Projection {
  overall: number;
  ceiling: number;
  floor: number;
  confidence: number;
  timeframe: string;
}

function projectPerformance(prospect: ProspectProfile, monthsAhead: number): Projection {
  const baseScore = calculateBaseScore(prospect);
  const ageGrowthFactor = prospect.age < 17 ? 1.15 : prospect.age < 18 ? 1.08 : 1.02;
  const timeFactor = 1 + (monthsAhead / 48) * (ageGrowthFactor - 1);

  const projected = Math.min(99, baseScore * timeFactor);
  const uncertainty = monthsAhead * 0.5;

  return {
    overall: Math.round(projected),
    ceiling: Math.min(99, Math.round(projected + uncertainty)),
    floor: Math.max(1, Math.round(projected - uncertainty)),
    confidence: Math.max(0.3, 1 - monthsAhead * 0.015),
    timeframe: `${monthsAhead} months`,
  };
}

function calculateBaseScore(prospect: ProspectProfile): number {
  let score = 50;
  score += Math.max(0, (prospect.gpa - 2.0) * 5);
  if (prospect.fortyYard) score += Math.max(0, (5.5 - prospect.fortyYard) * 10);
  if (prospect.verticalJump) score += Math.min(15, prospect.verticalJump * 0.3);
  return Math.min(99, Math.max(1, score));
}

function calculatePositionFit(
  prospect: ProspectProfile,
  targetPosition: string
): { fitScore: number; strengths: string[]; gaps: string[] } {
  const strengths: string[] = [];
  const gaps: string[] = [];
  let fitScore = 50;

  // Height/weight checks by position
  const positionProfiles: Record<string, { minHeight: number; maxHeight: number; minWeight: number; maxWeight: number }> = {
    QB: { minHeight: 72, maxHeight: 78, minWeight: 200, maxWeight: 250 },
    WR: { minHeight: 69, maxHeight: 76, minWeight: 170, maxWeight: 215 },
    RB: { minHeight: 66, maxHeight: 73, minWeight: 185, maxWeight: 230 },
    OL: { minHeight: 74, maxHeight: 80, minWeight: 280, maxWeight: 340 },
    CB: { minHeight: 68, maxHeight: 74, minWeight: 175, maxWeight: 205 },
  };

  const profile = positionProfiles[targetPosition];
  if (profile) {
    if (prospect.height >= profile.minHeight && prospect.height <= profile.maxHeight) {
      fitScore += 15;
      strengths.push('Height within ideal range');
    } else {
      fitScore -= 10;
      gaps.push('Height outside ideal range');
    }
    if (prospect.weight >= profile.minWeight && prospect.weight <= profile.maxWeight) {
      fitScore += 15;
      strengths.push('Weight within ideal range');
    } else {
      fitScore -= 10;
      gaps.push('Weight outside ideal range');
    }
  }

  if (prospect.gpa >= 3.0) {
    fitScore += 10;
    strengths.push('Strong academics');
  }

  if (prospect.fortyYard && prospect.fortyYard < 4.6 && ['WR', 'CB', 'RB'].includes(targetPosition)) {
    fitScore += 10;
    strengths.push('Elite speed for position');
  }

  return { fitScore: Math.min(99, Math.max(1, fitScore)), strengths, gaps };
}

function estimateNILValue(prospect: ProspectProfile, followers: number, engagementRate: number): {
  estimatedValue: number;
  tier: string;
  factors: string[];
} {
  const factors: string[] = [];
  let value = 5000; // Base

  // Athletic performance multiplier
  const baseScore = calculateBaseScore(prospect);
  if (baseScore >= 80) {
    value *= 3;
    factors.push('Elite athletic rating');
  } else if (baseScore >= 65) {
    value *= 1.5;
    factors.push('Above average athletic rating');
  }

  // Social media multiplier
  if (followers > 100000) {
    value *= 4;
    factors.push('Large social media following');
  } else if (followers > 10000) {
    value *= 2;
    factors.push('Growing social media presence');
  }

  // Engagement multiplier
  if (engagementRate > 5) {
    value *= 1.5;
    factors.push('High engagement rate');
  }

  const tier = value >= 100000 ? 'premium' : value >= 25000 ? 'mid-tier' : 'emerging';
  return { estimatedValue: Math.round(value), tier, factors };
}

describe('Predictive Models', () => {
  const mockProspect: ProspectProfile = {
    age: 17,
    position: 'QB',
    sport: 'football',
    gpa: 3.5,
    height: 74,
    weight: 210,
    fortyYard: 4.7,
    verticalJump: 32,
    stats: {},
    classYear: 2025,
  };

  describe('projectPerformance', () => {
    it('should project improvement for younger prospects', () => {
      const projection = projectPerformance(mockProspect, 12);
      expect(projection.overall).toBeGreaterThan(calculateBaseScore(mockProspect));
      expect(projection.timeframe).toBe('12 months');
    });

    it('should have wider range for longer projections', () => {
      const short = projectPerformance(mockProspect, 6);
      const long = projectPerformance(mockProspect, 24);
      const shortRange = short.ceiling - short.floor;
      const longRange = long.ceiling - long.floor;
      expect(longRange).toBeGreaterThan(shortRange);
    });

    it('should have higher confidence for shorter projections', () => {
      const short = projectPerformance(mockProspect, 6);
      const long = projectPerformance(mockProspect, 24);
      expect(short.confidence).toBeGreaterThan(long.confidence);
    });

    it('should cap overall at 99', () => {
      const elite = { ...mockProspect, gpa: 4.0, fortyYard: 4.3, verticalJump: 40 };
      const projection = projectPerformance(elite, 36);
      expect(projection.overall).toBeLessThanOrEqual(99);
      expect(projection.ceiling).toBeLessThanOrEqual(99);
    });

    it('should floor at 1', () => {
      const projection = projectPerformance(mockProspect, 6);
      expect(projection.floor).toBeGreaterThanOrEqual(1);
    });

    it('should project less growth for older prospects', () => {
      const young = projectPerformance({ ...mockProspect, age: 16 }, 12);
      const old = projectPerformance({ ...mockProspect, age: 19 }, 12);
      expect(young.overall).toBeGreaterThanOrEqual(old.overall);
    });
  });

  describe('calculateBaseScore', () => {
    it('should produce higher score for better GPA', () => {
      const low = calculateBaseScore({ ...mockProspect, gpa: 2.0 });
      const high = calculateBaseScore({ ...mockProspect, gpa: 4.0 });
      expect(high).toBeGreaterThan(low);
    });

    it('should produce higher score for faster 40 time', () => {
      const slow = calculateBaseScore({ ...mockProspect, fortyYard: 5.2 });
      const fast = calculateBaseScore({ ...mockProspect, fortyYard: 4.4 });
      expect(fast).toBeGreaterThan(slow);
    });

    it('should cap at 99', () => {
      const perfect = calculateBaseScore({
        ...mockProspect, gpa: 4.0, fortyYard: 4.0, verticalJump: 50,
      });
      expect(perfect).toBeLessThanOrEqual(99);
    });

    it('should floor at 1', () => {
      const minimal = calculateBaseScore({
        ...mockProspect, gpa: 1.0, fortyYard: undefined, verticalJump: undefined,
      });
      expect(minimal).toBeGreaterThanOrEqual(1);
    });
  });

  describe('calculatePositionFit', () => {
    it('should rate QB with ideal measurables highly', () => {
      const result = calculatePositionFit(mockProspect, 'QB');
      expect(result.fitScore).toBeGreaterThan(70);
      expect(result.strengths).toContain('Height within ideal range');
      expect(result.strengths).toContain('Weight within ideal range');
    });

    it('should identify gaps for undersized OL', () => {
      const small = { ...mockProspect, height: 68, weight: 180 };
      const result = calculatePositionFit(small, 'OL');
      expect(result.gaps).toContain('Height outside ideal range');
      expect(result.gaps).toContain('Weight outside ideal range');
      expect(result.fitScore).toBeLessThan(50);
    });

    it('should reward speed for skill positions', () => {
      const fast = { ...mockProspect, fortyYard: 4.4, height: 72, weight: 195 };
      const result = calculatePositionFit(fast, 'WR');
      expect(result.strengths).toContain('Elite speed for position');
    });

    it('should reward strong academics', () => {
      const result = calculatePositionFit(mockProspect, 'QB');
      expect(result.strengths).toContain('Strong academics');
    });

    it('should return valid score range', () => {
      const result = calculatePositionFit(mockProspect, 'CB');
      expect(result.fitScore).toBeGreaterThanOrEqual(1);
      expect(result.fitScore).toBeLessThanOrEqual(99);
    });
  });

  describe('estimateNILValue', () => {
    it('should estimate higher value for elite athletes', () => {
      const elite = { ...mockProspect, gpa: 4.0, fortyYard: 4.3, verticalJump: 40 };
      const result = estimateNILValue(elite, 5000, 3);
      expect(result.factors).toContain('Elite athletic rating');
    });

    it('should multiply value for large following', () => {
      const noFollowing = estimateNILValue(mockProspect, 1000, 3);
      const bigFollowing = estimateNILValue(mockProspect, 150000, 3);
      expect(bigFollowing.estimatedValue).toBeGreaterThan(noFollowing.estimatedValue);
      expect(bigFollowing.factors).toContain('Large social media following');
    });

    it('should assign correct tier', () => {
      const premium = estimateNILValue(
        { ...mockProspect, gpa: 4.0, fortyYard: 4.3, verticalJump: 40 },
        200000, 6
      );
      expect(premium.tier).toBe('premium');
    });

    it('should identify engagement factor', () => {
      const engaged = estimateNILValue(mockProspect, 50000, 8);
      expect(engaged.factors).toContain('High engagement rate');
    });
  });
});
