import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
} from 'class-validator';

export class UpdateMetricDefinitionDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  targetValue?: number;

  @IsNumber()
  @IsOptional()
  warningThreshold?: number;

  @IsNumber()
  @IsOptional()
  criticalThreshold?: number;

  @IsBoolean()
  @IsOptional()
  isVisibleOnDashboard?: boolean;
}

