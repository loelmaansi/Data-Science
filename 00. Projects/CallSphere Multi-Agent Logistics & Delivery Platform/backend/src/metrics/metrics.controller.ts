import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { CreateMetricDefinitionDto } from './dto/create-metric-definition.dto';
import { UpdateMetricDefinitionDto } from './dto/update-metric-definition.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('metrics')
@UseGuards(JwtAuthGuard)
export class MetricsController {
  constructor(private readonly metricsService: MetricsService) {}

  @Get('overview')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.manager, UserRole.dispatcher)
  getOverview() {
    return this.metricsService.getOverview();
  }

  @Get('definitions')
  getMetricDefinitions(@CurrentUser() user: any) {
    return this.metricsService.getMetricDefinitions(user.role);
  }

  @Post('definitions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  createMetricDefinition(
    @Body() dto: CreateMetricDefinitionDto,
    @CurrentUser() user: any,
  ) {
    return this.metricsService.createMetricDefinition(dto, user.role);
  }

  @Patch('definitions/:id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin)
  updateMetricDefinition(
    @Param('id') id: string,
    @Body() dto: UpdateMetricDefinitionDto,
    @CurrentUser() user: any,
  ) {
    return this.metricsService.updateMetricDefinition(id, dto, user.role);
  }

  @Post('snapshots/:metricKey/compute')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.manager)
  computeMetricSnapshot(@Param('metricKey') metricKey: string) {
    return this.metricsService.computeMetricSnapshot(metricKey);
  }
}

