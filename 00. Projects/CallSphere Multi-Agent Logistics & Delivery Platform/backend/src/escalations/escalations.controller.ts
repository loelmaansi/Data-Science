import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { EscalationsService } from './escalations.service';
import { TriggerEscalationDto } from './dto/trigger-escalation.dto';
import { AcknowledgeEscalationDto } from './dto/acknowledge-escalation.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole } from '@prisma/client';

@Controller('escalations')
@UseGuards(JwtAuthGuard)
export class EscalationsController {
  constructor(private readonly escalationsService: EscalationsService) {}

  @Post('trigger')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.dispatcher, UserRole.manager)
  triggerEscalation(
    @Body() dto: TriggerEscalationDto,
    @CurrentUser() user: any,
  ) {
    return this.escalationsService.triggerEscalation(dto, user.id);
  }

  @Post(':shipmentId/advance')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.manager)
  advanceEscalation(
    @Param('shipmentId') shipmentId: string,
    @CurrentUser() user: any,
  ) {
    return this.escalationsService.advanceEscalation(shipmentId, user.role);
  }

  @Post(':shipmentId/acknowledge')
  @UseGuards(RolesGuard)
  @Roles(UserRole.admin, UserRole.manager)
  acknowledgeEscalation(
    @Param('shipmentId') shipmentId: string,
    @Body() dto: AcknowledgeEscalationDto,
    @CurrentUser() user: any,
  ) {
    return this.escalationsService.acknowledgeEscalation(
      shipmentId,
      dto,
      user.id,
      user.role,
    );
  }

  @Get(':shipmentId/history')
  getEscalationHistory(@Param('shipmentId') shipmentId: string) {
    return this.escalationsService.getEscalationHistory(shipmentId);
  }
}

