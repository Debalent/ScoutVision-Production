// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Core Type System
// Complete type definitions for computer vision, biomechanics,
// sport-specific analytics, predictive modeling, and LLM intelligence.
// ═══════════════════════════════════════════════════════════════════════════

// ─── Primitives ─────────────────────────────────────────────────────────────

/** 2D point in image space (normalized 0-1) */
export interface Point2D {
  x: number;
  y: number;
  confidence: number;
}

/** 3D point in world space (meters) */
export interface Point3D {
  x: number;
  y: number;
  z: number;
  confidence: number;
}

/** Axis-aligned bounding box */
export interface BoundingBox {
  x: number;      // top-left x (normalized 0-1)
  y: number;      // top-left y (normalized 0-1)
  width: number;
  height: number;
  confidence: number;
}

/** Oriented bounding box */
export interface OrientedBBox extends BoundingBox {
  angle: number; // radians
}

/** Color in ScoutVision palette */
export interface Color {
  r: number;
  g: number;
  b: number;
  a?: number;
}

/** Time range within a video */
export interface TimeRange {
  startMs: number;
  endMs: number;
}

// ─── Supported Sports ───────────────────────────────────────────────────────

export type Sport =
  | 'football'
  | 'basketball'
  | 'soccer'
  | 'baseball'
  | 'track'
  | 'volleyball'
  | 'lacrosse'
  | 'softball'
  | 'swimming'
  | 'wrestling';

export type SportPosition = string; // sport-specific: "QB", "PG", "CF", etc.

// ─── Computer Vision ────────────────────────────────────────────────────────

/** Detected player in a single frame */
export interface PlayerDetection {
  id: string;
  trackId: string | null;     // assigned after tracking
  bbox: BoundingBox;
  teamId: string | null;
  jerseyNumber: number | null;
  classification: 'player' | 'referee' | 'coach' | 'other';
  frameIndex: number;
  timestamp: number;          // ms
}

/** Ball detection */
export interface BallDetection {
  bbox: BoundingBox;
  sport: Sport;
  velocity: Point3D | null;
  spin: number | null;        // rpm (baseball/basketball)
  frameIndex: number;
  timestamp: number;
}

/** Player track across multiple frames */
export interface PlayerTrack {
  trackId: string;
  detections: PlayerDetection[];
  startFrame: number;
  endFrame: number;
  avgConfidence: number;
  teamId: string | null;
  jerseyNumber: number | null;
}

/** Field/court homography */
export interface FieldCalibration {
  sport: Sport;
  homography: number[][];     // 3x3 matrix
  fieldCorners: Point2D[];
  cameraAngle: 'sideline' | 'endzone' | 'overhead' | 'broadcast' | 'unknown';
  resolution: { width: number; height: number };
}

/** Segmentation mask */
export interface SegmentationMask {
  classId: number;
  className: 'field' | 'player' | 'ball' | 'goal' | 'sideline' | 'crowd';
  mask: Uint8Array;           // binary mask, same dims as frame
  area: number;               // pixel area
}

// ─── Pose Estimation ────────────────────────────────────────────────────────

/** COCO-17 keypoint names */
export type KeypointName =
  | 'nose' | 'left_eye' | 'right_eye' | 'left_ear' | 'right_ear'
  | 'left_shoulder' | 'right_shoulder' | 'left_elbow' | 'right_elbow'
  | 'left_wrist' | 'right_wrist' | 'left_hip' | 'right_hip'
  | 'left_knee' | 'right_knee' | 'left_ankle' | 'right_ankle';

/** Single-person pose */
export interface Pose {
  trackId: string;
  keypoints: Record<KeypointName, Point2D>;
  keypoints3D?: Record<KeypointName, Point3D>;
  score: number;
  frameIndex: number;
  timestamp: number;
}

/** Multi-person pose result for a single frame */
export interface FramePoses {
  frameIndex: number;
  timestamp: number;
  poses: Pose[];
}

// ─── Biomechanics ───────────────────────────────────────────────────────────

/** Joint angle measurement */
export interface JointAngle {
  joint: string;              // e.g., "left_knee", "right_elbow"
  angle: number;              // degrees
  angularVelocity: number;    // deg/s
  timestamp: number;
}

/** Stride analysis */
export interface StrideMetrics {
  strideLength: number;       // meters
  strideFrequency: number;    // strides/sec
  groundContactTime: number;  // ms
  flightTime: number;         // ms
  verticalOscillation: number; // cm
}

/** Jump analysis */
export interface JumpMetrics {
  jumpHeight: number;         // cm
  takeoffVelocity: number;    // m/s
  hangTime: number;           // ms
  landingForce: number;       // estimated body-weight multiples
  kneeValgusAngle: number;    // degrees (injury risk indicator)
}

