// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Predictive Models
// Performance projection, growth trajectory, injury prediction,
// position-fit analysis, NIL valuation, recruitment likelihood.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  PerformanceProjection,
  GrowthTrajectoryFeatures,
  InjuryPrediction,
  PositionFitAnalysis,
  NILValuation,
  RecruitmentLikelihood,
  Sport,
} from '../types';

// ═══════════════════════════════════════════════════════════════════════════
// 1. Performance Projection
// ═══════════════════════════════════════════════════════════════════════════

export interface PerformanceProjectionInput {
  playerId: string;
  sport: Sport;
  position: string;
  age: number;
  /** Historical metric snapshots keyed by date (ISO) */
  metricHistory: Array<{
    date: string;
    metrics: Record<string, number>;
  }>;
  /** Physical measurements */
  physicals: {
    heightCm: number;
    weightKg: number;
    wingspanCm?: number;
    verticalCm?: number;
    fortyYardDash?: number;
    shuttleTime?: number;
  };
  /** Academic standing for eligibility projections */
  academicYear?: 'freshman' | 'sophomore' | 'junior' | 'senior';
}

/**
 * Projects future performance using linear trend + age-curve adjustment.
 * Real implementation would use gradient-boosted trees or neural networks
 * trained on historical prospect → pro transition data.
 */
export function projectPerformance(
  input: PerformanceProjectionInput,
): PerformanceProjection {
  const { metricHistory, age, position, sport } = input;

  // Compute metric trends (linear regression slope per metric)
  const trends: Record<string, number> = {};
  const currentMetrics: Record<string, number> = {};

  if (metricHistory.length >= 2) {
    const firstSnap = metricHistory[0].metrics;
    const lastSnap = metricHistory[metricHistory.length - 1].metrics;
    const timeDeltaYears = (
      new Date(metricHistory[metricHistory.length - 1].date).getTime() -
      new Date(metricHistory[0].date).getTime()
    ) / (365.25 * 24 * 60 * 60 * 1000);

    for (const key of Object.keys(lastSnap)) {
      currentMetrics[key] = lastSnap[key];
      if (firstSnap[key] !== undefined && timeDeltaYears > 0) {
        trends[key] = (lastSnap[key] - firstSnap[key]) / timeDeltaYears;
      }
    }
  } else if (metricHistory.length === 1) {
    Object.assign(currentMetrics, metricHistory[0].metrics);
  }

  // Age-curve adjustment: development peaks by sport
  const peakAges: Record<string, number> = {
    football: 27, basketball: 28, soccer: 27, baseball: 29,
    track: 26, volleyball: 27, hockey: 27, lacrosse: 27,
    rugby: 28, tennis: 26,
  };
  const peakAge = peakAges[sport] ?? 27;
  const yearsToPredict = [1, 2, 3];

  // Aging curve multiplier (quadratic decline after peak)
  const ageFactor = (futureAge: number): number => {
    if (futureAge <= peakAge) {
      // Still developing: gradual improvement
      return 1 + 0.02 * (peakAge - futureAge);
    }
    // Post-peak: gradual decline
    return 1 - 0.015 * (futureAge - peakAge) ** 1.3;
  };

  const projections = yearsToPredict.map((y) => {
    const futureAge = age + y;
    const factor = ageFactor(futureAge);
    const projected: Record<string, number> = {};
    for (const [key, value] of Object.entries(currentMetrics)) {
      const trend = trends[key] ?? 0;
      projected[key] = Math.max(0, (value + trend * y) * factor);
    }
    return { year: y, age: futureAge, metrics: projected };
  });

  // Overall ceiling score (0-100)
  const physicalScore = computePhysicalScore(input.physicals, sport);
  const trendScore = Object.values(trends).reduce((s, t) => s + (t > 0 ? 1 : -0.5), 0);
  const ceiling = Math.min(100, Math.max(0,
    physicalScore * 0.4 +
    Math.min(40, trendScore * 10) +
    (age < 20 ? 20 : age < 23 ? 15 : 10)
  ));

  return {
    playerId: input.playerId,
    sport,
    position,
    currentAge: age,
    projections,
    ceilingScore: ceiling,
    floorScore: ceiling * 0.55,
    confidence: Math.min(0.95, 0.3 + metricHistory.length * 0.1),
    comparablePlayers: [], // would be filled by similarity search
  };
}

