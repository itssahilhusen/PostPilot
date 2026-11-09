import { prisma } from "../src/client";
import { INITIAL_100_SOURCES } from "../../../apps/frontend/src/lib/news-sources-data";

async function seed() {
  console.log(`Seeding ${INITIAL_100_SOURCES.length} news sources into database...`);
  let inserted = 0;
  let updated = 0;

  for (const source of INITIAL_100_SOURCES) {
    try {
      await (prisma as any).newsSource.upsert({
        where: { websiteUrl: source.website_url },
        create: {
          id: source.id,
          name: source.name,
          websiteUrl: source.website_url,
          rssUrl: source.rss_url,
          category: source.category,
          sourceType: source.source_type,
          fetchMethod: source.fetch_method,
          isActive: source.is_active,
          trustLevel: source.trust_level,
          language: source.language,
          healthStatus: source.health_status,
          lastFetchedAt: source.last_fetched_at ? new Date(source.last_fetched_at) : null,
          lastSuccessfulFetchAt: source.last_successful_fetch_at ? new Date(source.last_successful_fetch_at) : null,
          lastError: source.last_error,
          faviconUrl: source.favicon_url,
        },
        update: {
          name: source.name,
          rssUrl: source.rss_url,
          category: source.category,
          sourceType: source.source_type,
          fetchMethod: source.fetch_method,
          healthStatus: source.health_status,
          faviconUrl: source.favicon_url,
        },
      });
      inserted++;
    } catch (e: any) {
      console.warn(`Error seeding source ${source.name}:`, e.message);
    }
  }

  console.log(`Successfully seeded ${inserted} news sources into PostgreSQL!`);
}

seed()
  .catch((e) => {
    console.error("Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

