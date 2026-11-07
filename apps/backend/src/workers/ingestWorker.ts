import { Worker, Job, ConnectionOptions } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TldrService, Article } from '../services/ingestion/tldrService';

const logger = new Logger('IngestWorker');

// Redis connection options (can be driven by environment variables)
const redisConnection: ConnectionOptions = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
};

export interface IngestJobData {
  triggeredBy?: string;
  source?: string;
}

export interface IngestJobResult {
  source: string;
  articlesCount: number;
  articles: Article[];
  ingestedAt: string;
}

/**
 * Creates and starts the BullMQ Ingest Worker.
 *
 * @param tldrService - Instance of TldrService (or injected via NestJS container)
 */
export function createIngestWorker(
  tldrService: TldrService = new TldrService(),
): Worker<IngestJobData, IngestJobResult> {
  const worker = new Worker<IngestJobData, IngestJobResult>(
    'ingestion-queue',
    async (job: Job<IngestJobData, IngestJobResult>): Promise<IngestJobResult> => {
      logger.log(`Processing job ${job.id} [${job.name}] triggered by: ${job.data.triggeredBy || 'scheduler'}`);

      // 1. Fetch filtered articles published in the last 24 hours
      const articles = await tldrService.fetchLatestArticles();

      logger.log(`Job ${job.id}: Retrieved ${articles.length} fresh articles from TLDR`);

      // 2. Pass results to the next step in your autonomous content pipeline
      // Example: Forward to content generation queue, vector embedding, or database persistence
      for (const article of articles) {
        logger.debug(`[Article Ready for Generation] ${article.title} (${article.link})`);
      }

      console.log('--- INGESTION RESULTS (READY FOR PIPELINE) ---');
      console.log(JSON.stringify(articles, null, 2));

      return {
        source: 'tldr',
        articlesCount: articles.length,
        articles,
        ingestedAt: new Date().toISOString(),
      };
    },
    {
      connection: redisConnection,
      concurrency: 5,
    },
  );

  // Event handlers
  worker.on('completed', (job: Job, result: IngestJobResult) => {
    logger.log(`Job ${job.id} completed successfully with ${result.articlesCount} articles.`);
  });

  worker.on('failed', (job: Job | undefined, err: Error) => {
    logger.error(`Job ${job?.id} failed with error: ${err.message}`, err.stack);
  });

  worker.on('error', (err: Error) => {
    logger.error(`Worker error encountered: ${err.message}`, err.stack);
  });

  return worker;
}

// Standalone execution entrypoint if run directly via tsx/node
if (require.main === module) {
  logger.log('Starting Ingest Worker in standalone mode...');
  const worker = createIngestWorker();

  const shutdown = async () => {
    logger.log('Gracefully shutting down Ingest Worker...');
    await worker.close();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

