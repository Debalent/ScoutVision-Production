// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Biomechanics Engine
// Extracts joint angles, stride metrics, jump analysis, center of mass,
// velocity/acceleration, fatigue indicators, and injury risk markers
// from pose estimation keypoints.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Pose,
  KeypointName,
  Point2D,
  Point3D,
  JointAngle,
  StrideMetrics,
  JumpMetrics,
  BiomechanicsFrame,
  FatigueIndicators,
  InjuryRiskMarkers,
} from '../types';

// ─── Joint Angle Computation ────────────────────────────────────────────────

/** Joints defined as [parent, joint, child] triplets */
interface JointDefinition {
  name: string;
  parent: KeypointName;
  joint: KeypointName;
  child: KeypointName;
}

const JOINT_DEFINITIONS: JointDefinition[] = [
  { name: 'left_elbow',    parent: 'left_shoulder',  joint: 'left_elbow',    child: 'left_wrist' },
  { name: 'right_elbow',   parent: 'right_shoulder', joint: 'right_elbow',   child: 'right_wrist' },
  { name: 'left_shoulder',  parent: 'left_hip',      joint: 'left_shoulder', child: 'left_elbow' },
  { name: 'right_shoulder', parent: 'right_hip',     joint: 'right_shoulder',child: 'right_elbow' },
  { name: 'left_knee',     parent: 'left_hip',       joint: 'left_knee',     child: 'left_ankle' },
  { name: 'right_knee',    parent: 'right_hip',      joint: 'right_knee',    child: 'right_ankle' },
  { name: 'left_hip',      parent: 'left_shoulder',  joint: 'left_hip',      child: 'left_knee' },
  { name: 'right_hip',     parent: 'right_shoulder', joint: 'right_hip',     child: 'right_knee' },
  { name: 'trunk',         parent: 'left_shoulder',  joint: 'left_hip',      child: 'left_knee' }, // trunk flexion
];

/**
 * Compute angle at `joint` formed by vectors (parent→joint) and (joint→child).
 * Returns angle in degrees [0, 180].
 */
export function computeAngle(parent: Point2D, joint: Point2D, child: Point2D): number {
  const v1x = parent.x - joint.x;
  const v1y = parent.y - joint.y;
  const v2x = child.x - joint.x;
  const v2y = child.y - joint.y;

  const dot = v1x * v2x + v1y * v2y;
  const cross = v1x * v2y - v1y * v2x;

  const angle = Math.atan2(Math.abs(cross), dot);
  return (angle * 180) / Math.PI;
}

/**
 * Extract all joint angles from a pose.
 */
export function extractJointAngles(
  pose: Pose,
  prevPose: Pose | null,
  dt: number // seconds between frames
): JointAngle[] {
  const angles: JointAngle[] = [];

  for (const def of JOINT_DEFINITIONS) {
    const parent = pose.keypoints[def.parent];
    const joint = pose.keypoints[def.joint];
    const child = pose.keypoints[def.child];

    // Skip if any keypoint has low confidence
    if (parent.confidence < 0.3 || joint.confidence < 0.3 || child.confidence < 0.3) {
      continue;
    }

    const angle = computeAngle(parent, joint, child);

    // Compute angular velocity if we have previous frame
    let angularVelocity = 0;
    if (prevPose && dt > 0) {
      const prevAngle = computeAngle(
        prevPose.keypoints[def.parent],
        prevPose.keypoints[def.joint],
        prevPose.keypoints[def.child]
      );
      angularVelocity = (angle - prevAngle) / dt;
    }

    angles.push({
      joint: def.name,
      angle,
      angularVelocity,
      timestamp: pose.timestamp,
    });
  }

  return angles;
}

// ─── Center of Mass ─────────────────────────────────────────────────────────

/** Body segment weights as fraction of total body mass (Winter, 2009) */
const SEGMENT_WEIGHTS: [KeypointName, number][] = [
  ['nose', 0.081],
  ['left_shoulder', 0.05],
  ['right_shoulder', 0.05],
  ['left_elbow', 0.027],
  ['right_elbow', 0.027],
  ['left_wrist', 0.016],
  ['right_wrist', 0.016],
  ['left_hip', 0.16],
  ['right_hip', 0.16],
  ['left_knee', 0.043],
  ['right_knee', 0.043],
  ['left_ankle', 0.015],
  ['right_ankle', 0.015],
];

