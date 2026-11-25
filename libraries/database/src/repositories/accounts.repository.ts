import { prisma } from "../client";

export class AccountsRepository {
  static async findWorkspaceAccounts(workspaceId: string) {
    return prisma.channel.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "asc" },
    });
  }

  static async findAccountById(id: string) {
    return prisma.channel.findUnique({
      where: { id },
    });
  }

  static async findByProviderAndHandle(workspaceId: string, provider: string, handle: string) {
    return prisma.channel.findUnique({
      where: {
        workspaceId_provider_handle: {
          workspaceId,
          provider,
          handle,
        },
      },
    });
  }

  static async upsertAccount(data: {
    workspaceId: string;
    provider: string;
    name: string;
    handle: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
    metadata?: string;
  }) {
    return prisma.channel.upsert({
      where: {
        workspaceId_provider_handle: {
          workspaceId: data.workspaceId,
          provider: data.provider,
          handle: data.handle,
        },
      },
      update: {
        name: data.name,
        avatar: data.avatar,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        status: "active",
        metadata: data.metadata ?? "{}",
      },
      create: {
        workspaceId: data.workspaceId,
        provider: data.provider,
        name: data.name,
        handle: data.handle,
        avatar: data.avatar,
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        expiresAt: data.expiresAt,
        status: "active",
        metadata: data.metadata ?? "{}",
      },
    });
  }

  static async updateTokens(id: string, accessToken: string, refreshToken?: string, expiresAt?: Date) {
    return prisma.channel.update({
      where: { id },
      data: {
        accessToken,
        ...(refreshToken ? { refreshToken } : {}),
        ...(expiresAt ? { expiresAt } : {}),
        status: "active",
      },
    });
  }

  static async setStatus(id: string, status: "active" | "updating" | "sync_failed") {
    return prisma.channel.update({
      where: { id },
      data: { status },
    });
  }

  static async disconnect(id: string) {
    return prisma.channel.delete({
      where: { id },
    });
  }
}

