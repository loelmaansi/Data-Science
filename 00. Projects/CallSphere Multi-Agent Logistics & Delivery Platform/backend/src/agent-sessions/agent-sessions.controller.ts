import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AgentSessionsService } from './agent-sessions.service';
import { CreateAgentSessionDto } from './dto/create-agent-session.dto';
import { UpdateAgentSessionDto } from './dto/update-agent-session.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('agent-sessions')
@UseGuards(JwtAuthGuard)
export class AgentSessionsController {
  constructor(private readonly agentSessionsService: AgentSessionsService) {}

  @Post()
  create(
    @Body() dto: CreateAgentSessionDto,
    @CurrentUser() user: any,
  ) {
    return this.agentSessionsService.create(dto, user?.id);
  }

  @Get()
  findAll(@CurrentUser() user: any) {
    return this.agentSessionsService.findAll(user?.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.agentSessionsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAgentSessionDto) {
    return this.agentSessionsService.update(id, dto);
  }
}

