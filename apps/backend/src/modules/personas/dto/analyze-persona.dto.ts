import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, Max } from "class-validator";

export class AnalyzePersonaDto {
  @ApiProperty({ example: "ws-default-1" })
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @ApiProperty({ example: "Tech Founder Voice" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: "Directness score (0-100)", example: 85 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  directness?: number;

  @ApiPropertyOptional({ description: "Formality score (0-100)", example: 30 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  formality?: number;

  @ApiPropertyOptional({ description: "Sample text or reference handles" })
  @IsString()
  @IsOptional()
  referenceContent?: string;
}

