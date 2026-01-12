import { IsUUID, IsString, IsOptional } from 'class-validator';

export class TriggerEscalationDto {
  @IsUUID()
  shipmentId: string;

  @IsUUID()
  @IsOptional()
  deliveryIssueId?: string;

  @IsString()
  reason: string;
}

