/**
 * ScoutVision AI - Test Setup
 * Global test configuration and utilities
 */

import { vi } from 'vitest';

// Mock ONNX Runtime for unit tests (not available in test environment)
vi.mock('onnxruntime-node', () => ({
  InferenceSession: {
    create: vi.fn().mockResolvedValue({
      run: vi.fn().mockResolvedValue({}),
      release: vi.fn(),
    }),
  },
  Tensor: vi.fn().mockImplementation((type: string, data: any, dims: number[]) => ({
    type,
    data,
    dims,
  })),
  env: {
    wasm: { numThreads: 1 },
  },
}));

// Mock Sharp for image processing tests
vi.mock('sharp', () => {
  const mockSharp = vi.fn().mockReturnValue({
    resize: vi.fn().mockReturnThis(),
    raw: vi.fn().mockReturnThis(),
    toBuffer: vi.fn().mockResolvedValue({
      buffer: new Float32Array(640 * 640 * 3).buffer,
    }),
    metadata: vi.fn().mockResolvedValue({
      width: 1920,
      height: 1080,
      channels: 3,
      format: 'jpeg',
    }),
    toFormat: vi.fn().mockReturnThis(),
    jpeg: vi.fn().mockReturnThis(),
    png: vi.fn().mockReturnThis(),
  });
  return { default: mockSharp };
});

// Global test helpers
globalThis.createMockDetection = (overrides = {}) => ({
  bbox: { x: 100, y: 100, width: 50, height: 120 },
  confidence: 0.92,
  classId: 0,
  className: 'person',
  ...overrides,
});

globalThis.createMockKeypoints = (count = 17) => {
  return Array.from({ length: count }, (_, i) => ({
    x: 100 + (i % 5) * 30,
    y: 100 + Math.floor(i / 5) * 40,
    z: 0,
    confidence: 0.85 + Math.random() * 0.1,
    name: `keypoint_${i}`,
  }));
};

globalThis.createMockTrack = (id: number, overrides = {}) => ({
  id,
  bbox: { x: 100, y: 100, width: 50, height: 120 },
  confidence: 0.9,
  age: 10,
  timeSinceUpdate: 0,
  hits: 10,
  classId: 0,
  velocity: { vx: 2, vy: 1 },
  ...overrides,
});

// Suppress console output in tests
const originalConsole = { ...console };
beforeAll(() => {
  console.log = vi.fn();
  console.debug = vi.fn();
  console.info = vi.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.debug = originalConsole.debug;
  console.info = originalConsole.info;
});
