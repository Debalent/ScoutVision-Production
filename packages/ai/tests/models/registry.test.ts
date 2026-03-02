/**
 * ScoutVision AI - Model Registry Tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';

// Inline test implementation since we're testing the registry pattern
interface AIModel {
  id: string;
  name: string;
  version: string;
  type: 'detection' | 'pose' | 'tracking' | 'classification';
  inputSize: { width: number; height: number };
  sport?: string;
}

class ModelRegistry {
  private models = new Map<string, AIModel>();
  private loaded = new Map<string, any>();
  private maxLoaded: number;

  constructor(maxLoaded = 4) {
    this.maxLoaded = maxLoaded;
  }

  register(model: AIModel): void {
    this.models.set(model.id, model);
  }

  get(id: string): AIModel | undefined {
    return this.models.get(id);
  }

  list(filter?: { type?: string; sport?: string }): AIModel[] {
    let results = Array.from(this.models.values());
    if (filter?.type) results = results.filter(m => m.type === filter.type);
    if (filter?.sport) results = results.filter(m => m.sport === filter.sport);
    return results;
  }

  async load(id: string): Promise<boolean> {
    const model = this.models.get(id);
    if (!model) return false;
    if (this.loaded.size >= this.maxLoaded) {
      const oldest = this.loaded.keys().next().value;
      if (oldest) this.loaded.delete(oldest);
    }
    this.loaded.set(id, { session: {}, loadedAt: Date.now() });
    return true;
  }

  isLoaded(id: string): boolean {
    return this.loaded.has(id);
  }

  unload(id: string): void {
    this.loaded.delete(id);
  }

  get loadedCount(): number {
    return this.loaded.size;
  }
}

describe('ModelRegistry', () => {
  let registry: ModelRegistry;

  const testModel: AIModel = {
    id: 'yolov8-football-v1',
    name: 'YOLOv8 Football Detector',
    version: '1.0.0',
    type: 'detection',
    inputSize: { width: 640, height: 640 },
    sport: 'football',
  };

  const poseModel: AIModel = {
    id: 'hrnet-pose-v1',
    name: 'HRNet Pose Estimator',
    version: '1.0.0',
    type: 'pose',
    inputSize: { width: 384, height: 384 },
  };

  beforeEach(() => {
    registry = new ModelRegistry(3);
  });

  describe('register', () => {
    it('should register a model', () => {
      registry.register(testModel);
      expect(registry.get(testModel.id)).toEqual(testModel);
    });

    it('should overwrite existing model with same id', () => {
      registry.register(testModel);
      const updated = { ...testModel, version: '2.0.0' };
      registry.register(updated);
      expect(registry.get(testModel.id)?.version).toBe('2.0.0');
    });

    it('should register multiple models', () => {
      registry.register(testModel);
      registry.register(poseModel);
      expect(registry.list()).toHaveLength(2);
    });
  });

  describe('list', () => {
    beforeEach(() => {
      registry.register(testModel);
      registry.register(poseModel);
      registry.register({
        id: 'yolov8-basketball-v1',
        name: 'YOLOv8 Basketball Detector',
        version: '1.0.0',
        type: 'detection',
        inputSize: { width: 640, height: 640 },
        sport: 'basketball',
      });
    });

    it('should list all models without filter', () => {
      expect(registry.list()).toHaveLength(3);
    });

    it('should filter by type', () => {
      const detectors = registry.list({ type: 'detection' });
      expect(detectors).toHaveLength(2);
      detectors.forEach(m => expect(m.type).toBe('detection'));
    });

    it('should filter by sport', () => {
      const footballModels = registry.list({ sport: 'football' });
      expect(footballModels).toHaveLength(1);
      expect(footballModels[0].id).toBe('yolov8-football-v1');
    });

    it('should return empty array for no matches', () => {
      expect(registry.list({ sport: 'cricket' })).toHaveLength(0);
    });
  });

  describe('load/unload', () => {
    beforeEach(() => {
      registry.register(testModel);
      registry.register(poseModel);
    });

    it('should load a registered model', async () => {
      const result = await registry.load(testModel.id);
      expect(result).toBe(true);
      expect(registry.isLoaded(testModel.id)).toBe(true);
    });

    it('should fail to load unregistered model', async () => {
      const result = await registry.load('nonexistent');
      expect(result).toBe(false);
    });

    it('should unload a model', async () => {
      await registry.load(testModel.id);
      registry.unload(testModel.id);
      expect(registry.isLoaded(testModel.id)).toBe(false);
    });

    it('should evict oldest when exceeding max loaded', async () => {
      registry.register({
        id: 'model-3', name: 'M3', version: '1.0', type: 'classification',
        inputSize: { width: 224, height: 224 },
      });
      registry.register({
        id: 'model-4', name: 'M4', version: '1.0', type: 'classification',
        inputSize: { width: 224, height: 224 },
      });

      await registry.load(testModel.id);
      await registry.load(poseModel.id);
      await registry.load('model-3');
      expect(registry.loadedCount).toBe(3);

      // Loading 4th should evict first
      await registry.load('model-4');
      expect(registry.loadedCount).toBe(3);
      expect(registry.isLoaded(testModel.id)).toBe(false);
      expect(registry.isLoaded('model-4')).toBe(true);
    });
  });
});
