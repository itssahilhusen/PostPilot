import { prisma, isDatabaseAvailable } from "../client";

export interface CreateNewsSourceInput {
  name: string;
  websiteUrl: string;
  rssUrl?: string | null;
  category: string;
  sourceType?: string;
  fetchMethod?: string;
  isActive?: boolean;
  trustLevel?: number;
  language?: string;
  healthStatus?: string;
  faviconUrl?: string | null;
}

export interface CreateNewsArticleInput {
  sourceId: string;
  title: string;
  originalUrl: string;
  canonicalUrl: string;
  author?: string | null;
  publishedAt: Date;
  description?: string | null;
  articleContent?: string | null;
  imageUrl?: string | null;
  category: string;
  tags?: string;
  language?: string;
  contentHash: string;
  importanceScore?: number;
  credibilityScore?: number;
  verificationStatus?: string;
  processingStatus?: string;
  aiSummary?: string | null;
  mainEvent?: string | null;
  announcementType?: string | null;
  extractedEntities?: string;
  potentialConcerns?: string | null;
}

export class NewsSourcesRepository {
  static async isAvailable(): Promise<boolean> {
    return isDatabaseAvailable();
  }

  static async findMany(filters?: {
    category?: string;
    search?: string;
    isActive?: boolean;
    healthStatus?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters?.category && filters.category !== "all") {
      where.category = filters.category;
    }
    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }
    if (filters?.healthStatus && filters.healthStatus !== "all") {
      where.healthStatus = filters.healthStatus;
    }
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { websiteUrl: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return (prisma as any).newsSource.findMany({
      where,
      orderBy: { name: "asc" },
      take: filters?.limit ?? 100,
      skip: filters?.offset ?? 0,
      include: {
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  static async findById(id: string) {
    return (prisma as any).newsSource.findUnique({
      where: { id },
      include: {
        articles: {
          take: 20,
          orderBy: { publishedAt: "desc" },
        },
        _count: {
          select: { articles: true },
        },
      },
    });
  }

  static async findByWebsiteUrl(websiteUrl: string) {
    return (prisma as any).newsSource.findUnique({
      where: { websiteUrl },
    });
  }

  static async upsertSource(data: CreateNewsSourceInput) {
    return (prisma as any).newsSource.upsert({
      where: { websiteUrl: data.websiteUrl },
      create: {
        name: data.name,
        websiteUrl: data.websiteUrl,
        rssUrl: data.rssUrl,
        category: data.category,
        sourceType: data.sourceType ?? "publication",
        fetchMethod: data.fetchMethod ?? "rss",
        isActive: data.isActive ?? true,
        trustLevel: data.trustLevel ?? 85,
        language: data.language ?? "en",
        healthStatus: data.healthStatus ?? "Working",
        faviconUrl: data.faviconUrl,
      },
      update: {
        name: data.name,
        rssUrl: data.rssUrl ?? undefined,
        category: data.category,
        sourceType: data.sourceType,
        fetchMethod: data.fetchMethod,
        healthStatus: data.healthStatus,
        faviconUrl: data.faviconUrl ?? undefined,
      },
    });
  }

  static async updateHealth(
    id: string,
    updates: {
      healthStatus: string;
      lastFetchedAt: Date;
      lastSuccessfulFetchAt?: Date | null;
      lastError?: string | null;
    }
  ) {
    return (prisma as any).newsSource.update({
      where: { id },
      data: updates,
    });
  }

  static async toggleActive(id: string, isActive: boolean) {
    return (prisma as any).newsSource.update({
      where: { id },
      data: { isActive },
    });
  }

  // Articles
  static async findArticles(filters?: {
    sourceId?: string;
    category?: string;
    search?: string;
    importance?: "high" | "medium" | "low";
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};
    if (filters?.sourceId) where.sourceId = filters.sourceId;
    if (filters?.category && filters.category !== "all") where.category = filters.category;
    if (filters?.importance === "high") where.importanceScore = { gte: 75 };
    else if (filters?.importance === "medium") where.importanceScore = { gte: 50, lt: 75 };
    else if (filters?.importance === "low") where.importanceScore = { lt: 50 };

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    return (prisma as any).newsArticle.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      take: filters?.limit ?? 50,
      skip: filters?.offset ?? 0,
      include: {
        source: {
          select: {
            id: true,
            name: true,
            websiteUrl: true,
            category: true,
            faviconUrl: true,
          },
        },
      },
    });
  }

  static async findArticleByCanonical(canonicalUrl: string) {
    return (prisma as any).newsArticle.findUnique({
      where: { canonicalUrl },
    });
  }

  static async findArticleByContentHash(contentHash: string) {
    return (prisma as any).newsArticle.findUnique({
      where: { contentHash },
    });
  }

  static async createArticle(data: CreateNewsArticleInput) {
    return (prisma as any).newsArticle.create({
      data: {
        sourceId: data.sourceId,
        title: data.title,
        originalUrl: data.originalUrl,
        canonicalUrl: data.canonicalUrl,
        author: data.author,
        publishedAt: data.publishedAt,
        description: data.description,
        articleContent: data.articleContent,
        imageUrl: data.imageUrl,
        category: data.category,
        tags: data.tags ?? "[]",
        language: data.language ?? "en",
        contentHash: data.contentHash,
        importanceScore: data.importanceScore ?? 50,
        credibilityScore: data.credibilityScore ?? 80,
        verificationStatus: data.verificationStatus ?? "unverified",
        processingStatus: data.processingStatus ?? "pending",
        aiSummary: data.aiSummary,
        mainEvent: data.mainEvent,
        announcementType: data.announcementType,
        extractedEntities: data.extractedEntities ?? "{}",
        potentialConcerns: data.potentialConcerns,
      },
    });
  }

  static async updateArticleAI(
    id: string,
    aiData: {
      importanceScore?: number;
      credibilityScore?: number;
      verificationStatus?: string;
      processingStatus?: string;
      aiSummary?: string;
      mainEvent?: string;
      announcementType?: string;
      extractedEntities?: string;
      potentialConcerns?: string;
    }
  ) {
    return (prisma as any).newsArticle.update({
      where: { id },
      data: aiData,
    });
  }
}

