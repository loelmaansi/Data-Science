import { IsEnum, IsString, IsDateString, IsOptional } from 'class-validator';
import { ScanType } from '@prisma/client';

export class CreateScanDto {
  @IsEnum(ScanType)
  scanType: ScanType;

  @IsString()
  location: string;

  @IsDateString()
  @IsOptional()
  timestamp?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

