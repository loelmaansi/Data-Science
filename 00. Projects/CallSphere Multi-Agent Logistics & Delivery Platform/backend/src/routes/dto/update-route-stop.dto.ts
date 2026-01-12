import { IsEnum, IsDateString, IsOptional } from 'class-validator';
import { RouteStopStatus } from '@prisma/client';

export class UpdateRouteStopDto {
  @IsEnum(RouteStopStatus)
  status: RouteStopStatus;

  @IsDateString()
  @IsOptional()
  actualArrival?: string;
}

