import { IsEnum, IsUUID, IsOptional, ValidateNested } from 'class-validator';
import { DashboardOwnerType, UserRole } from '@prisma/client';
import { Type } from 'class-transformer';

export class CreateDashboardConfigDto {
  @IsEnum(DashboardOwnerType)
  ownerType: DashboardOwnerType;

  @IsEnum(UserRole)
  @IsOptional()
  ownerRole?: UserRole;

  @ValidateNested()
  @Type(() => Object)
  layout: any;
}

