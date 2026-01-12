import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { DashboardConfigService } from './dashboard-config.service';
import { CreateDashboardConfigDto } from './dto/create-dashboard-config.dto';
import { UpdateDashboardConfigDto } from './dto/update-dashboard-config.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('dashboard-config')
@UseGuards(JwtAuthGuard)
export class DashboardConfigController {
  constructor(private readonly dashboardConfigService: DashboardConfigService) {}

  @Get('my-config')
  getMyConfig(@CurrentUser() user: any) {
    return this.dashboardConfigService.findForUser(user.id, user.role);
  }

  @Post()
  create(
    @Body() dto: CreateDashboardConfigDto,
    @CurrentUser() user: any,
  ) {
    return this.dashboardConfigService.create(dto, user.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDashboardConfigDto,
  ) {
    return this.dashboardConfigService.update(id, dto);
  }
}