/** Full biomechanics snapshot for a player at a timestamp */
export interface BiomechanicsFrame {
  trackId: string;
  timestamp: number;
  centerOfMass: Point3D;
  velocity: Point3D;          // m/s
  acceleration: Point3D;      // m/s²
  jointAngles: JointAngle[];
  stride: StrideMetrics | null;
  jump: JumpMetrics | null;
  fatigue: FatigueIndicators | null;
}

/** Fatigue detection */
export interface FatigueIndicators {
  movementDecay: number;      // 0-1 (1 = severe fatigue)
  strideConsistency: number;  // 0-1 (1 = perfectly consistent)
  reactionTimeDecay: number;  // 0-1
  postureScore: number;       // 0-1 (1 = optimal posture)
  overallFatigueScore: number; // 0-1
}

/** Injury risk assessment */
export interface InjuryRiskMarkers {
  overallRisk: number;        // 0-1
  kneeValgusRisk: number;
  ankleInstability: number;
  hamstringStrain: number;
  shoulderImpingement: number;
  overuseIndex: number;
  compensationPatterns: string[];
  recommendations: string[];
}

// ─── Sport-Specific Metrics ─────────────────────────────────────────────────

/** Football-specific */
export interface FootballMetrics {
  sport: 'football';
  routeSeparation: number;    // yards
  burstScore: number;         // 0-10
  pocketMovement: number;     // yards
  tacklingForm: number;       // 0-10
  passRushWinRate: number;    // 0-1
  completionRate: number;     // 0-1
  avgDepthOfTarget: number;   // yards
  timeToThrow: number;        // seconds
  yardsAfterCatch: number;
  breakTackleRate: number;    // 0-1
}

/** Basketball-specific */
export interface BasketballMetrics {
  sport: 'basketball';
  shotReleaseSpeed: number;   // ms
  shotArc: number;            // degrees
  dribbleEfficiency: number;  // 0-10
  defensiveFootwork: number;  // 0-10
  closeoutSpeed: number;      // m/s
  reboundPosition: number;    // 0-10
  courtCoverage: number;      // sq meters per minute
  pickAndRollEfficiency: number; // 0-1
  transitionSpeed: number;    // m/s
}

/** Soccer-specific */
export interface SoccerMetrics {
  sport: 'soccer';
  sprintAcceleration: number; // m/s²
  pressingIntensity: number;  // 0-10
  offBallMovement: number;    // 0-10
  passCompletionRate: number; // 0-1
  expectedGoals: number;      // xG
  distanceCovered: number;    // km
  highIntensityRuns: number;  // count
  tackleSuccessRate: number;  // 0-1
  crossAccuracy: number;      // 0-1
}

/** Baseball-specific */
export interface BaseballMetrics {
  sport: 'baseball';
  pitchVelocity: number;     // mph
  pitchSpin: number;          // rpm
  pitchBreak: Point2D;       // horizontal & vertical break (inches)
  batSpeed: number;           // mph
  launchAngle: number;        // degrees
  exitVelocity: number;       // mph
  swingPath: number;          // degrees
  reactionTime: number;       // ms
  catcherPopTime: number;     // seconds
}

/** Track-specific */
export interface TrackMetrics {
  sport: 'track';
  strideEfficiency: number;   // 0-10
  splitTimes: number[];       // per-segment split in seconds
  hurdleForm: number;         // 0-10
  blockStart: number;         // reaction time ms
  maxVelocity: number;        // m/s
  accelerationPhase: number;  // meters
  decelerationRate: number;   // m/s² negative
  groundContactAsymmetry: number; // % difference L vs R
}

/** Union type for any sport metrics */
export type SportMetrics =
  | FootballMetrics
  | BasketballMetrics
  | SoccerMetrics
  | BaseballMetrics
  | TrackMetrics;

// ─── Play Classification ────────────────────────────────────────────────────

export type PlayType =
  // Football
  | 'pass_play' | 'run_play' | 'screen' | 'play_action' | 'rpo' | 'blitz'
  | 'punt' | 'field_goal' | 'kickoff'
  // Basketball
  | 'pick_and_roll' | 'isolation' | 'fast_break' | 'post_up' | 'spot_up'
  | 'off_screen' | 'transition'
  // Soccer
  | 'corner_kick' | 'free_kick' | 'throw_in' | 'goal_kick'
  | 'counter_attack' | 'build_up' | 'pressing'
  // Baseball
  | 'at_bat' | 'pitch' | 'stolen_base' | 'double_play' | 'sacrifice';

export interface PlayClassification {
  playType: PlayType;
  confidence: number;
  timeRange: TimeRange;
  formation: string | null;
  personnel: string | null;
  result: string | null;
  involvedPlayers: string[];  // trackIds
}

