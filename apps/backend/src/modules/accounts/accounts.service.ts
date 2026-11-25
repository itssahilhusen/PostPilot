import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountsRepository, prisma } from "@reerts/database";
import { EncryptionHelper } from "@reerts/helpers";
import { ConnectAccountDto } from "./dto/connect-account.dto";

@Injectable()
export class AccountsService {
  async getAccounts(workspaceId: string) {
    const accounts = await AccountsRepository.findWorkspaceAccounts(workspaceId);
    // Mask tokens before sending to client
    return accounts.map((acc: any) => ({
      ...acc,
      accessToken: acc.accessToken ? "********" : null,
      refreshToken: acc.refreshToken ? "********" : null,
    }));
  }

  async connectAccount(dto: ConnectAccountDto) {
    // Encrypt sensitive access token before saving to database
    const encryptedAccessToken = dto.accessToken
      ? EncryptionHelper.encrypt(dto.accessToken)
      : undefined;

    const encryptedRefreshToken = dto.refreshToken
      ? EncryptionHelper.encrypt(dto.refreshToken)
      : undefined;

    const account = await AccountsRepository.upsertAccount({
      workspaceId: dto.workspaceId,
      provider: dto.provider,
      name: dto.name,
      handle: dto.handle,
      avatar: dto.avatar,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    });
    const { accessToken, refreshToken, ...metadata } = account;
    return metadata;
  }

  async disconnect(id: string, workspaceId: string) {
    const changed = await prisma.channel.updateMany({ where: { id, workspaceId }, data: { accessToken: null, refreshToken: null, status: "disconnected" } });
    if (!changed.count) {
      throw new NotFoundException(`Account ${id} not found`);
    }

  }
}