export function computeCenterOfMass(keypoints: Record<KeypointName, Point2D>): Point2D {
  let comX = 0, comY = 0, totalWeight = 0;

  for (const [name, weight] of SEGMENT_WEIGHTS) {
    const kp = keypoints[name];
    if (kp.confidence < 0.3) continue;
    comX += kp.x * weight;
    comY += kp.y * weight;
    totalWeight += weight;
  }

  return {
    x: totalWeight > 0 ? comX / totalWeight : 0.5,
    y: totalWeight > 0 ? comY / totalWeight : 0.5,
    confidence: totalWeight > 0 ? totalWeight / 0.703 : 0, // normalize by sum of all weights
  };
}

// ─── Velocity & Acceleration ────────────────────────────────────────────────

export interface MotionState {
  position: Point2D;
  velocity: { x: number; y: number };
  acceleration: { x: number; y: number };
  speed: number;        // magnitude m/s
  timestamp: number;
}

export class MotionTracker {
  private history = new Map<string, MotionState[]>();
  private pixelsPerMeter: number;

  constructor(pixelsPerMeter: number = 100) {
    this.pixelsPerMeter = pixelsPerMeter;
  }

  update(trackId: string, com: Point2D, timestamp: number): MotionState {
    if (!this.history.has(trackId)) this.history.set(trackId, []);
    const states = this.history.get(trackId)!;
    const prev = states[states.length - 1];

    let vx = 0, vy = 0, ax = 0, ay = 0;
    if (prev) {
      const dt = (timestamp - prev.timestamp) / 1000; // to seconds
      if (dt > 0) {
        vx = ((com.x - prev.position.x) * this.pixelsPerMeter) / dt;
        vy = ((com.y - prev.position.y) * this.pixelsPerMeter) / dt;
        ax = (vx - prev.velocity.x) / dt;
        ay = (vy - prev.velocity.y) / dt;
      }
    }

    const state: MotionState = {
      position: com,
      velocity: { x: vx, y: vy },
      acceleration: { x: ax, y: ay },
      speed: Math.sqrt(vx * vx + vy * vy),
      timestamp,
    };

    states.push(state);
    if (states.length > 300) states.shift(); // keep ~10 sec at 30fps

    return state;
  }

  getHistory(trackId: string): MotionState[] {
    return this.history.get(trackId) ?? [];
  }

  reset(): void {
    this.history.clear();
  }
}

// ─── Stride Analysis ────────────────────────────────────────────────────────

export class StrideAnalyzer {
  private footHistory = new Map<string, Array<{
    leftAnkle: Point2D;
    rightAnkle: Point2D;
    timestamp: number;
  }>>();

  private pixelsPerMeter: number;

  constructor(pixelsPerMeter: number = 100) {
    this.pixelsPerMeter = pixelsPerMeter;
  }

  update(trackId: string, pose: Pose): StrideMetrics | null {
    if (!this.footHistory.has(trackId)) this.footHistory.set(trackId, []);
    const history = this.footHistory.get(trackId)!;

    history.push({
      leftAnkle: pose.keypoints.left_ankle,
      rightAnkle: pose.keypoints.right_ankle,
      timestamp: pose.timestamp,
    });

    if (history.length > 90) history.shift(); // ~3 sec at 30fps
    if (history.length < 15) return null;

    // Detect stride events via ankle crossing
    const strides = this.detectStrides(history);
    if (strides.length < 2) return null;

    const lastStride = strides[strides.length - 1];
    const prevStride = strides[strides.length - 2];

    const strideDuration = (lastStride.timestamp - prevStride.timestamp) / 1000;
    const strideLength = this.pixelDistToMeters(lastStride.distance);
    const strideFrequency = strideDuration > 0 ? 1 / strideDuration : 0;

    // Estimate ground contact vs flight from ankle vertical velocity
    const groundContactTime = strideDuration * 0.6 * 1000; // ~60% of stride
    const flightTime = strideDuration * 0.4 * 1000;

    // Vertical oscillation from hip movement
    const recentHipMovement = this.estimateVerticalOscillation(history);

    return {
      strideLength,
      strideFrequency,
      groundContactTime,
      flightTime,
      verticalOscillation: recentHipMovement,
    };
  }

