import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAgentSessionDto } from './dto/create-agent-session.dto';
import { UpdateAgentSessionDto } from './dto/update-agent-session.dto';
import { AgentChannel, AgentSessionStatus } from '@prisma/client';

@Injectable()
export class AgentSessionsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateAgentSessionDto, userId?: string) {
    return this.prisma.agentSession.create({
      data: {
        ...dto,
        userId: userId || null,
        role: dto.role || 'customer_guest',
      },
    });
  }

  async findAll(userId?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    return this.prisma.agentSession.findMany({
      where,
      include: {
        shipment: {
          select: {
            id: true,
            trackingNumber: true,
          },
        },
        deliveryIssue: {
          select: {
            id: true,
            issueType: true,
            status: true,
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.agentSession.findUnique({
      where: { id },
      include: {
        shipment: true,
        deliveryIssue: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findByOpenAiSessionId(openAiSessionId: string) {
    return this.prisma.agentSession.findFirst({
      where: { openAiSessionId },
      include: {
        shipment: true,
        deliveryIssue: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async update(id: string, dto: UpdateAgentSessionDto) {
    return this.prisma.agentSession.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.status === AgentSessionStatus.completed && { endedAt: new Date() }),
      },
    });
  }

  async updateTranscript(idOrSessionId: string, transcript: any) {
    // Try to find by ID first, then by openAiSessionId
    let session = await this.prisma.agentSession.findUnique({
      where: { id: idOrSessionId },
    });

    if (!session) {
      session = await this.prisma.agentSession.findFirst({
        where: { openAiSessionId: idOrSessionId },
      });
    }

    if (!session) {
      throw new Error(`Session not found: ${idOrSessionId}`);
    }

    return this.prisma.agentSession.update({
      where: { id: session.id },
      data: { transcript },
    });
  }

  async updateOutcome(id: string, outcome: any) {
    return this.prisma.agentSession.update({
      where: { id },
      data: { outcome },
    });
  }
}

