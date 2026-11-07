# PostPilot — AI Carousel Automation & Content Engine

> Autonomous social media carousel generator, multi-slide visual studio, daily RSS news flywheel, and multi-platform publishing engine.

---

## ⚡ Tech Stack & Architecture

PostPilot is built as a high-performance **pnpm monorepo**:

- **Frontend (`apps/frontend`)**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide icons, Sonner, Framer Motion, `@google/genai` SDK.
- **Backend (`apps/backend`)**: NestJS 10, Puppeteer (high-resolution slide rasterization), Google GenAI SDK (Gemini 3.8 Flash & Imagen 3), BullMQ.
- **Orchestrator (`apps/orchestrator`)**: BullMQ job queues and workers for multi-platform scheduling & publishing (Instagram, LinkedIn, X, Threads).
- **Database (`libraries/database`)**: Prisma ORM with PostgreSQL (Workspace, User, Carousel, CarouselSlide, Post, Idea, Automation).
- **Integrations & Helpers (`libraries/*`)**: Multi-provider social connectors, encryption, and shared utilities.

---

## 🚀 Key Pipelines & Features

### 1. Carousel Studio & Slide Editor
- Multi-slide visual canvas with real-time editing of headlines, subtext, badges, and layout types (Cover, Content, List, Quote, CTA).
- Curated theme library: FutureTech, AI Page Daily, Tyches Cyberpunk, Invention Shark, Dark Cybernetic, and Minimalist.
- Instant multi-format export: Single-image PNG, high-resolution Multi-page PDF, and ZIP deck archives.

### 2. Daily Flywheel Automation Pipeline (`/api/automations/daily-pipeline/run`)
- Automated RSS & news feed ingestion (TLDR AI, TLDR Tech, Hacker News, custom OPML).
- Gemini 3.8 Flash narrative scoring & virality curator selects top-performing breaking stories.
- Transforms selected story into a 4-to-5 slide faceless carousel deck with platform-optimized captions & hashtags.
- Queues posts for review (`PENDING_REVIEW`) or automatic scheduling (`SCHEDULED`) with Discord / Telegram / Slack webhook alerts.

### 3. AI Ideas Engine (`/ideas`)
- Source manager supporting RSS, OPML, URLs, and AI-assisted topic brainstorming.
- One-click transformation: Idea &rarr; Carousel Studio or Scheduled Post.

---

## 🛠️ Quick Start

### Prerequisites
- Node.js `^20.0.0` or `>= 22`
- pnpm `11.x`
- PostgreSQL database (or Docker Compose)
- Google Gemini API key (`GEMINI_API_KEY`)

### Setup Instructions

1. **Install Dependencies**
   ```bash
   pnpm install
   ```

2. **Configure Environment**
   Ensure `.env` contains your database and API credentials:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/postpilot"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   GEMINI_API_KEY="AIzaSy..."
   ```

3. **Generate Prisma Client**
   ```bash
   pnpm db:generate
   ```

4. **Run Development Server**
   ```bash
   # Run frontend only (Studio, Carousel, Ideas)
   pnpm dev:frontend

   # Or run all services in parallel (Frontend, Backend, Orchestrator)
   pnpm dev
   ```

5. **Open Studio**
   - Studio Workspace: `http://localhost:3000/studio`
   - Ideas & Flywheel: `http://localhost:3000/ideas`
   - Carousel Library: `http://localhost:3000/carousel`
   - Scheduler: `http://localhost:3000/calendar`