  private detectStrides(
    history: Array<{ leftAnkle: Point2D; rightAnkle: Point2D; timestamp: number }>
  ): Array<{ timestamp: number; distance: number }> {
    const strides: Array<{ timestamp: number; distance: number }> = [];

    for (let i = 1; i < history.length; i++) {
      const prev = history[i - 1];
      const curr = history[i];

      // Detect when feet cross (one foot passes the other)
      const prevDiff = prev.leftAnkle.x - prev.rightAnkle.x;
      const currDiff = curr.leftAnkle.x - curr.rightAnkle.x;

      if (Math.sign(prevDiff) !== Math.sign(currDiff)) {
        const distance = Math.abs(
          Math.sqrt(
            (curr.leftAnkle.x - prev.leftAnkle.x) ** 2 +
            (curr.leftAnkle.y - prev.leftAnkle.y) ** 2
          )
        );
        strides.push({ timestamp: curr.timestamp, distance });
      }
    }

    return strides;
  }

  private estimateVerticalOscillation(
    history: Array<{ leftAnkle: Point2D; rightAnkle: Point2D; timestamp: number }>
  ): number {
    if (history.length < 10) return 0;
    const recent = history.slice(-30);
    const hipYs = recent.map((h) => (h.leftAnkle.y + h.rightAnkle.y) / 2);
    const minY = Math.min(...hipYs);
    const maxY = Math.max(...hipYs);
    return this.pixelDistToMeters(maxY - minY) * 100; // cm
  }

  private pixelDistToMeters(pixels: number): number {
    return pixels * this.pixelsPerMeter;
  }

  reset(): void {
    this.footHistory.clear();
  }
}

// ─── Jump Analysis ──────────────────────────────────────────────────────────

export function analyzeJump(
  poseSequence: Pose[],
  pixelsPerMeter: number = 100
): JumpMetrics | null {
  if (poseSequence.length < 5) return null;

  // Track hip height over time
  const hipHeights = poseSequence.map((pose) => {
    const leftHip = pose.keypoints.left_hip;
    const rightHip = pose.keypoints.right_hip;
    return {
      y: (leftHip.y + rightHip.y) / 2,
      timestamp: pose.timestamp,
    };
  });

  // Find takeoff (lowest hip point) and peak (highest hip point)
  let takeoffIdx = 0;
  let peakIdx = 0;
  let minY = Infinity;   // lowest point (highest pixel value = bottom of image)
  let maxHeight = 0;

  for (let i = 0; i < hipHeights.length; i++) {
    if (hipHeights[i].y > minY) continue;
    // Look for peak after this potential takeoff
    for (let j = i + 1; j < hipHeights.length; j++) {
      const height = hipHeights[i].y - hipHeights[j].y;
      if (height > maxHeight) {
        maxHeight = height;
        takeoffIdx = i;
        peakIdx = j;
      }
    }
  }

  if (maxHeight < 0.01) return null; // no significant jump detected

  const jumpHeight = maxHeight * pixelsPerMeter * 100; // to cm
  const hangTimeMs = hipHeights[peakIdx].timestamp - hipHeights[takeoffIdx].timestamp;
  const takeoffVelocity = Math.sqrt(2 * 9.81 * (jumpHeight / 100)); // v = sqrt(2gh)

  // Knee valgus at landing (injury risk indicator)
  const landingPose = poseSequence[Math.min(peakIdx + 3, poseSequence.length - 1)];
  const kneeValgus = computeKneeValgus(landingPose);

  // Estimated landing force (simplified)
  const landingForce = 1 + (jumpHeight / 30); // body-weight multiples

  return {
    jumpHeight,
    takeoffVelocity,
    hangTime: hangTimeMs,
    landingForce,
    kneeValgusAngle: kneeValgus,
  };
}