// ─── Highlight Detection ────────────────────────────────────────────────────

export type HighlightType =
  | 'touchdown' | 'interception' | 'sack' | 'big_hit'
  | 'three_pointer' | 'dunk' | 'block' | 'steal' | 'alley_oop'
  | 'goal' | 'save' | 'assist'
  | 'home_run' | 'strikeout' | 'diving_catch'
  | 'personal_best' | 'photo_finish'
  | 'big_play' | 'momentum_shift';

export interface Highlight {
  type: HighlightType;
  confidence: number;
  timeRange: TimeRange;
  impactScore: number;        // 0-10
  involvedPlayers: string[];
  description: string;
  thumbnailFrame: number;
}

// ─── Predictive Models ──────────────────────────────────────────────────────

/** Performance projection */
export interface PerformanceProjection {
  athleteId: string;
  sport: Sport;
  currentMetrics: SportMetrics;
  projectedMetrics: SportMetrics;
  projectionHorizon: '6mo' | '1yr' | '2yr' | '4yr';
  confidence: number;
  growthTrajectory: 'elite' | 'above_average' | 'average' | 'below_average';
  ceilingComparison: string;  // "Similar trajectory to <pro player>"
  floorComparison: string;
}

/** Growth trajectory features */
export interface GrowthTrajectoryFeatures {
  age: number;
  heightPercentile: number;
  weightPercentile: number;
  maturityIndex: number;      // Khamis-Roche or similar
  parentalHeights: [number, number] | null;
  trainingAge: number;        // years of structured training
  performanceHistory: Array<{ date: string; metrics: Partial<SportMetrics> }>;
}

/** Position-fit analysis */
export interface PositionFitAnalysis {
  athleteId: string;
  sport: Sport;
  currentPosition: SportPosition;
  fittedPositions: Array<{
    position: SportPosition;
    fitScore: number;         // 0-100
    strengths: string[];
    gaps: string[];
  }>;
  recommendation: string;
}

/** NIL valuation */
export interface NILValuation {
  athleteId: string;
  estimatedValue: number;     // USD annual
  tier: 'premium' | 'standard' | 'emerging' | 'developmental';
  socialMediaScore: number;
  performanceScore: number;
  marketScore: number;
  projectedGrowth: number;    // % annual
  comparables: string[];
}

/** Injury prediction */
export interface InjuryPrediction {
  athleteId: string;
  overallRisk: number;        // 0-1
  riskLevel: 'low' | 'moderate' | 'elevated' | 'high';
  specificRisks: Array<{
    injury: string;
    probability: number;
    timeframe: string;
    contributingFactors: string[];
  }>;
  recommendations: string[];
  workloadStatus: 'optimal' | 'elevated' | 'critical';
}

/** Recruitment likelihood */
export interface RecruitmentLikelihood {
  athleteId: string;
  targetProgramId: string;
  likelihood: number;         // 0-1
  factors: Array<{ factor: string; weight: number; score: number }>;
  competingPrograms: Array<{ programId: string; threat: number }>;
  recommendedActions: string[];
}

// ─── LLM Intelligence ───────────────────────────────────────────────────────

/** Scouting report generated by LLM */
export interface ScoutingReport {
  athleteId: string;
  generatedAt: string;
  sport: Sport;
  position: SportPosition;
  overallGrade: number;       // 0-100
  summary: string;
  strengths: string[];
  weaknesses: string[];
  comparison: string;         // "Plays like a young <player>"
  developmentPlan: string[];
  recruitingRecommendation: 'must_get' | 'priority' | 'target' | 'watch' | 'pass';
  sections: Array<{
    title: string;
    content: string;
    grade: number;
  }>;
}

/** Game summary */
export interface GameSummary {
  gameId: string;
  sport: Sport;
  generatedAt: string;
  headline: string;
  narrative: string;
  keyPlays: Highlight[];
  playerPerformances: Array<{
    athleteId: string;
    summary: string;
    grade: number;
    standoutMetrics: Record<string, number>;
  }>;
  tacticalInsights: string[];
}

/** Player comparison */
export interface PlayerComparison {
  players: [string, string];  // athleteIds
  sport: Sport;
  generatedAt: string;
  summary: string;
  metricComparisons: Array<{
    metric: string;
    player1Value: number;
    player2Value: number;
    advantage: 'player1' | 'player2' | 'even';
  }>;
  strengthComparison: string;
  projectionComparison: string;
  recommendation: string;
}

/** Team-fit recommendation */
export interface TeamFitRecommendation {
  athleteId: string;
  programId: string;
  fitScore: number;           // 0-100
  systemFit: string;          // how they fit the offensive/defensive system
  cultureFit: string;
  academicFit: string;
  competitionAnalysis: string; // current roster competition
  impactProjection: string;
  overallRecommendation: string;
}

