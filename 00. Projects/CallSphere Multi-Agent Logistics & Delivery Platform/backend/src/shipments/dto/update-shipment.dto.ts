import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
} from 'class-validator';
import { ShipmentStatus, ServiceLevel } from '@prisma/client';

export class UpdateShipmentDto {
  @IsString()
  @IsOptional()
  toAddress?: string;

  @IsEnum(ShipmentStatus)
  @IsOptional()
  currentStatus?: ShipmentStatus;

  @IsEnum(ServiceLevel)
  @IsOptional()
  serviceLevel?: ServiceLevel;

  @IsDateString()
  @IsOptional()
  promisedDeliveryDate?: string;

  @IsBoolean()
  @IsOptional()
  isVip?: boolean;
}

