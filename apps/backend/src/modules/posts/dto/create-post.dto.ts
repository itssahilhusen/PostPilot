import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional, IsArray, IsEnum, IsDateString } from "class-validator";

export enum PostStatusEnum {
  DRAFT = "DRAFT",
  SCHEDULED = "SCHEDULED",
  PUBLISHED = "PUBLISHED",
  FAILED = "FAILED",
}

export class CreatePostDto {
  @ApiProperty({ description: "Workspace ID owning this post", example: "ws-default-1" })
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @ApiProperty({ description: "Post title or headline", example: "5 Growth Frameworks for 2026" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: "Primary post body content" })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ description: "Target platforms array", example: ["x", "linkedin"] })
  @IsArray()
  @IsOptional()
  platforms?: string[];

  @ApiPropertyOptional({ description: "Array of media URLs" })
  @IsArray()
  @IsOptional()
  mediaUrls?: string[];

  @ApiPropertyOptional({ enum: PostStatusEnum, default: PostStatusEnum.DRAFT })
  @IsEnum(PostStatusEnum)
  @IsOptional()
  status?: PostStatusEnum;

  @ApiPropertyOptional({ description: "ISO 8601 scheduling datetime", example: "2026-11-05T14:30:00Z" })
  @IsDateString()
  @IsOptional()
  scheduledAt?: string;
}

