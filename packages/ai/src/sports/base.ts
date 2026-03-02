// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Sport Module Base
// Defines the abstract interface all sport-specific metric extractors
// must implement. Enables modular plug-and-play sport support.
// ═══════════════════════════════════════════════════════════════════════════

import type {
  Sport,
  SportMetrics,
  Pose,
  PlayerTrack,
  BallDetection,
  PlayClassification,
  HighlightType,
  Highlight,
  BiomechanicsFrame,
  FieldCalibration,
} from '../types';

// ─── Sport Module Interface ─────────────────────────────────────────────────

export interface SportModuleContext {
  poses: Pose[];
  tracks: PlayerTrack[];
  ballDetections: BallDetection[];
  biomechanics: BiomechanicsFrame[];
  fieldCalibration: FieldCalibration | null;
  fps: number;
  durationMs: number;
}

export interface SportModule {
  readonly sport: Sport;
  readonly supportedPositions: string[];
  readonly metricDefinitions: MetricDefinition[];

  /** Compute sport-specific metrics for a player track */
  computeMetrics(
    trackId: string,
    context: SportModuleContext
  ): SportMetrics;

  /** Classify plays in the video */
  classifyPlays(context: SportModuleContext): PlayClassification[];

  /** Detect sport-specific highlights */
  detectHighlights(context: SportModuleContext): Highlight[];

  /** Get applicable highlight types for this sport */
  getHighlightTypes(): HighlightType[];
}

export interface MetricDefinition {
  key: string;
  name: string;
  unit: string;
  description: string;
  range: [number, number];
  higherIsBetter: boolean;
  positions: string[];  // positions this metric applies to, or ['*'] for all
}

// ─── Sport Module Registry ──────────────────────────────────────────────────

const sportModules = new Map<Sport, SportModule>();

export function registerSportModule(module: SportModule): void {
  sportModules.set(module.sport, module);
  console.log(`[SportModule] Registered: ${module.sport} (${module.supportedPositions.length} positions)`);
}

export function getSportModule(sport: Sport): SportModule | undefined {
  return sportModules.get(sport);
}

export function listSportModules(): Sport[] {
  return [...sportModules.keys()];
}

// ─── Helper Utilities ───────────────────────────────────────────────────────

export function getTrackPoses(trackId: string, poses: Pose[]): Pose[] {
  return poses.filter((p) => p.trackId === trackId).sort((a, b) => a.timestamp - b.timestamp);
}

export function getTrackBiomechanics(trackId: string, biomechanics: BiomechanicsFrame[]): BiomechanicsFrame[] {
  return biomechanics.filter((b) => b.trackId === trackId).sort((a, b) => a.timestamp - b.timestamp);
}

export function computeDistanceCovered(positions: Array<{ x: number; y: number }>, pixelsPerMeter: number = 1): number {
  let total = 0;
  for (let i = 1; i < positions.length; i++) {
    const dx = positions[i].x - positions[i - 1].x;
    const dy = positions[i].y - positions[i - 1].y;
    total += Math.sqrt(dx * dx + dy * dy) * pixelsPerMeter;
  }
  return total;
}

export function computeMaxSpeed(
  biomechanics: BiomechanicsFrame[]
): number {
  if (biomechanics.length === 0) return 0;
  return Math.max(...biomechanics.map((b) =>
    Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2)
  ));
}

export function computeAvgSpeed(biomechanics: BiomechanicsFrame[]): number {
  if (biomechanics.length === 0) return 0;
  const speeds = biomechanics.map((b) => Math.sqrt(b.velocity.x ** 2 + b.velocity.y ** 2));
  return speeds.reduce((a, b) => a + b, 0) / speeds.length;
}
