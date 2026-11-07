import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsString, IsNotEmpty, IsOptional } from "class-validator";

export class ConnectAccountDto {
  @ApiProperty({ example: "ws-default-1" })
  @IsString()
  @IsNotEmpty()
  workspaceId!: string;

  @ApiProperty({ description: "Social channel identifier", example: "x" })
  @IsString()
  @IsNotEmpty()
  provider!: string;

  @ApiProperty({ example: "Alex Rivers" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: "@alexrivers" })
  @IsString()
  @IsNotEmpty()
  handle!: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  avatar?: string;

  @ApiPropertyOptional({ description: "OAuth access token" })
  @IsString()
  @IsOptional()
  accessToken?: string;

  @ApiPropertyOptional({ description: "OAuth refresh token" })
  @IsString()
  @IsOptional()
  refreshToken?: string;
}

