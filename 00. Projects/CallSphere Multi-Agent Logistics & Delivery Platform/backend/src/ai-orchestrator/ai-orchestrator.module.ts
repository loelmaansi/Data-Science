import { Module } from '@nestjs/common';
import { AiOrchestratorService } from './ai-orchestrator.service';
import { AiOrchestratorController } from './ai-orchestrator.controller';
import { ShipmentsModule } from '../shipments/shipments.module';
import { DeliveryIssuesModule } from '../delivery-issues/delivery-issues.module';
import { EscalationsModule } from '../escalations/escalations.module';
import { AgentSessionsModule } from '../agent-sessions/agent-sessions.module';

@Module({
  imports: [
    ShipmentsModule,
    DeliveryIssuesModule,
    EscalationsModule,
    AgentSessionsModule,
  ],
  controllers: [AiOrchestratorController],
  providers: [AiOrchestratorService],
  exports: [AiOrchestratorService],
})
export class AiOrchestratorModule {}

