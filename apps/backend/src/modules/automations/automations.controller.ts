import { Controller, Get, Patch, Param, Body, Query } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiQuery } from "@nestjs/swagger";
import { AutomationsService } from "./automations.service";

@ApiTags("Automations")
@Controller("automations")
export class AutomationsController {
  constructor(private readonly automationsService: AutomationsService) {}

  @Get()
  @ApiOperation({ summary: "Get all automations for a workspace" })
  @ApiQuery({ name: "workspaceId", required: false, example: "ws-default-1" })
  async getAutomations(@Query("workspaceId") workspaceId: string = "ws-default-1") {
    const data = await this.automationsService.getAutomations(workspaceId);
    return { success: true, count: data.length, data };
  }

  @Patch(":id/toggle")
  @ApiOperation({ summary: "Toggle automation active state" })
  async toggle(@Param("id") id: string, @Body("active") active: boolean) {
    const data = await this.automationsService.toggleAutomation(id, active);
    return { success: true, data };
  }
}

