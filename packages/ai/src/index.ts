// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Main Package Export
// @scoutvision/ai
// ═══════════════════════════════════════════════════════════════════════════

// Types
export * from './types';

// Model Registry
export { registry, ModelRegistry, MODEL_CATALOG } from './models/registry';

// Computer Vision
export {
  preprocessFrame,
  parseDetections,
  nonMaxSuppression,
  classifyTeams,
} from './cv/detection';
export { MultiObjectTracker } from './cv/tracking';
export {
  processFramePoses,
  PoseSmoother,
  computeOKS,
  liftTo3D,
} from './cv/pose';

// Biomechanics
export {
  extractJointAngles,
  computeCenterOfMass,
  MotionTracker,
  StrideAnalyzer,
  analyzeJump,
  FatigueDetector,
  assessInjuryRisk,
} from './biomechanics';

// Sports
export {
  registerSportModule,
  getSportModule,
  listSportModules,
  footballModule,
  basketballModule,
  soccerModule,
  baseballModule,
  trackModule,
} from './sports';

// Predictive Models
export {
  projectPerformance,
  analyzeGrowthTrajectory,
  predictInjuryRisk,
  analyzePositionFit,
  computeNILValuation,
  predictRecruitmentLikelihood,
} from './predictive';

// LLM Intelligence
export {
  createLLMClient,
  generateScoutingReport,
  generateGameSummary,
  generatePlayerComparison,
  generateTeamFitRecommendation,
  parseSearchQuery,
  generateBatchReports,
} from './llm';

// Pipeline
export {
  ScoutVisionPipeline,
  createPipeline,
  createFrameExtractor,
  computeSampleIndices,
} from './pipeline';
