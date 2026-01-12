import {
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { ServiceLevel } from '@prisma/client';

export class CreateShipmentDto {
  @IsString()
  trackingNumber: string;

  @IsString()
  @IsOptional()
  orderId?: string;

  @IsUUID()
  customerId: string;

  @IsString()
  fromAddress: string;

  @IsString()
  toAddress: string;

  @IsEnum(ServiceLevel)
  @IsOptional()
  serviceLevel?: ServiceLevel = ServiceLevel.standard;

  @IsDateString()
  promisedDeliveryDate: string;

  @IsBoolean()
  @IsOptional()
  isVip?: boolean = false;
}

