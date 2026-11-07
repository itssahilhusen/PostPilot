import { Injectable, NotFoundException } from "@nestjs/common";
import { PersonasRepository } from "@reerts/database";
import { AiEngine } from "@reerts/integrations";
import { AnalyzePersonaDto } from "./dto/analyze-persona.dto";

@Injectable()
export class PersonasService {
  async getPersonas(workspaceId: string) {
    return PersonasRepository.findWorkspacePersonas(workspaceId);
  }

  async getPersonaById(id: string) {
    const persona = await PersonasRepository.findPersonaById(id);
    if (!persona) {
      throw new NotFoundException(`Persona ${id} not found`);
    }
    return persona;
  }

  async analyzeAndPlan(dto: AnalyzePersonaDto) {
    // Uses AI engine from integrations library
    const plan = await AiEngine.planCarousel({
      topic: dto.name,
      text: dto.referenceContent,
      brandVoice: {
        name: dto.name,
        directness: dto.directness ?? 85,
        formality: dto.formality ?? 30,
      },
    });

    return {
      personaName: dto.name,
      parameters: {
        directness: dto.directness ?? 85,
        formality: dto.formality ?? 30,
      },
      generatedPlan: plan,
    };
  }
}