// ─── Pipeline Types ─────────────────────────────────────────────────────────

/** Input to the AI pipeline */
export interface PipelineInput {
  videoId: string;
  videoUrl: string;
  sport: Sport;
  athleteIds?: string[];
  config: PipelineConfig;
}

/** Pipeline configuration */
export interface PipelineConfig {
  enableDetection: boolean;
  enableTracking: boolean;
  enablePose: boolean;
  enableBiomechanics: boolean;
  enablePlayClassification: boolean;
  enableHighlights: boolean;
  enableSportMetrics: boolean;
  enableLLMSummary: boolean;
  samplingFps: number;        // frame sampling rate
  batchSize: number;
  device: 'cpu' | 'cuda' | 'tensorrt';
  precision: 'fp32' | 'fp16' | 'int8';
  maxConcurrentFrames: number;
}

/** Full pipeline output */
export interface PipelineOutput {
  videoId: string;
  sport: Sport;
  processingTime: number;     // ms
  frameCount: number;
  fps: number;
  fieldCalibration: FieldCalibration | null;
  tracks: PlayerTrack[];
  ballTrack: BallDetection[];
  poses: FramePoses[];
  biomechanics: BiomechanicsFrame[];
  playClassifications: PlayClassification[];
  highlights: Highlight[];
  sportMetrics: Record<string, SportMetrics>;  // trackId -> metrics
  injuryRisks: Record<string, InjuryRiskMarkers>;
  report: ScoutingReport | null;
  errors: PipelineError[];
}

export interface PipelineError {
  stage: string;
  message: string;
  frameIndex?: number;
  severity: 'warning' | 'error' | 'fatal';
}

// ─── Model Registry ─────────────────────────────────────────────────────────

export type ModelTask =
  | 'detection'
  | 'tracking'
  | 'pose_estimation'
  | 'ball_detection'
  | 'field_calibration'
  | 'segmentation'
  | 'play_classification'
  | 'highlight_detection'
  | 'biomechanics'
  | 'sport_metrics'
  | 'injury_prediction'
  | 'performance_projection'
  | 'nil_valuation'
  | 'scouting_report'
  | 'game_summary';

export interface ModelMetadata {
  id: string;
  name: string;
  version: string;
  task: ModelTask;
  sport: Sport | 'universal';
  framework: 'onnx' | 'tensorrt' | 'pytorch' | 'tensorflow';
  inputShape: number[];
  outputShape: number[];
  precision: 'fp32' | 'fp16' | 'int8';
  fileSize: number;           // bytes
  accuracy: number;           // mAP, PCK, etc.
  latency: number;            // ms per inference
  trainedOn: string;
  lastUpdated: string;
}

// ─── Training Types ─────────────────────────────────────────────────────────

export interface TrainingConfig {
  modelId: string;
  task: ModelTask;
  sport: Sport | 'universal';
  backbone: string;           // e.g., "yolov8x", "hrnet_w48", "resnet50"
  epochs: number;
  batchSize: number;
  learningRate: number;
  weightDecay: number;
  optimizer: 'adam' | 'adamw' | 'sgd';
  scheduler: 'cosine' | 'step' | 'onecycle' | 'warmup_cosine';
  augmentations: string[];
  datasetPath: string;
  validationSplit: number;
  earlyStopping: boolean;
  patience: number;
  checkpointDir: string;
  wandbProject: string | null;
}

export interface TrainingMetrics {
  epoch: number;
  trainLoss: number;
  valLoss: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1: number;
  mAP?: number;
  pck?: number;               // Percentage of Correct Keypoints
  oks?: number;               // Object Keypoint Similarity
  learningRate: number;
  timestamp: string;
}

// ─── Evaluation Types ───────────────────────────────────────────────────────

export interface EvaluationReport {
  modelId: string;
  task: ModelTask;
  sport: Sport | 'universal';
  dataset: string;
  metrics: {
    accuracy: number;
    precision: number;
    recall: number;
    f1: number;
    mAP50?: number;
    mAP75?: number;
    pck50?: number;
    pck75?: number;
    oks?: number;
    latencyP50: number;
    latencyP95: number;
    latencyP99: number;
    throughput: number;       // frames/sec
  };
  fairness: {
    ageGroupVariance: number;
    genderVariance: number;
    lightingVariance: number;
    cameraAngleVariance: number;
  };
  crossSportValidation: Record<Sport, number>;
  failureCases: Array<{
    description: string;
    frameIndex: number;
    expectedOutput: string;
    actualOutput: string;
  }>;
  generatedAt: string;
}
