// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — Model Registry
// Central system for registering, versioning, loading, and managing
// all AI models across the platform.
// ═══════════════════════════════════════════════════════════════════════════

import type { ModelMetadata, ModelTask, Sport } from './types';

// ─── Base Model Interface ───────────────────────────────────────────────────

export interface AIModel<TInput = unknown, TOutput = unknown> {
  readonly metadata: ModelMetadata;
  load(): Promise<void>;
  unload(): void;
  isLoaded(): boolean;
  predict(input: TInput): Promise<TOutput>;
  predictBatch(inputs: TInput[]): Promise<TOutput[]>;
  warmup(): Promise<void>;
  getLatency(): number;
}

// ─── Registry ───────────────────────────────────────────────────────────────

type ModelFactory = () => AIModel;

interface RegisteredModel {
  metadata: ModelMetadata;
  factory: ModelFactory;
  instance: AIModel | null;
}

class ModelRegistry {
  private models = new Map<string, RegisteredModel>();
  private loadedModels = new Map<string, AIModel>();
  private maxLoadedModels = 8; // GPU memory management

  /** Register a model with the registry */
  register(metadata: ModelMetadata, factory: ModelFactory): void {
    if (this.models.has(metadata.id)) {
      console.warn(`[ModelRegistry] Overwriting model: ${metadata.id}`);
    }
    this.models.set(metadata.id, { metadata, factory, instance: null });
    console.log(`[ModelRegistry] Registered: ${metadata.name} v${metadata.version} (${metadata.task})`);
  }

  /** Get a loaded model instance */
  async get(modelId: string): Promise<AIModel> {
    const existing = this.loadedModels.get(modelId);
    if (existing?.isLoaded()) return existing;

    const registered = this.models.get(modelId);
    if (!registered) throw new Error(`[ModelRegistry] Unknown model: ${modelId}`);

    // Evict LRU if at capacity
    if (this.loadedModels.size >= this.maxLoadedModels) {
      this.evictOldest();
    }

    const model = registered.factory();
    await model.load();
    await model.warmup();
    this.loadedModels.set(modelId, model);
    registered.instance = model;
    console.log(`[ModelRegistry] Loaded: ${registered.metadata.name}`);
    return model;
  }

  /** Find the best model for a task + sport */
  findBest(task: ModelTask, sport: Sport | 'universal' = 'universal'): ModelMetadata | null {
    let best: ModelMetadata | null = null;
    let bestAccuracy = -1;

    for (const { metadata } of this.models.values()) {
      if (metadata.task !== task) continue;
      if (metadata.sport !== sport && metadata.sport !== 'universal') continue;

      // Prefer sport-specific over universal, then highest accuracy
      const sportBonus = metadata.sport === sport ? 0.1 : 0;
      const effectiveAccuracy = metadata.accuracy + sportBonus;

      if (effectiveAccuracy > bestAccuracy) {
        bestAccuracy = effectiveAccuracy;
        best = metadata;
      }
    }

    return best;
  }

  /** List all registered models */
  list(filter?: { task?: ModelTask; sport?: Sport | 'universal' }): ModelMetadata[] {
    const result: ModelMetadata[] = [];
    for (const { metadata } of this.models.values()) {
      if (filter?.task && metadata.task !== filter.task) continue;
      if (filter?.sport && metadata.sport !== filter.sport && metadata.sport !== 'universal') continue;
      result.push(metadata);
    }
    return result.sort((a, b) => b.accuracy - a.accuracy);
  }

  /** Unload a specific model */
  unload(modelId: string): void {
    const model = this.loadedModels.get(modelId);
    if (model) {
      model.unload();
      this.loadedModels.delete(modelId);
      const registered = this.models.get(modelId);
      if (registered) registered.instance = null;
      console.log(`[ModelRegistry] Unloaded: ${modelId}`);
    }
  }

  /** Unload all models */
  unloadAll(): void {
    for (const [id] of this.loadedModels) {
      this.unload(id);
    }
  }

  /** Get registry stats */
  stats(): { registered: number; loaded: number; totalSize: number } {
    let totalSize = 0;
    for (const { metadata } of this.models.values()) {
      totalSize += metadata.fileSize;
    }
    return {
      registered: this.models.size,
      loaded: this.loadedModels.size,
      totalSize,
    };
  }

  private evictOldest(): void {
    const [oldest] = this.loadedModels.keys();
    if (oldest) this.unload(oldest);
  }
}

// ─── Singleton ──────────────────────────────────────────────────────────────

export const registry = new ModelRegistry();