function computeKneeValgus(pose: Pose): number {
  // Knee valgus = medial collapse of knee relative to hip-ankle line
  const leftHip = pose.keypoints.left_hip;
  const leftKnee = pose.keypoints.left_knee;
  const leftAnkle = pose.keypoints.left_ankle;

  // Angle at knee in frontal plane
  return computeAngle(
    { x: leftHip.x, y: leftHip.y, confidence: 1 },
    { x: leftKnee.x, y: leftKnee.y, confidence: 1 },
    { x: leftAnkle.x, y: leftAnkle.y, confidence: 1 }
  );
}

// ─── Fatigue Detection ──────────────────────────────────────────────────────

export class FatigueDetector {
  private baselineWindows = new Map<string, MotionState[]>();
  private currentWindows = new Map<string, MotionState[]>();
  private baselineStride = new Map<string, StrideMetrics[]>();
  private currentStride = new Map<string, StrideMetrics[]>();

  /**
   * Update fatigue indicators for a player.
   * Compares recent movement patterns against early-game baseline.
   */
  analyze(
    trackId: string,
    motion: MotionState,
    stride: StrideMetrics | null
  ): FatigueIndicators {
    // Manage windows
    if (!this.baselineWindows.has(trackId)) {
      this.baselineWindows.set(trackId, []);
      this.currentWindows.set(trackId, []);
      this.baselineStride.set(trackId, []);
      this.currentStride.set(trackId, []);
    }

    const baseline = this.baselineWindows.get(trackId)!;
    const current = this.currentWindows.get(trackId)!;

    // First 60 seconds = baseline, after that = current
    if (baseline.length < 1800) { // 60sec * 30fps
      baseline.push(motion);
      if (stride) this.baselineStride.get(trackId)!.push(stride);
    }

    current.push(motion);
    if (current.length > 300) current.shift(); // 10-second window
    if (stride) {
      const cs = this.currentStride.get(trackId)!;
      cs.push(stride);
      if (cs.length > 30) cs.shift();
    }

    // Compute decay metrics
    const baselineSpeed = this.avgSpeed(baseline);
    const currentSpeed = this.avgSpeed(current);
    const movementDecay = baselineSpeed > 0
      ? Math.max(0, 1 - currentSpeed / baselineSpeed)
      : 0;

    // Stride consistency (variance of stride length)
    const strideConsistency = this.computeStrideConsistency(
      this.currentStride.get(trackId)!
    );

    // Posture degradation (approximated by vertical oscillation changes)
    const postureScore = this.computePostureScore(current);

    const overallFatigueScore = (
      movementDecay * 0.4 +
      (1 - strideConsistency) * 0.3 +
      (1 - postureScore) * 0.3
    );

    return {
      movementDecay,
      strideConsistency,
      reactionTimeDecay: movementDecay * 0.8, // correlated with movement decay
      postureScore,
      overallFatigueScore: Math.min(1, Math.max(0, overallFatigueScore)),
    };
  }

  private avgSpeed(states: MotionState[]): number {
    if (states.length === 0) return 0;
    return states.reduce((s, m) => s + m.speed, 0) / states.length;
  }

  private computeStrideConsistency(strides: StrideMetrics[]): number {
    if (strides.length < 3) return 1;
    const lengths = strides.map((s) => s.strideLength);
    const mean = lengths.reduce((a, b) => a + b, 0) / lengths.length;
    const variance = lengths.reduce((s, l) => s + (l - mean) ** 2, 0) / lengths.length;
    const cv = mean > 0 ? Math.sqrt(variance) / mean : 0;
    return Math.max(0, 1 - cv * 2); // 0 cv = perfect, 0.5 cv = 0 consistency
  }

  private computePostureScore(states: MotionState[]): number {
    if (states.length < 10) return 1;
    // Lower center of mass = worse posture (slouching)
    const recent = states.slice(-30);
    const avgY = recent.reduce((s, m) => s + m.position.y, 0) / recent.length;
    // Normalize: higher avgY (lower in frame) means worse posture
    return Math.max(0, Math.min(1, 1 - avgY * 0.5));
  }

