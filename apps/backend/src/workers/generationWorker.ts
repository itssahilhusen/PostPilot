import { Worker, Job, Queue, ConnectionOptions } from 'bullmq';
import { Logger } from '@nestjs/common';
import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as net from 'net';
import { Article } from '../services/ingestion/tldrService';
import {
  CarouselGeneratorService,
  carouselGenerator,
  CarouselMetadata,
  SlideBranding,
} from '../services/generation/carouselGenerator';

const logger = new Logger('GenerationWorker');

// Redis connection options (aligns with BullMQ infrastructure across Reerts)
export const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null,
};

// Queue names
export const GENERATION_QUEUE_NAME = 'generation-queue';
export const PENDING_APPROVAL_QUEUE_NAME = 'pending-approval-queue';

/**
 * Fast network probe to check if Redis is reachable before attempting queue operations
 */
export async function isRedisAvailable(timeoutMs = 150): Promise<boolean> {
  const host = process.env.REDIS_HOST || '127.0.0.1';
  const port = parseInt(process.env.REDIS_PORT || '6379', 10);

  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection({ port, host, timeout: timeoutMs }, () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('error', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
  });
}

let cachedApprovalQueue: Queue<PendingApprovalJobData> | null = null;

export function getPendingApprovalQueue(): Queue<PendingApprovalJobData> {
  if (!cachedApprovalQueue) {
    cachedApprovalQueue = new Queue<PendingApprovalJobData>(
      PENDING_APPROVAL_QUEUE_NAME,
      {
        connection: redisConnection,
        defaultJobOptions: {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 5000,
          },
          removeOnComplete: 100,
          removeOnFail: 200,
        },
      },
    );
  }
  return cachedApprovalQueue;
}

export const pendingApprovalQueue = {
  add: async (name: string, data: PendingApprovalJobData, opts?: any) => {
    return getPendingApprovalQueue().add(name, data, opts);
  },
  close: async () => {
    if (cachedApprovalQueue) {
      await cachedApprovalQueue.close();
      cachedApprovalQueue = null;
    }
  },
};

export interface GenerationJobData {
  triggeredBy?: string;
  source?: string;
  newsItems: Article[];
}

export interface GeneratedCaptionResult {
  title: string;
  caption: string;
  hashtags: string[];
}

export interface PendingApprovalJobData {
  id: string;
  channel: 'theaiseed';
  platform: 'instagram';
  title: string;
  caption: string;
  hashtags: string[];
  slideCount: number;
  slidePaths: string[];
  curatedStories: Article[];
  metadata: CarouselMetadata;
  createdAt: string;
}

export interface DailyAITechCarouselResult {
  jobId: string;
  channel: 'theaiseed';
  title: string;
  caption: string;
  hashtags: string[];
  slideBuffers: Buffer[];
  slidePaths: string[];
  curatedStories: Article[];
  metadata: CarouselMetadata;
  pushedToQueue: boolean;
  queuedAt: string;
}

/**
 * Timeout helper preventing external API or renderer hangs
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  operationName: string,
): Promise<T> {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`Timeout: "${operationName}" exceeded ${timeoutMs}ms limit.`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timer);
  });
}



/**
 * Requirement 1: AI Curation Step
 * Evaluates the fetched news array and selects the 3 to 5 most groundbreaking AI & tech stories
 * for the "theaiseed" Instagram brand, returning them in a structured JSON array.
 */
