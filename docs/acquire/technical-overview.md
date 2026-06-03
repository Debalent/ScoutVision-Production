# Technical Overview

## Architecture Diagram

```text
                        +-------------------------------+
                        |     Next.js Frontend (web)    |
                        |  dashboard, CRM, analytics    |
                        +---------------+---------------+
                                        |
                      fetch /api/*      | proxy/fallback
                                        v
                  +---------------------+----------------------+
                  |      Next.js API Route Layer (web/api)     |
                  |  proxy to backend OR serve mock fallback   |
                  +---------------------+----------------------+
                                        |
                             NEXT_PUBLIC_API_URL
                                        v
                     +------------------+------------------+
                     |      Express API (apps/api)         |
                     | auth, prospects, billing, compliance|
                     +------------------+------------------+
                                        |
                                      Prisma
                                        v
                              PostgreSQL-compatible DB
```

## Component Breakdown

- App shell: sidebar, topbar, mobile nav, modal stack.
- Feature modules: dashboard, CRM, compliance, analytics, reports, video, settings.
- State providers:
  - `SportContext`: sport, level, demo/live mode.
  - `ProspectContext`: prospect data, loading/error state, optimistic mutations.
  - `TeamContext`: member/profile management.
- Reusable primitives: modal + state blocks for loading/error/empty states.

## API Structure

### Express API

- `GET /health`
- `GET /ping`
- `POST /auth/login`
- `POST /auth/register`
- `GET /prospects`
- `POST /prospects`
- `PATCH /prospects/:id`
- `DELETE /prospects/:id`
- `GET /compliance/events`
- `POST /compliance/events`
- `POST /billing/create-checkout-session`

### Next.js API Layer

- `/api/prospects`
- `/api/analytics`
- `/api/compliance/events`
- `/api/analysis`
- `/api/reports`
- `/api/search`
- `/api/uploads`

## Data Flow Explanation

1. User opens page -> providers initialize.
2. If `Demo Mode` is on, in-memory data powers the UI.
3. If `Live Mode` is on, contexts fetch from Next.js API routes.
4. Next.js routes either proxy to Express or fallback to mock payloads.
5. UI renders state blocks for loading/error/empty to keep demos resilient.

This dual-mode architecture ensures product walkthrough reliability while preserving a clear path to full backend deployment.
