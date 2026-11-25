import {
  Headers,
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  HttpStatus,
  HttpCode,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { MetaOAuthService } from "./meta-oauth.service";
import { AccountsService } from "./accounts.service";
import { ConnectAccountDto } from "./dto/connect-account.dto";

@ApiTags("Accounts")
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService, private readonly sessions: MetaOAuthService) {}

  @Get()
  @ApiOperation({ summary: "Get all connected social channels" })
  @ApiQuery({ name: "workspaceId", required: false, example: "ws-default-1" })
  @ApiResponse({ status: 200, description: "Connected social accounts returned" })
  async getAccounts(@Headers("cookie") cookie: string) {
    const { workspaceId } = await this.sessions.identity(cookie);
    const data = await this.accountsService.getAccounts(workspaceId);
    return { success: true, count: data.length, data };
  }

  @Post("connect")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Connect a social channel (encrypted token storage)" })
  async connectAccount(@Body() dto: ConnectAccountDto, @Headers("cookie") cookie: string) {
    dto.workspaceId = (await this.sessions.identity(cookie)).workspaceId;
    const data = await this.accountsService.connectAccount(dto);
    return { success: true, message: `Connected @${dto.handle} successfully`, data };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Disconnect a social channel" })
  async disconnect(@Param("id") id: string, @Headers("cookie") cookie: string) {
    const { workspaceId } = await this.sessions.identity(cookie);
    await this.accountsService.disconnect(id, workspaceId);
    return { success: true, message: `Account ${id} disconnected` };
  }
}

