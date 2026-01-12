import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DeliveryIssuesService } from './delivery-issues.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('delivery-issues')
@UseGuards(JwtAuthGuard)
export class DeliveryIssuesController {
  constructor(private readonly deliveryIssuesService: DeliveryIssuesService) {}

  @Post()
  create(@Body() createIssueDto: CreateIssueDto, @CurrentUser() user: any) {
    return this.deliveryIssuesService.create(createIssueDto, user.id);
  }

  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('severity') severity?: string,
    @Query('type') type?: string,
    @Query('region') region?: string,
  ) {
    return this.deliveryIssuesService.findAll(user?.id, user?.role, {
      status,
      severity,
      type,
      region,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.deliveryIssuesService.findOne(id, user?.id, user?.role);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.dispatcher, UserRole.manager)
  update(
    @Param('id') id: string,
    @Body() updateIssueDto: UpdateIssueDto,
    @CurrentUser() user: any,
  ) {
    return this.deliveryIssuesService.update(id, updateIssueDto, user.role);
  }
}

