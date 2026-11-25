# PostPilot — Social Media Automation Engine Pipeline

> Fully automated end-to-end engine for generating and publishing high-retention 5-slide Instagram carousels from breaking tech news.

---

## ⚡ The 5-Step Automation Pipeline

```
1. Fetch latest news
   News APIs, RSS feeds, TechCrunch, TLDR AI, Hacker News
             ↓
2. Gemini Flash
   Extract facts, create 5-slide content narrative and platform caption
             ↓
3. Gemini Image Generation
   Generate five cinematic background images
             ↓
4. Node.js + Sharp
   Add headlines, body text, colors and your actual logo
             ↓
5. Instagram Graph API
   Publish the five images as an Instagram carousel
```

---

## 🏗️ Architecture & Monorepo Structure

- **Frontend (`apps/frontend`)**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide icons, Sonner, Framer Motion, `@google/genai` SDK.
  - Interactive **Automation Pipeline Dashboard** (`/pipelines` / `/`)
  - **News Ingestion & Feeds** (`/ideas` — Step 1)
  - **Carousel Visual Studio** (`/studio` — Steps 2, 3, 4)
  - **Publishing Queue & Calendar** (`/calendar`, `/posts` — Step 5)
  - **Settings & Brand Kit** (`/settings`, `/accounts`)
- **Backend (`apps/backend`)**: NestJS 10, Google GenAI SDK (Gemini 3.8 Flash & Imagen 3), Node.js + Sharp compositor, RSS ingestion crawler, BullMQ.
- **Orchestrator (`apps/orchestrator`)**: BullMQ job queues and workers for automated scheduling & publishing via Instagram Graph API.
- **Database (`libraries/database`)**: Prisma ORM with PostgreSQL.
- **Integrations & Helpers (`libraries/*`)**: Meta Instagram Graph API connector, AES-256 encryption, shared utilities.

---

## 🛠️ Quick Start

### Prerequisites
- Node.js `^20.0.0` or `>= 22`
- pnpm `11.x`
- Google Gemini API key (`GEMINI_API_KEY`)
- PostgreSQL database (or Docker Compose)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   Ensure `.env` contains your API credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/postpilot"
   BETTER_AUTH_URL="http://localhost:3000"
   BETTER_AUTH_SECRET="your-better-auth-secret"
   GEMINI_API_KEY="AIzaSy..."
   META_APP_ID="your-meta-app-id"
   META_APP_SECRET="your-meta-app-secret"
   ```

3. **Generate Prisma Client**
   ```bash
   pnpm db:generate
   ```

4. **Run Development Server**
   ```bash
   # Run frontend (Automation Pipeline, Visual Studio, Feeds)
   pnpm dev:frontend

   # Or run all services (Frontend, Backend, Orchestrator)
   pnpm dev
   ```

5. **Open Dashboard**
   - Automation Pipeline: `http://localhost:3000/` or `http://localhost:3000/pipelines`
   - News Sources & Ingestion: `http://localhost:3000/ideas`
   - Visual Studio: `http://localhost:3000/studio`
   - Publishing Calendar: `http://localhost:3000/calendar`

## Multi-channel publishing

In Calendar, connect a channel and choose **New Post** to select destination accounts, attach media and set a publication time. **Agent Workflow** opens the Auto-Ants review queue. Reviewers can edit the caption, attach generated slides as JPEGs and approve a schedule.

- Run the frontend, backend and orchestrator together with `pnpm dev`. The worker needs Redis, the same PostgreSQL database as the frontend and the same token encryption configuration. The Prisma names `Channel` and `PostChannel` map to the existing `SocialAccount` and `PostDelivery` tables. Apply the repository’s scheduling-foundation migration if the delivery tables are missing and regenerate Prisma Client.
- Configure Meta for Page publishing and Instagram content publishing. For Threads, register the frontend callback `/api/integrations/threads/callback` and set the credentials in `.env.example`. Instagram requires media. Facebook supports text, photos, multi-photo posts and single videos. Threads supports text and media containers.
- Set `MEDIA_BUCKET_URL` to the S3-compatible bucket endpoint, `MEDIA_PUBLIC_URL` to the corresponding public asset base and bucket CORS to allow PUT from the frontend origin. The composer can also use existing public HTTPS assets. Use extensions such as .jpg and .mp4 for pasted media URLs.
- For recurring Auto-Ants runs, configure `AUTO_ANTS_WORKSPACE_ID`, `AUTO_ANTS_APP_URL` and a shared `AUTO_ANTS_SECRET` of at least 32 characters on the worker and frontend. The frontend uses `GEMINI_API_KEY` and optional RSS, niche and model settings. The default cron runs at 08:00 UTC.
- Each destination records its provider ID or failure and its publishing attempts. If the worker loses contact during a publish and cannot confirm the result, check the provider before scheduling another copy.

The opt-in scheduling integration suite requires **disposable** PostgreSQL and Redis instances on 127.0.0.1. Point `DATABASE_URL`, `DATABASE_URL_UNPOOLED` and `REDIS_URL` at them, initialize the test schema, then run `pnpm test` with `PUBLISH_INTEGRATION=1`. The suite exercises real queues and database transactions with simulated provider responses.