export async function selectTopStories(newsItems: Article[]): Promise<Article[]> {
  logger.log(`[AI Curation] Curating top AI stories from ${newsItems.length} candidate articles...`);

  if (!newsItems || newsItems.length === 0) {
    logger.warn('[AI Curation] Received empty news list. Returning empty selection.');
    return [];
  }

  // If list is already small (<= 5), return directly
  if (newsItems.length <= 5) {
    logger.log(`[AI Curation] Candidates count (${newsItems.length}) <= 5, adopting all stories.`);
    return newsItems;
  }

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const textModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  if (apiKey && apiKey.length > 5) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const curationPrompt = `You are the lead editor and viral strategist for "theaiseed", an elite Instagram media brand covering artificial intelligence, frontier models, autonomous agents, and futuristic computing.
Below is an array of tech news articles fetched in the last 24 hours.

Select the 3 to 5 MOST GROUNDBREAKING, high-impact stories that will drive maximum virality, saves, and comments from AI engineers, founders, and tech enthusiasts.

Selection Criteria:
1. High technical significance (e.g. major model releases, autonomous agent milestones, open-weights breakthroughs).
2. High engagement and visual discussion potential on Instagram.
3. Diverse angles (avoid picking 3 stories about the exact same company).
4. Strictly return 3, 4, or 5 stories from the provided list.

Input Articles:
${JSON.stringify(
  newsItems.map((n, i) => ({
    index: i,
    title: n.title,
    summary: n.summary.slice(0, 300),
    link: n.link,
    publishedAt: n.publishedAt,
  })),
  null,
  2,
)}

Return a structured JSON array of selected items matching the input Article schema:
[
  { "title": "...", "link": "...", "summary": "...", "publishedAt": "..." }
]`;

      const curationSchema = {
        type: Type.ARRAY,
        description: 'Array of 3 to 5 curated high-retention AI news stories',
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            link: { type: Type.STRING },
            summary: { type: Type.STRING },
            publishedAt: { type: Type.STRING },
          },
          required: ['title', 'link', 'summary', 'publishedAt'],
        },
      };

      // Execute with a 15-second timeout guard
      const response = await withTimeout(
        ai.models.generateContent({
          model: textModel,
          contents: curationPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: curationSchema,
            temperature: 0.2,
          },
        }),
        15000,
        'Gemini Top Stories Curation',
      );

      const raw = response.text || '';
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length >= 3) {
        logger.log(`[AI Curation] Successfully curated ${parsed.length} top stories via Gemini.`);
        return parsed.slice(0, 5);
      }
    } catch (err: any) {
      logger.warn(`[AI Curation] Gemini curation failed (${err.message}). Using algorithmic fallback.`);
    }
  }

  // Robust algorithmic fallback: Prioritize stories with high-signal keywords
  const highSignalKeywords = [
    'ai',
    'agent',
    'model',
    'deepseek',
    'claude',
    'gpt',
    'meta',
    'robot',
    'weights',
    'llm',
    'open-source',
    'quantum',
  ];

  const scored = newsItems.map((article) => {
    const text = `${article.title} ${article.summary}`.toLowerCase();
    let score = 0;
    for (const kw of highSignalKeywords) {
      if (text.includes(kw)) score += 1;
    }
    return { article, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const selected = scored.slice(0, 4).map((s) => s.article);
  logger.log(`[AI Curation] Algorithmic fallback picked top ${selected.length} high-signal stories.`);
  return selected;
}

/**
 * Requirement 3: Title & Caption Generation
 * Generates an SEO-optimized Instagram caption, engagement hooks, and hashtags for "theaiseed".
 */
export async function generateInstagramCaption(
  selectedStories: Article[],
): Promise<GeneratedCaptionResult> {
  logger.log('[Caption Gen] Authoring high-engagement Instagram caption for @theaiseed...');

  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
  const textModel = process.env.GEMINI_MODEL || 'gemini-3.8-flash';

  if (apiKey && apiKey.length > 5) {
    try {
      const ai = new GoogleGenAI({ apiKey });

      const captionPrompt = `You are the viral copywriter for "theaiseed", the premier Instagram publication for AI and technology intelligence.
Write a high-converting, professional, aesthetic Instagram caption for today's carousel covering these stories:

${selectedStories.map((s, i) => `${i + 1}. ${s.title}: ${s.summary}`).join('\n\n')}

Caption Requirements:
1. "title": Punchy, gripping carousel title (e.g., "5 AI REVOLUTIONS YOU MISSED TODAY").
2. "caption":
   - Gripping 1-line hook with neon emojis (⚡, 🤖, 🌐).
   - Bulleted breakdown with punchy 1-2 sentence takeaways for each story.
   - An open-ended discussion question prompting comments (e.g. "Which breakthrough changes your workflow first?").
   - Call to action: "⚡ Follow @theaiseed for daily AI intelligence, agent workflows, and futuristic tech drops."
   - Clean spacing with line breaks.
3. "hashtags": Array of 15-20 highly targeted, high-traffic AI/Tech hashtags (without the '#' symbol, e.g. ["ai", "artificialintelligence", "deepseek", "theaiseed", "techtrends"]).`;

      const captionSchema = {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          caption: { type: Type.STRING },
          hashtags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: ['title', 'caption', 'hashtags'],
      };

      const response = await withTimeout(
        ai.models.generateContent({
          model: textModel,
          contents: captionPrompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: captionSchema,
            temperature: 0.5,
          },
        }),
        15000,
        'Gemini Caption Generation',
      );

      const parsed = JSON.parse(response.text || '') as GeneratedCaptionResult;
      if (parsed && parsed.caption) {
        logger.log('[Caption Gen] Successfully authored custom caption via Gemini.');
        return parsed;
      }
    } catch (err: any) {
      logger.warn(`[Caption Gen] Caption API generation failed (${err.message}). Using fallback caption.`);
    }
  }

  // Graceful fallback caption
  const bullets = selectedStories
    .map((s, i) => `⚡ ${i + 1}. ${s.title.toUpperCase()}\n↳ ${s.summary.slice(0, 110)}...`)
    .join('\n\n');

  const fallbackCaption = `⚡ THE AI SEED // DAILY TECH INTEL DISPATCH\n\nToday's most critical breakthroughs in artificial intelligence and autonomous systems:\n\n${bullets}\n\n💬 Which of these shifts will have the biggest impact this year? Drop your thoughts below.\n\n⚡ Follow @theaiseed for daily cutting-edge AI breakthroughs and tech drops.\n\n#theaiseed #ai #artificialintelligence #technews #futuretech #generativeai #autonomousagents`;

  return {
    title: 'TODAY IN AI // TOP BREAKTHROUGHS',
    caption: fallbackCaption,
    hashtags: [
      'theaiseed',
      'ai',
      'artificialintelligence',
      'technews',
      'futuretech',
      'generativeai',
      'autonomousagents',
      'deepseek',
      'machinelearning',
      'techtrends',
    ],
  };
}

/**
 * Requirement 2 & 4: Main Orchestrator Function
 * Curates stories, executes image generation and Puppeteer rendering, creates captions,
 * and pushes the final package to PendingApprovalQueue.
 */
export async function processDailyAITechCarousel(
  newsItems: Article[],
  carouselService: CarouselGeneratorService = carouselGenerator,
): Promise<DailyAITechCarouselResult> {
  const sessionJobId = `carousel_theaiseed_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  logger.log(`\n=============================================================`);
  logger.log(`🚀 STARTING DAILY AI TECH CAROUSEL PIPELINE [${sessionJobId}]`);
  logger.log(`   Channel: @theaiseed | Input Articles: ${newsItems.length}`);
  logger.log(`=============================================================`);

  // Step 1: AI Curation Step
  const curatedStories = await selectTopStories(newsItems);
  if (curatedStories.length === 0) {
    throw new Error('Pipeline aborted: No eligible stories could be curated from news input.');
  }
  logger.log(`[Pipeline] Selected ${curatedStories.length} stories for carousel assembly.`);

  // Step 2: Carousel Breakdown via generateCarouselMetadata
  logger.log('[Pipeline] Generating slide breakdown with structured metadata...');
  const metadata = await withTimeout(
    carouselService.generateCarouselMetadata(curatedStories),
    20000,
    'Carousel Metadata Generation',
  );

  const slides = metadata.slides;
  const totalSlides = slides.length;
  logger.log(`[Pipeline] Assembling ${totalSlides} slides under theme: "${metadata.theme}"`);

  // Setup storage directories for pending approval audit
  const storageRoot = path.resolve(process.cwd(), 'storage', 'carousels', 'pending-approval', sessionJobId);
  if (!fs.existsSync(storageRoot)) {
    fs.mkdirSync(storageRoot, { recursive: true });
  }

  // Branding configuration dedicated for "theaiseed"
  const theAiSeedBranding: SlideBranding = {
    brandName: 'THE AI SEED',
    brandTag: 'DAILY AI',
    hudTag: '3D CYBERNETIC MOCKUP',
    footerText: '@THEAISEED • DAILY AI BREAKTHROUGHS',
  };

  const renderedBuffers: Buffer[] = [];
  const slideFilePaths: string[] = [];

  // Step 3: Sequential Slide Rendering (Image Gen -> Puppeteer Layout Overlay)
  for (let i = 0; i < totalSlides; i++) {
    const slide = slides[i];
    const slideNum = i + 1;
    logger.log(`\n[Slide ${slideNum}/${totalSlides}] "${slide.heading}"`);

    // 3a. Generate AI cybernetic visual
    logger.log(`[Slide ${slideNum}] Generating art asset...`);
    const imageUri = await withTimeout(
      carouselService.generateSlideImage(slide.visualPrompt),
      35000,
      `Slide ${slideNum} Image Generation`,
    );

    // 3b. Render 1080x1350 template with Puppeteer
    logger.log(`[Slide ${slideNum}] Rendering 1080x1350 Instagram frame...`);
    const jpgBuffer = await withTimeout(
      carouselService.renderSlideToImage(
        slide.heading,
        slide.subtext,
        imageUri,
        slideNum,
        totalSlides,
        theAiSeedBranding,
      ),
      25000,
      `Slide ${slideNum} Puppeteer Render`,
    );

    // Persist slide to pending approval directory
    const slideFileName = `slide_${slideNum}_of_${totalSlides}.jpg`;
    const slideFilePath = path.join(storageRoot, slideFileName);
    await fs.promises.writeFile(slideFilePath, jpgBuffer);

    renderedBuffers.push(jpgBuffer);
    slideFilePaths.push(slideFilePath);
    logger.log(`✓ Slide ${slideNum} rendered and saved: ${slideFilePath} (${jpgBuffer.length.toLocaleString()} bytes)`);
  }

  // Step 4: Title & Caption Generation
  logger.log('\n[Pipeline] Generating Instagram caption and hashtags...');
  const captionData = await generateInstagramCaption(curatedStories);

  // Step 5: Packaging & Push to PendingApprovalQueue
  const pendingPayload: PendingApprovalJobData = {
    id: sessionJobId,
    channel: 'theaiseed',
    platform: 'instagram',
    title: captionData.title,
    caption: captionData.caption,
    hashtags: captionData.hashtags,
    slideCount: renderedBuffers.length,
    slidePaths: slideFilePaths,
    curatedStories,
    metadata,
    createdAt: new Date().toISOString(),
  };

  let pushedToQueue = false;
  const redisAvailable = await isRedisAvailable(200);
  if (redisAvailable) {
    try {
      // Attempt push to BullMQ queue
      await withTimeout(
        pendingApprovalQueue.add('review-carousel', pendingPayload, {
          jobId: sessionJobId,
          priority: 1,
        }),
        3000,
        'Push to PendingApprovalQueue',
      );
      pushedToQueue = true;
      logger.log(`\n📬 [Queue] Successfully pushed carousel [${sessionJobId}] to "${PENDING_APPROVAL_QUEUE_NAME}".`);
    } catch (err: any) {
      logger.warn(
        `⚠️ [Queue Notice] Could not push to BullMQ queue (${err.message}). Payload saved locally at: ${storageRoot}`,
      );
    }
  } else {
    logger.log(
      `ℹ️ [Queue Notice] Redis is offline on 127.0.0.1:6379 (standalone mode). Carousel package persisted locally at:\n   ${storageRoot}`,
    );
  }

  const result: DailyAITechCarouselResult = {
    jobId: sessionJobId,
    channel: 'theaiseed',
    title: captionData.title,
    caption: captionData.caption,
    hashtags: captionData.hashtags,
    slideBuffers: renderedBuffers,
    slidePaths: slideFilePaths,
    curatedStories,
    metadata,
    pushedToQueue,
    queuedAt: new Date().toISOString(),
  };

  logger.log(`=============================================================`);
  logger.log(`✨ COMPLETED DAILY AI TECH CAROUSEL FOR @THEAISEED`);
  logger.log(`   Job ID: ${sessionJobId} | Slides: ${renderedBuffers.length}`);
  logger.log(`   Storage: ${storageRoot}`);
  logger.log(`=============================================================\n`);

  return result;
}

/**
 * Requirement 5: BullMQ Worker Definition
 * Creates and starts the BullMQ Generation Worker with retry policies and graceful degradation.
 */
export function createGenerationWorker(
  carouselService: CarouselGeneratorService = carouselGenerator,
): Worker<GenerationJobData, DailyAITechCarouselResult> {
  const worker = new Worker<GenerationJobData, DailyAITechCarouselResult>(
    GENERATION_QUEUE_NAME,
    async (job: Job<GenerationJobData, DailyAITechCarouselResult>): Promise<DailyAITechCarouselResult> => {
      logger.log(`[Job ${job.id}] Received carousel generation job triggered by: ${job.data.triggeredBy || 'scheduler'}`);

      const newsItems = job.data.newsItems || [];
      if (!Array.isArray(newsItems) || newsItems.length === 0) {
        throw new Error(`Job ${job.id} rejected: 'newsItems' array is missing or empty.`);
      }

      // Execute daily orchestrator pipeline
      return await processDailyAITechCarousel(newsItems, carouselService);
    },
    {
      connection: redisConnection,
      concurrency: 2,
    },
  );

  // Worker Lifecycle and Error Events
  worker.on('completed', (job: Job, result: DailyAITechCarouselResult) => {
    logger.log(`🎉 Job ${job.id} completed successfully! Curated ${result.curatedStories.length} stories, rendered ${result.slideBuffers.length} slides.`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(`❌ Job ${job?.id} failed on attempt ${job?.attemptsMade}/${job?.opts?.attempts || 3}: ${err.message}`, err.stack);
  });

  worker.on('error', (err: Error) => {
    logger.error(`[GenerationWorker Error] ${err.message}`, err.stack);
  });

  return worker;
}

// Standalone execution entrypoint if run directly via tsx/node
if (require.main === module) {
  logger.log('Starting Generation Worker in standalone listener mode...');
  const worker = createGenerationWorker();

  const shutdown = async () => {
    logger.log('Gracefully shutting down Generation Worker and Queues...');
    await worker.close();
    await pendingApprovalQueue.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
