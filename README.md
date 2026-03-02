<p align="center">
  <img src="apps/web/public/logo.png" alt="ScoutVision Logo" width="200" />
</p>

<h1 align="center">ScoutVision</h1>

<p align="center">
  AI-Powered Multi-Sport Recruiting Intelligence Platform
</p>

---

## Overview

ScoutVision is a production-grade, AI-powered scouting and recruiting intelligence platform built for Division II, Division III, and NAIA athletic programs. It combines computer vision, biomechanics analysis, predictive modeling, and LLM-powered intelligence into a unified platform that transforms raw game film into actionable recruiting insights.

---

## Architecture

```
ScoutVision-Production/
  apps/
    web/          -- Next.js 14 frontend (React 18, TailwindCSS)
    api/          -- Express backend (TypeScript)
  packages/
    ai/           -- AI/CV inference engine (@scoutvision/ai)
    ai-training/  -- PyTorch training pipeline (Python)
    prisma/       -- Database schema (PostgreSQL)
```

---

## Tech Stack

| Layer             | Technology                                           |
|-------------------|------------------------------------------------------|
| Frontend          | Next.js 14, React 18, TailwindCSS                   |
| Backend API       | Express.js, TypeScript                               |
| Database          | PostgreSQL, Prisma ORM                               |
| AI / CV Engine    | ONNX Runtime, YOLOv8, HRNet-W48, Deep SORT          |
| Training          | PyTorch 2.x, Ultralytics, Albumentations, WandB      |
| LLM Intelligence  | OpenAI GPT-4, Anthropic Claude (abstracted client)   |
| Deployment        | Docker, NVIDIA CUDA, TensorRT, Redis                 |
| Auth & Billing    | JWT, Stripe                                          |

---

## Core Modules

### 1. Recruiting CRM
- Kanban-style prospect pipeline with drag-and-drop stages
- Prospect profiles with stats, academics, evaluations, and contact history
- Communication tracking (calls, texts, emails, visits)
- Compliance monitoring with NCAA period enforcement

### 2. Video Scouting
- Film library with upload, search, and AI tagging
- Shareable video clips with deep-link tokens
- AI-powered analysis: player detection, tracking, pose estimation
- Automated highlight extraction and play classification

### 3. AI / Computer Vision Pipeline
- 10-stage inference pipeline: ingest, preprocess, detect, track, pose, biomechanics, sport metrics, highlights, play classification, output
- Multi-object tracking with Kalman filter and appearance-based ReID
- Top-down pose estimation with sub-pixel heatmap refinement and 3D lifting
- Biomechanics engine: joint angles, center of mass, stride analysis, jump analysis, fatigue detection, injury risk assessment

### 4. Sport-Specific Analytics
- Football: burst score, route separation, pocket movement, play classification
- Basketball: shot release speed, defensive footwork, court coverage
- Soccer: sprint acceleration, pressing intensity, off-ball movement
- Baseball: pitch velocity, bat speed, exit velocity, catcher pop time
- Track and Field: stride efficiency, max velocity, block start, ground contact asymmetry

### 5. Predictive Models
- Performance projection with age-curve modeling
- Growth trajectory classification (elite / above-average / average / below-average)
- Injury risk prediction from biomechanics and workload
- Position fit analysis with archetype matching
- NIL valuation engine (tier, sport, social multipliers)
- Recruitment likelihood scoring (performance + academic + exposure composite)

### 6. LLM Intelligence
- AI scouting report generation with structured analysis
- Game summary generation from pipeline outputs
- Player comparison with statistical and qualitative analysis
- Team fit recommendations
- Natural language search (converts plain English to structured prospect queries)

### 7. Analytics Dashboard
- Pipeline conversion metrics and recruiting funnel visualization
- Position heatmaps, geographic distribution, and class year breakdowns
- Real-time activity feed and compliance alert monitoring

---

## AI Training Pipeline

The training system (packages/ai-training/) provides end-to-end model development:

- **Datasets**: COCO-format detection, top-down pose with heatmap generation, temporal play classification sequences
- **Training**: Mixed-precision (AMP), gradient accumulation, WandB logging, automatic checkpointing
- **Evaluation**: COCO mAP (101-point interpolation), OKS-based pose AP, PCK at multiple thresholds, per-class classification metrics
- **Export**: ONNX conversion with simplification, dynamic/static/INT8 quantization, TensorRT FP16/INT8, latency benchmarking

---

## GPU Deployment

```
docker compose -f docker-compose.gpu.yml up          # Inference server
docker compose -f docker-compose.gpu.yml --profile training up  # Training
```

- NVIDIA CUDA 12.2 with cuDNN 8 runtime
- Redis-backed job queue with priority scheduling and retry logic
- Health monitoring with throughput and error tracking
- MinIO S3-compatible storage for videos and models

---

## API Routes

| Method | Endpoint                | Description                        |
|--------|-------------------------|------------------------------------|
| GET    | /api/prospects          | List all prospects                 |
| POST   | /api/analysis           | Submit video for AI analysis       |
| GET    | /api/analysis?jobId=    | Check analysis job status          |
| POST   | /api/reports            | Generate AI scouting report        |
| GET    | /api/reports            | Retrieve saved reports             |
| POST   | /api/search             | Natural language prospect search   |
| GET    | /api/compliance/events  | List compliance events             |

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 15+
- Python 3.10+ (for training pipeline)
- NVIDIA GPU with CUDA 12+ (for inference/training)

### Installation

```bash
# Clone the repository
git clone https://github.com/Debalent/ScoutVision-Production.git
cd ScoutVision-Production

# Install frontend dependencies
cd apps/web && npm install

# Install backend dependencies
cd ../api && npm install

# Set up the database
cd ../../prisma
npx prisma generate
npx prisma db push

# Install AI package dependencies
cd ../packages/ai && npm install

# Install training dependencies (Python)
cd ../ai-training
pip install -r requirements.txt
```

### Environment Variables

```
DATABASE_URL=postgresql://user:pass@localhost:5432/scoutvision
NEXT_PUBLIC_API_URL=http://localhost:4000
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
STRIPE_SECRET_KEY=sk_...
WANDB_API_KEY=...
```

### Development

```bash
# Start the frontend
cd apps/web && npm run dev

# Start the backend
cd apps/api && npm run dev
```

---

## Database Schema

The Prisma schema (prisma/schema.prisma) includes 15 normalized tables:

- User, Role -- identity and access control
- Program -- organization and subscription management
- Prospect, ProspectStats, ProspectAcademics -- athlete profiles
- RecruitingStage -- pipeline stages per program
- Email, ContactLog -- communication tracking
- Note, Evaluation -- scouting evaluations
- ComplianceEvent, RecruitingPeriod -- NCAA compliance
- Visit -- campus visit scheduling
- Video, VideoClip -- film library with AI metadata
- PipelineMetric -- analytics and funnel data
- AuditLog -- SOC2-ready audit trail

---

## Project Status

- Phase 1 (Complete): Full-stack frontend with CRM, compliance, video scouting, analytics, and dashboard
- Phase 2 (Complete): AI/CV inference engine, biomechanics, sport modules, predictive models, LLM intelligence, training pipeline, GPU deployment
- Phase 3 (In Progress): Enhanced schema, upload system, UI design system, testing, deployment configuration

---

## License

Proprietary. All rights reserved.

---

## Security

See SECURITY.md for vulnerability reporting guidelines.