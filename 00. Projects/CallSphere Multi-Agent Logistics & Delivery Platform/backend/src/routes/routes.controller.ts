import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteStopDto } from './dto/update-route-stop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('routes')
@UseGuards(JwtAuthGuard)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.dispatcher, UserRole.manager)
  create(@Body() createRouteDto: CreateRouteDto) {
    return this.routesService.create(createRouteDto);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('region') region?: string,
  ) {
    return this.routesService.findAll(user?.id, user?.role, region);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.routesService.findOne(id, user?.id, user?.role);
  }

  @Patch(':routeId/stops/:stopId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.driver)
  updateStopStatus(
    @Param('routeId') routeId: string,
    @Param('stopId') stopId: string,
    @Body() updateDto: UpdateRouteStopDto,
    @CurrentUser() user: any,
  ) {
    return this.routesService.updateStopStatus(
      routeId,
      stopId,
      updateDto,
      user?.id,
      user?.role,
    );
  }
}

