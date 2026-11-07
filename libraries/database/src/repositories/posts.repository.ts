import { prisma } from "../client";

export class PostsRepository {
  static async findWorkspacePosts(workspaceId: string, status?: string) {
    return prisma.post.findMany({
      where: {
        workspaceId,
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: { variants: true },
    });
  }

  static async findPostById(id: string) {
    return prisma.post.findUnique({
      where: { id },
      include: { variants: true },
    });
  }

  static async findScheduledPostsDue(now: Date = new Date()) {
    return prisma.post.findMany({
      where: {
        status: "SCHEDULED",
        scheduledAt: { lte: now },
      },
      include: {
        variants: true,
        workspace: {
          include: { accounts: true },
        },
      },
    });
  }

  static async createPost(data: {
    workspaceId: string;
    title: string;
    content: string;
    rawThreads?: string;
    mediaUrls?: string;
    platforms?: string;
    status?: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED";
    scheduledAt?: Date | null;
  }) {
    return prisma.post.create({
      data: {
        workspaceId: data.workspaceId,
        title: data.title,
        content: data.content,
        rawThreads: data.rawThreads ?? "[]",
        mediaUrls: data.mediaUrls ?? "[]",
        platforms: data.platforms ?? '["x","linkedin"]',
        status: data.status ?? "DRAFT",
        scheduledAt: data.scheduledAt,
      },
    });
  }

  static async markPublished(id: string, publishedAt: Date = new Date()) {
    return prisma.post.update({
      where: { id },
      data: {
        status: "PUBLISHED",
        publishedAt,
        failureReason: null,
      },
    });
  }

  static async markFailed(id: string, failureReason: string) {
    return prisma.post.update({
      where: { id },
      data: {
        status: "FAILED",
        failureReason,
      },
    });
  }

  static async updateStatus(id: string, status: "DRAFT" | "SCHEDULED" | "PUBLISHED" | "FAILED") {
    return prisma.post.update({
      where: { id },
      data: { status },
    });
  }

  static async deletePost(id: string) {
    return prisma.post.delete({
      where: { id },
    });
  }
}