  reset(): void {
    this.baselineWindows.clear();
    this.currentWindows.clear();
    this.baselineStride.clear();
    this.currentStride.clear();
  }
}

// ─── Injury Risk Assessment ─────────────────────────────────────────────────

export function assessInjuryRisk(
  recentBiomechanics: BiomechanicsFrame[],
  sportContext?: { sport: string; position: string }
): InjuryRiskMarkers {
  if (recentBiomechanics.length === 0) {
    return defaultInjuryRisk();
  }

  // Knee valgus risk — from jump landings and cutting movements
  const kneeAngles = recentBiomechanics
    .flatMap((b) => b.jointAngles.filter((j) => j.joint.includes('knee')))
    .map((j) => j.angle);
  const avgKneeAngle = mean(kneeAngles);
  const kneeValgusRisk = avgKneeAngle < 160 ? (160 - avgKneeAngle) / 30 : 0;

  // Ankle instability — from lateral acceleration patterns
  const lateralAccels = recentBiomechanics.map((b) => Math.abs(b.acceleration.x));
  const ankleInstability = mean(lateralAccels) > 5 ? 0.4 : mean(lateralAccels) / 12;

  // Hamstring strain risk — from hip-knee angular velocity
  const hipAngularVelocities = recentBiomechanics
    .flatMap((b) => b.jointAngles.filter((j) => j.joint.includes('hip')))
    .map((j) => Math.abs(j.angularVelocity));
  const hamstringStrain = mean(hipAngularVelocities) > 300 ? 0.6 : mean(hipAngularVelocities) / 500;

  // Shoulder impingement — from shoulder angles
  const shoulderAngles = recentBiomechanics
    .flatMap((b) => b.jointAngles.filter((j) => j.joint.includes('shoulder')))
    .map((j) => j.angle);
  const shoulderImpingement = mean(shoulderAngles) > 150 ? 0.3 : 0.1;

  // Overuse index — based on accumulated workload
  const totalDistance = recentBiomechanics.reduce(
    (s, b) => s + Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2),
    0
  );
  const overuseIndex = Math.min(1, totalDistance / 10000); // arbitrary threshold

  // Detect compensation patterns
  const compensationPatterns: string[] = [];
  const latestFatigue = recentBiomechanics[recentBiomechanics.length - 1]?.fatigue;
  if (latestFatigue && latestFatigue.overallFatigueScore > 0.6) {
    compensationPatterns.push('Movement decay detected — possible overcompensation');
  }
  if (kneeValgusRisk > 0.5) {
    compensationPatterns.push('Medial knee collapse during dynamic movements');
  }

  const overallRisk = (
    kneeValgusRisk * 0.25 +
    ankleInstability * 0.15 +
    hamstringStrain * 0.25 +
    shoulderImpingement * 0.1 +
    overuseIndex * 0.25
  );

  const recommendations: string[] = [];
  if (kneeValgusRisk > 0.4) recommendations.push('Add knee stabilization exercises and hip strengthening');
  if (hamstringStrain > 0.4) recommendations.push('Eccentric hamstring program (Nordic curls) recommended');
  if (overuseIndex > 0.6) recommendations.push('Consider load management — reduce training volume');
  if (latestFatigue && latestFatigue.overallFatigueScore > 0.5) {
    recommendations.push('Active recovery session recommended before next high-intensity workout');
  }

  return {
    overallRisk: clamp(overallRisk),
    kneeValgusRisk: clamp(kneeValgusRisk),
    ankleInstability: clamp(ankleInstability),
    hamstringStrain: clamp(hamstringStrain),
    shoulderImpingement: clamp(shoulderImpingement),
    overuseIndex: clamp(overuseIndex),
    compensationPatterns,
    recommendations,
  };
}

function defaultInjuryRisk(): InjuryRiskMarkers {
  return {
    overallRisk: 0,
    kneeValgusRisk: 0,
    ankleInstability: 0,
    hamstringStrain: 0,
    shoulderImpingement: 0,
    overuseIndex: 0,
    compensationPatterns: [],
    recommendations: [],
  };
}

function mean(arr: number[]): number {
  return arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
}

function clamp(v: number): number {
  return Math.min(1, Math.max(0, v));
}
