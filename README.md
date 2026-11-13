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
