// ═══════════════════════════════════════════════════════════════════════════
// ScoutVision AI — GPU Deployment & Inference Server
// Batched inference, model serving, health checks, and auto-scaling.
// ═══════════════════════════════════════════════════════════════════════════

import type { Sport, PipelineConfig, PipelineOutput, PipelineInput } from '../types';
import { ScoutVisionPipeline } from '../pipeline';

// ═══════════════════════════════════════════════════════════════════════════
// Deployment Configuration
// ═══════════════════════════════════════════════════════════════════════════

export interface DeploymentConfig {
  /** Inference server settings */
  server: {
    host: string;
    port: number;
    workers: number;
    maxConcurrentJobs: number;
    healthCheckIntervalMs: number;
  };

  /** GPU configuration */
  gpu: {
    devices: number[];
    memoryLimitMB: number;
    enableTensorRT: boolean;
    enableFP16: boolean;
    enableINT8: boolean;
    maxBatchSize: number;
  };

  /** Model paths */
  models: {
    detection: string;
    tracking: string;
    pose: string;
    ballDetection: string;
    fieldCalibration: string;
    playClassification: Record<string, string>;
    highlight: string;
  };

  /** Storage */
  storage: {
    videoInputBucket: string;
    outputBucket: string;
    modelBucket: string;
    tempDir: string;
  };

  /** Queue configuration */
  queue: {
    provider: 'redis' | 'sqs' | 'rabbitmq' | 'memory';
    connectionUrl: string;
    maxRetries: number;
    retryDelayMs: number;
    visibilityTimeoutMs: number;
    deadLetterQueue: string;
  };
}

