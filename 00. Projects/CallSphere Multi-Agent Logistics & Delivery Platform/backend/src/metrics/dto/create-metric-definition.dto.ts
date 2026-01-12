import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';
import { MetricAggregationType, UserRole } from '@prisma/client';

export class CreateMetricDefinitionDto {
  @IsString()
  key: string;

  @IsString()
  name: string;

  @IsString()
  description: string;

  @IsEnum(MetricAggregationType)
  aggregationType: MetricAggregationType;

  @IsString()
  dimension: string;

  @IsNumber()
  targetValue: number;

  @IsNumber()
  @IsOptional()
  warningThreshold?: number;

  @IsNumber()
  @IsOptional()
  criticalThreshold?: number;

  @IsEnum(UserRole)
  @IsOptional()
  ownerRole?: UserRole = UserRole.admin;

  @IsBoolean()
  @IsOptional()
  isVisibleOnDashboard?: boolean = true;
}

