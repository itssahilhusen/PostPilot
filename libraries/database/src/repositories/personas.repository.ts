import { prisma } from "../client";

export class PersonasRepository {
  static async findWorkspacePersonas(workspaceId: string) {
    return prisma.persona.findMany({
      where: { workspaceId },
      include: { socialAccount: true },
      orderBy: { personaNumber: "asc" },
    });
  }

  static async findPersonaById(id: string) {
    return prisma.persona.findUnique({
      where: { id },
      include: { socialAccount: true },
    });
  }

  static async updatePersonaVoice(id: string, data: Partial<{
    name: string;
    profileIdentity: string;
    targetAudience: string;
    hookSetting: string;
    writingStyleAnalysis: string;
    ctaSetting: string;
    referenceLinkSetting: string;
    coreTopics: string;
    topPerformingPatterns: string;
    additionalInstructions: string;
    status: string;
    analyzedPostsCount: number;
    analyzedAt: Date;
  }>) {
    return prisma.persona.update({
      where: { id },
      data,
    });
  }
}

