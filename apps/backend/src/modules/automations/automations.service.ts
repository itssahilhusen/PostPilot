import { Injectable, NotFoundException } from "@nestjs/common";
import { AutomationsRepository } from "@reerts/database";

@Injectable()
export class AutomationsService {
  async getAutomations(workspaceId: string) {
    return AutomationsRepository.findWorkspaceAutomations(workspaceId);
  }

  async toggleAutomation(id: string, active: boolean) {
    const auto = await AutomationsRepository.findById(id);
    if (!auto) {
      throw new NotFoundException(`Automation ${id} not found`);
    }
    return AutomationsRepository.toggleActive(id, active);
  }
}

