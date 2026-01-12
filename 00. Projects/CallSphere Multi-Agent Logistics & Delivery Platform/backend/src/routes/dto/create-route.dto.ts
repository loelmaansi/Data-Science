import {
  IsString,
  IsUUID,
  IsOptional,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class RouteStopDto {
  @IsUUID()
  shipmentId: string;

  @IsNumber()
  sequenceNumber: number;

  @IsDateString()
  plannedEta: string;
}

export class CreateRouteDto {
  @IsString()
  routeCode: string;

  @IsDateString()
  date: string;

  @IsUUID()
  driverId: string;

  @IsUUID()
  @IsOptional()
  vehicleId?: string;

  @IsString()
  region: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RouteStopDto)
  @IsOptional()
  stops?: RouteStopDto[];
}

