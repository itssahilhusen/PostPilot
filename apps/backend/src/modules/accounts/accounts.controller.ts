import {
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
import { AccountsService } from "./accounts.service";
import { ConnectAccountDto } from "./dto/connect-account.dto";

@ApiTags("Accounts")
@Controller("accounts")
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Get()
  @ApiOperation({ summary: "Get all connected social channels" })
  @ApiQuery({ name: "workspaceId", required: false, example: "ws-default-1" })
  @ApiResponse({ status: 200, description: "Connected social accounts returned" })
  async getAccounts(@Query("workspaceId") workspaceId: string = "ws-default-1") {
    const data = await this.accountsService.getAccounts(workspaceId);
    return { success: true, count: data.length, data };
  }

  @Post("connect")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Connect a social channel (encrypted token storage)" })
  async connectAccount(@Body() dto: ConnectAccountDto) {
    const data = await this.accountsService.connectAccount(dto);
    return { success: true, message: `Connected @${dto.handle} successfully`, data };
  }

  @Delete(":id")
  @ApiOperation({ summary: "Disconnect a social channel" })
  async disconnect(@Param("id") id: string) {
    await this.accountsService.disconnect(id);
    return { success: true, message: `Account ${id} disconnected` };
  }
}

