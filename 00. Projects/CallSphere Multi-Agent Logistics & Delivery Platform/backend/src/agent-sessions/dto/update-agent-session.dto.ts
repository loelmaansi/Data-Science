import { IsEnum, IsString, IsOptional, ValidateNested } from 'class-validator';
import { AgentSessionStatus } from '@prisma/client';
import { Type } from 'class-transformer';

export class UpdateAgentSessionDto {
  @IsEnum(AgentSessionStatus)
  @IsOptional()
  status?: AgentSessionStatus;

  @IsString()
  @IsOptional()
  lastAgentName?: string;

  @ValidateNested()
  @Type(() => Object)
  @IsOptional()
  transcript?: any;

  @ValidateNested()
  @Type(() => Object)
  @IsOptional()
  outcome?: any;
}

