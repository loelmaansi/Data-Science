import { ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateDashboardConfigDto {
  @ValidateNested()
  @Type(() => Object)
  @IsOptional()
  layout?: any;
}