function computePhysicalScore(
  physicals: PerformanceProjectionInput['physicals'],
  sport: Sport,
): number {
  let score = 50;

  // Height/weight ratio evaluation (sport-specific)
  const bmi = physicals.weightKg / (physicals.heightCm / 100) ** 2;

  if (sport === 'football') {
    if (physicals.heightCm > 185) score += 5;
    if (physicals.fortyYardDash && physicals.fortyYardDash < 4.6) score += 10;
    if (physicals.verticalCm && physicals.verticalCm > 85) score += 5;
  } else if (sport === 'basketball') {
    if (physicals.heightCm > 195) score += 8;
    if (physicals.wingspanCm && physicals.wingspanCm > physicals.heightCm + 5) score += 5;
    if (physicals.verticalCm && physicals.verticalCm > 80) score += 7;
  } else if (sport === 'soccer') {
    if (physicals.shuttleTime && physicals.shuttleTime < 4.0) score += 8;
    if (bmi >= 20 && bmi <= 24) score += 5;
  } else if (sport === 'track') {
    if (physicals.fortyYardDash && physicals.fortyYardDash < 4.4) score += 10;
    if (physicals.heightCm > 175 && physicals.heightCm < 195) score += 3;
  }

  return Math.min(100, score);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Growth Trajectory
// ═══════════════════════════════════════════════════════════════════════════

export interface GrowthTrajectoryInput {
  playerId: string;
  sport: Sport;
  features: GrowthTrajectoryFeatures;
  /** Array of past evaluations with overall scores */
  evaluationHistory: Array<{ date: string; overallScore: number }>;
}

export interface GrowthTrajectory {
  playerId: string;
  trajectory: 'elite_ascent' | 'steady_growth' | 'plateau' | 'declining' | 'inconsistent';
  growthRate: number; // annual score change
  projectedDraftStock: number; // 1-100
  developmentStage: 'raw' | 'developing' | 'polished' | 'pro_ready';
  strengths: string[];
  weaknesses: string[];
  confidence: number;
}

export function analyzeGrowthTrajectory(input: GrowthTrajectoryInput): GrowthTrajectory {
  const { evaluationHistory, features } = input;

  // Compute growth rate via linear regression on evaluation scores
  let growthRate = 0;
  if (evaluationHistory.length >= 2) {
    const sorted = [...evaluationHistory].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    const timeSpanYears = (
      new Date(sorted[sorted.length - 1].date).getTime() -
      new Date(sorted[0].date).getTime()
    ) / (365.25 * 24 * 60 * 60 * 1000);

    if (timeSpanYears > 0) {
      growthRate = (sorted[sorted.length - 1].overallScore - sorted[0].overallScore) / timeSpanYears;
    }
  }

  // Classify trajectory
  let trajectory: GrowthTrajectory['trajectory'];
  if (growthRate > 8) trajectory = 'elite_ascent';
  else if (growthRate > 2) trajectory = 'steady_growth';
  else if (growthRate > -2) trajectory = 'plateau';
  else trajectory = 'declining';

  // Check consistency
  if (evaluationHistory.length >= 3) {
    const scores = evaluationHistory.map((e) => e.overallScore);
    const mean = scores.reduce((a, b) => a + b, 0) / scores.length;
    const stddev = Math.sqrt(scores.reduce((s, v) => s + (v - mean) ** 2, 0) / scores.length);
    if (stddev > 10) trajectory = 'inconsistent';
  }

  // Development stage
  const latestScore = evaluationHistory.length > 0
    ? evaluationHistory[evaluationHistory.length - 1].overallScore
    : 50;

  let developmentStage: GrowthTrajectory['developmentStage'];
  if (latestScore >= 85) developmentStage = 'pro_ready';
  else if (latestScore >= 70) developmentStage = 'polished';
  else if (latestScore >= 50) developmentStage = 'developing';
  else developmentStage = 'raw';

  // Identify strengths/weaknesses from features
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (features.athleticismTrend > 0) strengths.push('Improving athleticism');
  else if (features.athleticismTrend < -2) weaknesses.push('Declining athleticism');

  if (features.technicalGrowthRate > 5) strengths.push('Rapid technical development');
  if (features.coachabilitySignals > 7) strengths.push('High coachability');
  if (features.competitionLevelAdjustment > 0.9) strengths.push('Performs at higher competition levels');
  else if (features.competitionLevelAdjustment < 0.7) weaknesses.push('Not tested at elite competition');

  if (features.injuryHistoryFactor < 0.7) weaknesses.push('Injury concern');
  if (features.consistencyScore < 0.5) weaknesses.push('Performance inconsistency');

  return {
    playerId: input.playerId,
    trajectory,
    growthRate,
    projectedDraftStock: Math.min(100, latestScore + growthRate * 2),
    developmentStage,
    strengths,
    weaknesses,
    confidence: Math.min(0.9, 0.2 + evaluationHistory.length * 0.08),
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Injury Prediction
// ═══════════════════════════════════════════════════════════════════════════

export interface InjuryPredictionInput {
  playerId: string;
  sport: Sport;
  position: string;
  age: number;
  /** Biomechanics summary averages */
  biomechanics: {
    avgKneeValgusAngle: number;
    avgAnkleInstability: number;
    hamstringStrainRisk: number;
    shoulderLoadIndex: number;
    overuseIndex: number;
    groundContactAsymmetry: number;
    fatigueScore: number;
  };
  /** Previous injuries */
  injuryHistory: Array<{
    type: string;
    severity: 'minor' | 'moderate' | 'severe';
    date: string;
    recoveryWeeks: number;
  }>;
  /** Workload (minutes played per week, recent 8 weeks) */
  weeklyMinutes: number[];
}

export function predictInjuryRisk(input: InjuryPredictionInput): InjuryPrediction {
  const { biomechanics, injuryHistory, weeklyMinutes, sport, position, age } = input;

  // Base risk factors
  let overallRisk = 0.1; // baseline 10%

  // Biomechanics risk
  if (biomechanics.avgKneeValgusAngle > 15) overallRisk += 0.15;
  if (biomechanics.avgAnkleInstability > 0.6) overallRisk += 0.1;
  if (biomechanics.hamstringStrainRisk > 0.5) overallRisk += 0.12;
  if (biomechanics.shoulderLoadIndex > 0.7) overallRisk += 0.08;
  if (biomechanics.overuseIndex > 0.6) overallRisk += 0.1;
  if (biomechanics.groundContactAsymmetry > 10) overallRisk += 0.08;
  if (biomechanics.fatigueScore > 0.7) overallRisk += 0.1;

  // Injury history: recurrence risk
  const severeInjuries = injuryHistory.filter((i) => i.severity === 'severe').length;
  const recentInjuries = injuryHistory.filter((i) => {
    const daysAgo = (Date.now() - new Date(i.date).getTime()) / (1000 * 60 * 60 * 24);
    return daysAgo < 365;
  }).length;
  overallRisk += severeInjuries * 0.05;
  overallRisk += recentInjuries * 0.08;

  // Workload spike detection (acute:chronic ratio)
  let workloadRisk = 0;
  if (weeklyMinutes.length >= 4) {
    const recent = weeklyMinutes.slice(-2).reduce((a, b) => a + b, 0) / 2;
    const chronic = weeklyMinutes.reduce((a, b) => a + b, 0) / weeklyMinutes.length;
    const acuteChronicRatio = chronic > 0 ? recent / chronic : 1;
    if (acuteChronicRatio > 1.5) workloadRisk = 0.15;
    else if (acuteChronicRatio > 1.3) workloadRisk = 0.08;
    else if (acuteChronicRatio < 0.5) workloadRisk = 0.05; // under-training risk
  }
  overallRisk += workloadRisk;

  // Age factor
  if (age > 28) overallRisk += 0.05;
  if (age > 32) overallRisk += 0.1;

  // Clamp
  overallRisk = Math.min(0.95, Math.max(0.01, overallRisk));

  // Identify specific risks
  const risks: Array<{ area: string; probability: number; severity: string }> = [];

  if (biomechanics.avgKneeValgusAngle > 12) {
    risks.push({
      area: 'ACL / Knee',
      probability: Math.min(0.4, biomechanics.avgKneeValgusAngle * 0.02),
      severity: 'severe',
    });
  }
  if (biomechanics.hamstringStrainRisk > 0.4) {
    risks.push({
      area: 'Hamstring',
      probability: biomechanics.hamstringStrainRisk * 0.5,
      severity: 'moderate',
    });
  }
  if (biomechanics.shoulderLoadIndex > 0.6 && ['P', 'SP', 'RP', 'QB'].includes(position)) {
    risks.push({
      area: 'Shoulder / UCL',
      probability: biomechanics.shoulderLoadIndex * 0.3,
      severity: 'severe',
    });
  }
  if (biomechanics.overuseIndex > 0.5) {
    risks.push({
      area: 'Stress Fracture',
      probability: biomechanics.overuseIndex * 0.2,
      severity: 'moderate',
    });
  }

  // Recommendations
  const recommendations: string[] = [];
  if (workloadRisk > 0.1) recommendations.push('Reduce training load — acute:chronic ratio elevated');
  if (biomechanics.avgKneeValgusAngle > 12) recommendations.push('Implement knee valgus correction program');
  if (biomechanics.fatigueScore > 0.7) recommendations.push('Additional recovery protocols recommended');
  if (biomechanics.groundContactAsymmetry > 8) recommendations.push('Address gait asymmetry with corrective exercises');
  if (recentInjuries > 0) recommendations.push('Extended warm-up and sport-specific prehab');

  return {
    playerId: input.playerId,
    overallRisk,
    riskLevel: overallRisk > 0.6 ? 'high' : overallRisk > 0.3 ? 'moderate' : 'low',
    specificRisks: risks,
    recommendations,
    confidence: 0.7,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Position-Fit Analysis
// ═══════════════════════════════════════════════════════════════════════════

export interface PositionFitInput {
  playerId: string;
  sport: Sport;
  currentPosition: string;
  physicals: PerformanceProjectionInput['physicals'];
  metrics: Record<string, number>;
  /** Position archetypes with ideal metric ranges */
  archetypes?: PositionArchetype[];
}

export interface PositionArchetype {
  position: string;
  idealMetrics: Record<string, { min: number; max: number; weight: number }>;
  physicalRequirements: {
    minHeightCm?: number;
    maxHeightCm?: number;
    minWeightKg?: number;
    maxWeightKg?: number;
  };
}

export function analyzePositionFit(input: PositionFitInput): PositionFitAnalysis {
  const { sport, currentPosition, physicals, metrics } = input;
  const archetypes = input.archetypes ?? getDefaultArchetypes(sport);

  const fits: Array<{ position: string; score: number; gaps: string[] }> = [];

  for (const arch of archetypes) {
    let totalScore = 0;
    let totalWeight = 0;
    const gaps: string[] = [];

    // Physical fit
    let physFit = 1;
    if (arch.physicalRequirements.minHeightCm && physicals.heightCm < arch.physicalRequirements.minHeightCm) {
      physFit -= 0.3;
      gaps.push(`Height (${physicals.heightCm}cm) below ideal ${arch.physicalRequirements.minHeightCm}cm`);
    }
    if (arch.physicalRequirements.maxHeightCm && physicals.heightCm > arch.physicalRequirements.maxHeightCm) {
      physFit -= 0.2;
    }

    totalScore += physFit * 30;
    totalWeight += 30;

    // Metric fit
    for (const [metricKey, ideal] of Object.entries(arch.idealMetrics)) {
      const actual = metrics[metricKey];
      if (actual === undefined) continue;

      const range = ideal.max - ideal.min;
      let fit: number;
      if (actual >= ideal.min && actual <= ideal.max) {
        fit = 1; // within ideal range
      } else if (actual < ideal.min) {
        fit = Math.max(0, 1 - (ideal.min - actual) / range);
        if (fit < 0.5) gaps.push(`${metricKey} below ideal range`);
      } else {
        fit = Math.max(0, 1 - (actual - ideal.max) / range);
      }

      totalScore += fit * ideal.weight;
      totalWeight += ideal.weight;
    }

    const score = totalWeight > 0 ? (totalScore / totalWeight) * 100 : 50;
    fits.push({ position: arch.position, score, gaps });
  }

  // Sort by score descending
  fits.sort((a, b) => b.score - a.score);

  const bestFit = fits[0];
  const currentFit = fits.find((f) => f.position === currentPosition) ?? fits[0];

  return {
    playerId: input.playerId,
    sport,
    currentPosition,
    bestPosition: bestFit?.position ?? currentPosition,
    positionScores: fits.map((f) => ({
      position: f.position,
      fitScore: f.score,
      gaps: f.gaps,
    })),
    shouldConsiderPositionChange: bestFit?.position !== currentPosition && bestFit?.score - currentFit.score > 15,
    confidence: 0.65,
  };
}

function getDefaultArchetypes(sport: Sport): PositionArchetype[] {
  // Minimal defaults — would be expanded with real data
  if (sport === 'football') {
    return [
      {
        position: 'QB', idealMetrics: { timeToThrow: { min: 2, max: 3.5, weight: 15 } },
        physicalRequirements: { minHeightCm: 185 },
      },
      {
        position: 'WR', idealMetrics: { burstScore: { min: 7, max: 10, weight: 20 } },
        physicalRequirements: { minHeightCm: 175 },
      },
      {
        position: 'RB', idealMetrics: { burstScore: { min: 6, max: 10, weight: 15 } },
        physicalRequirements: { minWeightKg: 85 },
      },
    ];
  }
  if (sport === 'basketball') {
    return [
      {
        position: 'PG', idealMetrics: { dribbleEfficiency: { min: 6, max: 10, weight: 20 } },
        physicalRequirements: { minHeightCm: 178 },
      },
      {
        position: 'C', idealMetrics: { reboundPosition: { min: 6, max: 10, weight: 20 } },
        physicalRequirements: { minHeightCm: 205 },
      },
    ];
  }
  return [];
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. NIL Valuation
// ═══════════════════════════════════════════════════════════════════════════

export interface NILValuationInput {
  playerId: string;
  sport: Sport;
  position: string;
  schoolTier: 'power5' | 'group5' | 'fcs' | 'D2' | 'D3' | 'NAIA' | 'juco';
  performanceScore: number; // 0-100
  socialMediaFollowers: {
    instagram?: number;
    twitter?: number;
    tiktok?: number;
  };
  marketSize: 'large' | 'medium' | 'small';
  awards: string[];
  mediaAppearances: number;
  teamSuccess: number; // win percentage 0-1
}

export function computeNILValuation(input: NILValuationInput): NILValuation {
  const { sport, position, schoolTier, performanceScore, socialMediaFollowers, marketSize } = input;

  // Base value by school tier
  const tierMultipliers: Record<string, number> = {
    power5: 1.0, group5: 0.5, fcs: 0.2, D2: 0.1, D3: 0.05, NAIA: 0.03, juco: 0.02,
  };
  const tierMult = tierMultipliers[schoolTier] ?? 0.1;

  // Sport value multiplier
  const sportMultipliers: Record<string, number> = {
    football: 1.0, basketball: 0.9, baseball: 0.4, soccer: 0.3,
    track: 0.15, volleyball: 0.2, hockey: 0.3, lacrosse: 0.15,
  };
  const sportMult = sportMultipliers[sport] ?? 0.2;

  // Social media value
  const totalFollowers = (socialMediaFollowers.instagram ?? 0) +
    (socialMediaFollowers.twitter ?? 0) +
    (socialMediaFollowers.tiktok ?? 0);

  const socialValue = Math.log10(Math.max(1, totalFollowers)) * 15000;

  // Performance-based value
  const perfValue = performanceScore * performanceScore * 5; // quadratic scaling

  // Market size adjustment
  const marketMult = marketSize === 'large' ? 1.3 : marketSize === 'medium' ? 1.0 : 0.7;

  // Awards bonus
  const awardBonus = input.awards.length * 5000;

  // Team success bonus
  const teamBonus = input.teamSuccess * 10000;

  // Total valuation
  const rawValue = (perfValue + socialValue + awardBonus + teamBonus) * tierMult * sportMult * marketMult;
  const estimatedValue = Math.round(rawValue / 100) * 100; // round to nearest $100

  // Marketability score
  const marketability = Math.min(100, Math.round(
    (totalFollowers > 100000 ? 30 : totalFollowers > 10000 ? 20 : 10) +
    (performanceScore * 0.4) +
    (input.awards.length * 5) +
    (input.mediaAppearances * 2)
  ));

  return {
    playerId: input.playerId,
    estimatedValue,
    marketability,
    endorsementPotential: estimatedValue * 0.6,
    socialMediaValue: Math.round(socialValue * tierMult),
    performanceValue: Math.round(perfValue * tierMult * sportMult),
    projectedGrowth: performanceScore > 70 ? 0.15 : 0.05, // 15% or 5% annual growth
    comparableDeals: [], // would be populated from deal database
    confidence: 0.5,
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Recruitment Likelihood
// ═══════════════════════════════════════════════════════════════════════════

export interface RecruitmentLikelihoodInput {
  playerId: string;
  sport: Sport;
  position: string;
  performanceScore: number;
  academicGPA: number;
  testScores?: { sat?: number; act?: number };
  targetSchoolTier: 'power5' | 'group5' | 'fcs' | 'D2' | 'D3' | 'NAIA';
  geographicRegion: string;
  recruitingClass: string;
  existingOffers: number;
  campAttendance: number;
}

export function predictRecruitmentLikelihood(
  input: RecruitmentLikelihoodInput,
): RecruitmentLikelihood {
  const { performanceScore, academicGPA, targetSchoolTier, existingOffers } = input;

  // Tier thresholds
  const tierThresholds: Record<string, number> = {
    power5: 80, group5: 65, fcs: 50, D2: 40, D3: 30, NAIA: 25,
  };

  const threshold = tierThresholds[targetSchoolTier] ?? 50;

  // Performance fit
  const perfFit = Math.min(1, performanceScore / threshold);

  // Academic eligibility
  const academicOk = academicGPA >= 2.3 ? 1 : academicGPA >= 2.0 ? 0.5 : 0.2;

  // Existing interest signal
  const interestSignal = Math.min(1, existingOffers * 0.15);

  // Camp/exposure factor
  const exposureFactor = Math.min(1, input.campAttendance * 0.1);

  // Composite likelihood
  const likelihood = Math.min(0.95, Math.max(0.05,
    perfFit * 0.5 +
    academicOk * 0.15 +
    interestSignal * 0.2 +
    exposureFactor * 0.15
  ));

  // Action recommendations
  const actions: string[] = [];
  if (perfFit < 0.7) actions.push('Focus on improving measurable performance metrics');
  if (academicOk < 1) actions.push('Improve academic standing to meet eligibility requirements');
  if (existingOffers === 0) actions.push('Attend camps and showcases for exposure');
  if (input.campAttendance < 3) actions.push('Increase camp attendance at target schools');
  if (performanceScore > threshold) actions.push('Create and submit highlight film to coaching staff');

  return {
    playerId: input.playerId,
    targetTier: targetSchoolTier,
    likelihood,
    confidenceLevel: 0.55,
    keyFactors: [
      { factor: 'Performance', impact: perfFit },
      { factor: 'Academics', impact: academicOk },
      { factor: 'Existing Interest', impact: interestSignal },
      { factor: 'Exposure', impact: exposureFactor },
    ],
    recommendedActions: actions,
    timelineWeeks: performanceScore > threshold ? 12 : 24,
  };
}
