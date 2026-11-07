import { prisma } from "../client";

export class AutomationsRepository {
  static async findWorkspaceAutomations(workspaceId: string) {
    return prisma.automation.findMany({
      where: { workspaceId },
      include: { logs: { take: 10, orderBy: { createdAt: "desc" } } },
      orderBy: { createdAt: "desc" },
    });
  }

  static async findById(id: string) {
    return prisma.automation.findUnique({
      where: { id },
      include: { logs: true },
    });
  }

  static async toggleActive(id: string, active: boolean) {
    return prisma.automation.update({
      where: { id },
      data: { active },
    });
  }

  static async logTrigger(automationId: string, username: string, triggerEvent: string, outcome: string) {
    return prisma.automationLog.create({
      data: {
        automationId,
        username,
        triggerEvent,
        outcome,
      },
    });
  }

  static async recordLead(data: {
    workspaceId: string;
    username: string;
    platform?: string;
    email?: string;
    followed?: boolean;
    status?: string;
  }) {
    return prisma.lead.create({
      data: {
        workspaceId: data.workspaceId,
        username: data.username,
        platform: data.platform ?? "instagram",
        email: data.email,
        followed: data.followed ?? false,
        status: data.status ?? "CONTACTED",
      },
    });
  }
}

