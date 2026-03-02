<p align="center">
  <img src="apps/web/public/logo.png" alt="ScoutVision Logo" width="200" />
</p>

<h1 align="center">ScoutVision</h1>

<p align="center">
  AI-Powered Multi-Sport Recruiting Intelligence Platform
</p>

---

## Overview

ScoutVision is a production-grade, AI-powered scouting and recruiting intelligence platform built for collegiate and professional athletic programs at every level. From Power Five conferences to Division II, Division III, NAIA, and junior college programs, ScoutVision adapts to any organization that evaluates athletic talent. It supports football, basketball, soccer, baseball, and track and field with sport-specific analytics modules, and combines computer vision, biomechanics analysis, predictive modeling, and LLM-powered intelligence into a unified platform that transforms raw game film into actionable recruiting insights.

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
- Compliance monitoring with configurable rule sets (NCAA, NAIA, conference-specific)

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
Each sport module extracts discipline-specific metrics from video and sensor data:
- Football: burst score, route separation, pocket movement, play classification
- Basketball: shot release speed, defensive footwork, court coverage
- Soccer: sprint acceleration, pressing intensity, off-ball movement
- Baseball: pitch velocity, bat speed, exit velocity, catcher pop time
- Track and Field: stride efficiency, max velocity, block start, ground contact asymmetry

Modules are designed to be extensible so additional sports can be added with minimal configuration.

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
| POST   | /api/uploads            | Initiate file upload               |
| GET    | /api/uploads            | List uploaded files                |
| GET    | /api/compliance/events  | List compliance events             |

---

## Pages and Navigation

| Route         | Page                  | Description                                          |
|---------------|-----------------------|------------------------------------------------------|
| /             | Dashboard             | KPI stats, activity feed, pipeline snapshot, AI insights |
| /crm          | Recruiting CRM        | Kanban board and table view with search and filters  |
| /prospect     | Prospect Profile      | 7-tab profile: overview, stats, evaluations, film, AI, comms, timeline |
| /compare      | Prospect Comparison   | Side-by-side comparison for up to 4 prospects        |
| /compliance   | Compliance Center     | NCAA period tracking, alerts, and audit trail        |
| /analytics    | Analytics             | Pipeline funnel, geographic, position fill, predictive |
| /reports      | Reports               | AI report generation, templates, and archive         |
| /video        | Video Scout           | Film library with upload and AI analysis             |
| /settings     | Settings              | 6-tab admin: general, team, integrations, notifications, billing, security |

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

The Prisma schema (prisma/schema.prisma) includes 22+ normalized tables:

- User, Session, Role -- identity, sessions, and access control
- Program -- organization and subscription management
- Prospect, ProspectStats, ProspectAcademics -- athlete profiles
- RecruitingStage -- pipeline stages per program
- Email, ContactLog -- communication tracking
- Note, Evaluation -- scouting evaluations
- ComplianceEvent, RecruitingPeriod -- NCAA compliance
- Visit -- campus visit scheduling
- Video, VideoClip -- film library with AI metadata
- AIAnalysis, AIReport -- AI pipeline results and generated reports
- Upload -- file upload management with progress tracking
- SavedSearch -- natural language search history
- BoardTemplate -- custom Kanban board configurations
- Notification -- real-time notification system
- PipelineMetric -- analytics and funnel data
- AuditLog -- SOC2-ready audit trail

---

## Project Status

- Phase 1 (Complete): Full-stack frontend with CRM, compliance, video scouting, analytics, and dashboard
- Phase 2 (Complete): AI/CV inference engine, biomechanics, sport modules, predictive models, LLM intelligence, training pipeline, GPU deployment
- Phase 3 (Complete): Enhanced schema, upload system, UI design system, component library, testing strategy, deployment configuration
- Phase 4 (Complete): Settings/admin, prospect profiles, prospect comparison, reports and intelligence, top bar with command palette, navigation
- Phase 5 (Complete): Error boundaries, loading states, 404 page, middleware (rate limiting, CORS, security headers), auth/RBAC system, validation, custom hooks, SEO/meta/PWA, performance optimization
- Phase 6 (Complete): GitHub Pages static deployment for mobile preview

---

## Deployment

### Vercel (Production)

The primary deployment target is Vercel with server-side rendering:

```bash
vercel --prod
```

### GitHub Pages (Static Preview)

A static export is deployed automatically on every push to main via GitHub Actions. View the live preview at:

```
https://debalent.github.io/ScoutVision-Production/
```

The static build uses client-side rendering with mock data, so all pages are fully interactive without a backend.

### Docker (Self-Hosted)

```bash
docker compose up              # Standard stack
docker compose -f docker-compose.gpu.yml up  # GPU inference
```

---

## License

Proprietary. All rights reserved.

---

## Security

See SECURITY.md for vulnerability reporting guidelines.
