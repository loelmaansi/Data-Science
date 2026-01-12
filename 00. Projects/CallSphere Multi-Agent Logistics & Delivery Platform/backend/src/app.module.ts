import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShipmentsModule } from './shipments/shipments.module';
import { RoutesModule } from './routes/routes.module';
import { DeliveryIssuesModule } from './delivery-issues/delivery-issues.module';
import { EscalationsModule } from './escalations/escalations.module';
import { MetricsModule } from './metrics/metrics.module';
import { DashboardConfigModule } from './dashboard-config/dashboard-config.module';
import { AgentSessionsModule } from './agent-sessions/agent-sessions.module';
import { WebsocketModule } from './websocket/websocket.module';
import { AiOrchestratorModule } from './ai-orchestrator/ai-orchestrator.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    ShipmentsModule,
    RoutesModule,
    DeliveryIssuesModule,
    EscalationsModule,
    MetricsModule,
    DashboardConfigModule,
    AgentSessionsModule,
    WebsocketModule,
    AiOrchestratorModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