export const DEFAULT_DEPLOYMENT: DeploymentConfig = {
  server: {
    host: '0.0.0.0',
    port: 8080,
    workers: 2,
    maxConcurrentJobs: 4,
    healthCheckIntervalMs: 30000,
  },
  gpu: {
    devices: [0],
    memoryLimitMB: 8192,
    enableTensorRT: false,
    enableFP16: true,
    enableINT8: false,
    maxBatchSize: 8,
  },
  models: {
    detection: './models/sv-detect-v1.onnx',
    tracking: './models/sv-track-v1.onnx',
    pose: './models/sv-pose-v1.onnx',
    ballDetection: './models/sv-ball-v1.onnx',
    fieldCalibration: './models/sv-field-v1.onnx',
    playClassification: {
      football: './models/sv-plays-football-v1.onnx',
      basketball: './models/sv-plays-basketball-v1.onnx',
    },
    highlight: './models/sv-highlights-v1.onnx',
  },
  storage: {
    videoInputBucket: 'scoutvision-videos',
    outputBucket: 'scoutvision-outputs',
    modelBucket: 'scoutvision-models',
    tempDir: '/tmp/scoutvision',
  },
  queue: {
    provider: 'redis',
    connectionUrl: 'redis://localhost:6379',
    maxRetries: 3,
    retryDelayMs: 5000,
    visibilityTimeoutMs: 300000,
    deadLetterQueue: 'sv-analysis-dlq',
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Job Queue
// ═══════════════════════════════════════════════════════════════════════════

export interface AnalysisJob {
  jobId: string;
  videoId: string;
  sport: Sport;
  userId: string;
  organizationId?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  config: Partial<PipelineConfig>;
  callbackUrl?: string;
  createdAt: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'retrying';
  attempts: number;
  result?: PipelineOutput;
  error?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface JobQueue {
  enqueue(job: AnalysisJob): Promise<void>;
  dequeue(): Promise<AnalysisJob | null>;
  acknowledge(jobId: string): Promise<void>;
  fail(jobId: string, error: string): Promise<void>;
  getStatus(jobId: string): Promise<AnalysisJob | null>;
  getQueueLength(): Promise<number>;
}

/**
 * In-memory job queue for development/testing.
 */
export class MemoryJobQueue implements JobQueue {
  private queue: AnalysisJob[] = [];
  private processing: Map<string, AnalysisJob> = new Map();
  private completed: Map<string, AnalysisJob> = new Map();

  async enqueue(job: AnalysisJob): Promise<void> {
    job.status = 'queued';
    // Priority sorting: urgent > high > normal > low
    const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
    this.queue.push(job);
    this.queue.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
  }

  async dequeue(): Promise<AnalysisJob | null> {
    const job = this.queue.shift() ?? null;
    if (job) {
      job.status = 'processing';
      job.startedAt = new Date().toISOString();
      this.processing.set(job.jobId, job);
    }
    return job;
  }

  async acknowledge(jobId: string): Promise<void> {
    const job = this.processing.get(jobId);
    if (job) {
      job.status = 'completed';
      job.completedAt = new Date().toISOString();
      this.processing.delete(jobId);
      this.completed.set(jobId, job);
    }
  }

  async fail(jobId: string, error: string): Promise<void> {
    const job = this.processing.get(jobId);
    if (job) {
      job.status = 'failed';
      job.error = error;
      job.completedAt = new Date().toISOString();
      this.processing.delete(jobId);
      this.completed.set(jobId, job);
    }
  }

  async getStatus(jobId: string): Promise<AnalysisJob | null> {
    return (
      this.processing.get(jobId) ??
      this.completed.get(jobId) ??
      this.queue.find((j) => j.jobId === jobId) ??
      null
    );
  }

  async getQueueLength(): Promise<number> {
    return this.queue.length;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Worker
// ═══════════════════════════════════════════════════════════════════════════

export class InferenceWorker {
  private pipeline: ScoutVisionPipeline;
  private queue: JobQueue;
  private config: DeploymentConfig;
  private running: boolean = false;
  private activeJobs: number = 0;

  constructor(config: DeploymentConfig, queue: JobQueue) {
    this.config = config;
    this.queue = queue;
    this.pipeline = new ScoutVisionPipeline({
      maxConcurrentFrames: config.gpu.maxBatchSize,
      gpuDeviceId: config.gpu.devices[0],
    });
  }

  async start(): Promise<void> {
    this.running = true;
    console.log(`[Worker] Starting inference worker on GPU ${this.config.gpu.devices.join(',')}`);

    while (this.running) {
      if (this.activeJobs >= this.config.server.maxConcurrentJobs) {
        await sleep(100);
        continue;
      }

      const job = await this.queue.dequeue();
      if (!job) {
        await sleep(1000); // Poll interval
        continue;
      }

      this.activeJobs++;
      this.processJob(job)
        .catch((err) => console.error(`[Worker] Job ${job.jobId} error:`, err))
        .finally(() => this.activeJobs--);
    }
  }

  async stop(): Promise<void> {
    this.running = false;
    console.log('[Worker] Stopping...');
    // Wait for active jobs
    while (this.activeJobs > 0) {
      await sleep(500);
    }
    console.log('[Worker] Stopped');
  }

  private async processJob(job: AnalysisJob): Promise<void> {
    console.log(`[Worker] Processing job ${job.jobId} — video ${job.videoId} (${job.sport})`);

    try {
      const input: PipelineInput = {
        videoId: job.videoId,
        videoSource: job.videoId, // In production: download from storage
        sport: job.sport,
        ...job.config,
      };

      const result = await this.pipeline.process(input);
      job.result = result;

      if (result.errors.some((e) => !e.recoverable)) {
        throw new Error(`Pipeline had fatal errors: ${result.errors.map((e) => e.message).join('; ')}`);
      }

      await this.queue.acknowledge(job.jobId);
      console.log(`[Worker] Job ${job.jobId} completed — ${result.processingTimeMs}ms`);

      // Callback
      if (job.callbackUrl) {
        await this.notifyCallback(job.callbackUrl, job);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.error(`[Worker] Job ${job.jobId} failed: ${errorMsg}`);

      job.attempts++;
      if (job.attempts < this.config.queue.maxRetries) {
        job.status = 'retrying';
        await sleep(this.config.queue.retryDelayMs * job.attempts);
        await this.queue.enqueue(job);
      } else {
        await this.queue.fail(job.jobId, errorMsg);
      }
    }
  }

  private async notifyCallback(url: string, job: AnalysisJob): Promise<void> {
    try {
      await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.jobId,
          videoId: job.videoId,
          status: job.status,
          processingTimeMs: job.result?.processingTimeMs,
        }),
      });
    } catch (err) {
      console.warn(`[Worker] Callback failed for job ${job.jobId}:`, err);
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Health Monitor
// ═══════════════════════════════════════════════════════════════════════════

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  gpu: {
    available: boolean;
    memoryUsedMB: number;
    memoryTotalMB: number;
    utilizationPercent: number;
    temperature: number;
  };
  queue: {
    pending: number;
    processing: number;
  };
  models: {
    loaded: string[];
    totalMemoryMB: number;
  };
  throughput: {
    jobsProcessed: number;
    avgProcessingMs: number;
    errorsLast24h: number;
  };
}

export class HealthMonitor {
  private startTime: number = Date.now();
  private jobsProcessed: number = 0;
  private totalProcessingMs: number = 0;
  private errors24h: number = 0;

  recordJob(processingMs: number, success: boolean): void {
    this.jobsProcessed++;
    this.totalProcessingMs += processingMs;
    if (!success) this.errors24h++;
  }

  async getStatus(queue: JobQueue): Promise<HealthStatus> {
    const queueLength = await queue.getQueueLength();

    return {
      status: this.errors24h > 10 ? 'degraded' : 'healthy',
      uptime: Date.now() - this.startTime,
      gpu: {
        available: true, // In production: check CUDA availability
        memoryUsedMB: 0,
        memoryTotalMB: 0,
        utilizationPercent: 0,
        temperature: 0,
      },
      queue: {
        pending: queueLength,
        processing: 0,
      },
      models: {
        loaded: [],
        totalMemoryMB: 0,
      },
      throughput: {
        jobsProcessed: this.jobsProcessed,
        avgProcessingMs: this.jobsProcessed > 0 ? this.totalProcessingMs / this.jobsProcessed : 0,
        errorsLast24h: this.errors24h,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Utilities
// ═══════════════════════════════════════════════════════════════════════════

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
