import { prisma } from "../client";

export class WorkspacesRepository {
  static async findById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      include: {
        users: true,
        accounts: true,
      },
    });
  }

  static async findFirst() {
    return prisma.workspace.findFirst({
      include: {
        accounts: true,
      },
    });
  }

  static async deductCredits(id: string, amount: number = 1) {
    return prisma.workspace.update({
      where: { id },
      data: {
        creditsUsed: { increment: amount },
      },
    });
  }

  static async updateSettings(id: string, data: { name?: string; timezone?: string; plan?: string }) {
    return prisma.workspace.update({
      where: { id },
      data,
    });
  }
}