// ─── Default Model Catalog ──────────────────────────────────────────────────
// These are the reference models ScoutVision ships with.
// Each one gets a real implementation in the respective module.

export const MODEL_CATALOG: ModelMetadata[] = [
  // ── Detection ──
  {
    id: 'sv-detect-v1',
    name: 'ScoutVision Player Detector',
    version: '1.0.0',
    task: 'detection',
    sport: 'universal',
    framework: 'onnx',
    inputShape: [1, 3, 640, 640],
    outputShape: [1, 8400, 6],
    precision: 'fp16',
    fileSize: 48_000_000,
    accuracy: 0.912,
    latency: 8.2,
    trainedOn: 'SportsMOT + custom ScoutVision set',
    lastUpdated: '2026-02-01',
  },
  // ── Tracking ──
  {
    id: 'sv-track-v1',
    name: 'ScoutVision Multi-Object Tracker',
    version: '1.0.0',
    task: 'tracking',
    sport: 'universal',
    framework: 'onnx',
    inputShape: [1, 512],
    outputShape: [1, 128],
    precision: 'fp16',
    fileSize: 12_000_000,
    accuracy: 0.874,
    latency: 2.1,
    trainedOn: 'SportsMOT + MOT20',
    lastUpdated: '2026-02-01',
  },
  // ── Pose ──
  {
    id: 'sv-pose-v1',
    name: 'ScoutVision Pose Estimator',
    version: '1.0.0',
    task: 'pose_estimation',
    sport: 'universal',
    framework: 'onnx',
    inputShape: [1, 3, 384, 288],
    outputShape: [1, 17, 3],
    precision: 'fp16',
    fileSize: 64_000_000,
    accuracy: 0.891,
    latency: 6.5,
    trainedOn: 'COCO + SportsPose + custom',
    lastUpdated: '2026-02-01',
  },
  // ── Ball Detection ──
  {
    id: 'sv-ball-v1',
    name: 'ScoutVision Ball Detector',
    version: '1.0.0',
    task: 'ball_detection',
    sport: 'universal',
    framework: 'onnx',
    inputShape: [1, 3, 320, 320],
    outputShape: [1, 2100, 5],
    precision: 'fp16',
    fileSize: 24_000_000,
    accuracy: 0.847,
    latency: 4.3,
    trainedOn: 'Multi-sport ball dataset',
    lastUpdated: '2026-02-01',
  },
  // ── Field Calibration ──
  {
    id: 'sv-field-v1',
    name: 'ScoutVision Field Calibrator',
    version: '1.0.0',
    task: 'field_calibration',
    sport: 'universal',
    framework: 'onnx',
    inputShape: [1, 3, 512, 512],
    outputShape: [1, 8],
    precision: 'fp32',
    fileSize: 32_000_000,
    accuracy: 0.923,
    latency: 12.0,
    trainedOn: 'SoccerNet + custom courts/fields',
    lastUpdated: '2026-02-01',
  },
  // ── Play Classification ──
  {
    id: 'sv-plays-football-v1',
    name: 'Football Play Classifier',
    version: '1.0.0',
    task: 'play_classification',
    sport: 'football',
    framework: 'onnx',
    inputShape: [1, 64, 256],
    outputShape: [1, 9],
    precision: 'fp16',
    fileSize: 18_000_000,
    accuracy: 0.856,
    latency: 3.8,
    trainedOn: 'NFL NextGenStats + college film',
    lastUpdated: '2026-02-01',
  },
  {
    id: 'sv-plays-basketball-v1',
    name: 'Basketball Play Classifier',
    version: '1.0.0',
    task: 'play_classification',
    sport: 'basketball',
    framework: 'onnx',
    inputShape: [1, 64, 256],
    outputShape: [1, 7],
    precision: 'fp16',
    fileSize: 18_000_000,
    accuracy: 0.841,
    latency: 3.8,
    trainedOn: 'NBA tracking + college film',
    lastUpdated: '2026-02-01',
  },
  // ── Highlight Detection ──
  {
    id: 'sv-highlights-v1',
    name: 'ScoutVision Highlight Detector',
    version: '1.0.0',
    task: 'highlight_detection',
    sport: 'universal',
    framework: 'onnx',
    inputShape: [1, 32, 512],
    outputShape: [1, 18],
    precision: 'fp16',
    fileSize: 22_000_000,
    accuracy: 0.834,
    latency: 5.1,
    trainedOn: 'SoccerNet-v2 + custom multi-sport',
    lastUpdated: '2026-02-01',
  },
];
