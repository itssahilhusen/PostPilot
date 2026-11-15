import { Module } from "@nestjs/common";
import { AccountsController } from "./accounts.controller";
import { AccountsService } from "./accounts.service";
import { MetaOAuthService } from "./meta-oauth.service";
import { MetaOAuthController } from "./meta-oauth.controller";

@Module({
  controllers: [AccountsController, MetaOAuthController],
  providers: [AccountsService, MetaOAuthService],
  exports: [AccountsService],
})
export class AccountsModule {}

