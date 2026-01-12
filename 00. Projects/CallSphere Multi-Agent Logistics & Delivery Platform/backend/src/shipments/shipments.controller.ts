import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { CreateScanDto } from './dto/create-scan.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.dispatcher, UserRole.manager)
  create(@Body() createShipmentDto: CreateShipmentDto) {
    return this.shipmentsService.create(createShipmentDto);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.shipmentsService.findAll(user?.id, user?.role);
  }

  @Get('track/:trackingNumber')
  findByTrackingNumber(
    @Param('trackingNumber') trackingNumber: string,
    @CurrentUser() user: any,
  ) {
    // Allow public tracking by tracking number (optional auth)
    return this.shipmentsService.findByTrackingNumber(
      trackingNumber,
      user?.id,
      user?.role || 'customer',
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.shipmentsService.findOne(id, user?.id, user?.role);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.dispatcher, UserRole.manager)
  update(
    @Param('id') id: string,
    @Body() updateShipmentDto: UpdateShipmentDto,
    @CurrentUser() user: any,
  ) {
    return this.shipmentsService.update(id, updateShipmentDto, user.role);
  }

  @Post(':id/scans')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.dispatcher, UserRole.driver, UserRole.manager)
  createScan(@Param('id') id: string, @Body() createScanDto: CreateScanDto) {
    return this.shipmentsService.createScan(id, createScanDto);
  }

  @Post(':id/calculate-sla-risk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.manager, UserRole.dispatcher)
  calculateSlaRisk(@Param('id') id: string) {
    return this.shipmentsService.calculateSlaRisk(id);
  }
}

