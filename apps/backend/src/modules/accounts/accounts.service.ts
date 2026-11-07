import { Injectable, NotFoundException } from "@nestjs/common";
import { AccountsRepository } from "@reerts/database";
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

    return AccountsRepository.upsertAccount({
      workspaceId: dto.workspaceId,
      provider: dto.provider,
      name: dto.name,
      handle: dto.handle,
      avatar: dto.avatar,
      accessToken: encryptedAccessToken,
      refreshToken: encryptedRefreshToken,
    });
  }

  async disconnect(id: string) {
    const account = await AccountsRepository.findAccountById(id);
    if (!account) {
      throw new NotFoundException(`Account ${id} not found`);
    }
    return AccountsRepository.disconnect(id);
  }
}

