import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule } from "@nestjs/throttler";
import { ThrottlerBehindProxyGuard } from "./common/guards/throttler-proxy.guard";
import { PostsModule } from "./modules/posts/posts.module";
import { AccountsModule } from "./modules/accounts/accounts.module";
import { PersonasModule } from "./modules/personas/personas.module";
import { AutomationsModule } from "./modules/automations/automations.module";
import { HealthModule } from "./modules/health/health.module";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: "short",
        ttl: 1000,
        limit: 10, // 10 req/sec burst
      },
      {
        name: "medium",
        ttl: 60000,
        limit: 100, // 100 req/min
      },
    ]),
    PostsModule,
    AccountsModule,
    PersonasModule,
    AutomationsModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerBehindProxyGuard,
    },
  ],
})
export class AppModule {}

