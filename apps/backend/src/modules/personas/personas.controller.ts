import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { PersonasService } from "./personas.service";
import { AnalyzePersonaDto } from "./dto/analyze-persona.dto";

@ApiTags("Personas")
@Controller("personas")
export class PersonasController {
  constructor(private readonly personasService: PersonasService) {}

  @Get()
  @ApiOperation({ summary: "Get all personas for a workspace" })
  @ApiQuery({ name: "workspaceId", required: false, example: "ws-default-1" })
  async getPersonas(@Query("workspaceId") workspaceId: string = "ws-default-1") {
    const data = await this.personasService.getPersonas(workspaceId);
    return { success: true, count: data.length, data };
  }

  @Get(":id")
  @ApiOperation({ summary: "Get persona by ID" })
  async getPersonaById(@Param("id") id: string) {
    const data = await this.personasService.getPersonaById(id);
    return { success: true, data };
  }

  @Post("analyze")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Analyze voice and generate content plan" })
  async analyzePersona(@Body() dto: AnalyzePersonaDto) {
    const data = await this.personasService.analyzeAndPlan(dto);
    return { success: true, data };
  }
}

