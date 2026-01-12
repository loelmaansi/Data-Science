import { IsEnum, IsString, IsUUID, IsOptional } from 'class-validator';
import { AgentChannel } from '@prisma/client';

export class CreateAgentSessionDto {
  @IsEnum(AgentChannel)
  channel: AgentChannel;

  @IsString()
  openAiSessionId: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsUUID()
  @IsOptional()
  linkedShipmentId?: string;
}

