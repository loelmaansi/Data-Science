import { IsString, IsOptional } from 'class-validator';

export class AcknowledgeEscalationDto {
  @IsString()
  method: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

