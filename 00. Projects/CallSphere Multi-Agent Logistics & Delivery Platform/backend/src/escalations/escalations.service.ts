import { Injectable, NotFoundException, ForbiddenException, Inject, forwardRef } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerEscalationDto } from './dto/trigger-escalation.dto';
import { AcknowledgeEscalationDto } from './dto/acknowledge-escalation.dto';
import { UserRole, EscalationEventType } from '@prisma/client';
import { WebsocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class EscalationsService {
  constructor(
    private prisma: PrismaService,
    @Inject(forwardRef(() => WebsocketGateway))
    private websocketGateway: WebsocketGateway,
  ) {}

  async triggerEscalation(dto: TriggerEscalationDto, triggeredByUserId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: dto.shipmentId },
      include: {
        issues: {
          where: { status: { in: ['open', 'in_progress'] } },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${dto.shipmentId} not found`);
    }

    // Get escalation contacts ordered by position (lower number = higher priority)
    const contacts = await this.prisma.escalationContact.findMany({
      where: { isActive: true },
      include: {
        user: true,
      },
      orderBy: { position: 'asc' },
    });

    if (contacts.length === 0) {
      throw new NotFoundException('No active escalation contacts found');
    }

    // Create first escalation log
    const escalationLog = await this.prisma.escalationLog.create({
      data: {
        shipmentId: dto.shipmentId,
        deliveryIssueId: dto.deliveryIssueId || null,
        contactId: contacts[0].id,
        attemptNumber: 1,
        eventType: EscalationEventType.triggered,
        payload: {
          reason: dto.reason,
          triggeredBy: triggeredByUserId,
        },
      },
      include: {
        contact: {
          include: {
            user: true,
          },
        },
        shipment: true,
      },
    });

    // Emit WebSocket event
    this.websocketGateway.emitEscalationTriggered(escalationLog);

    return escalationLog;
  }

  async advanceEscalation(shipmentId: string, userRole: UserRole) {
    const allowedRoles: UserRole[] = [UserRole.manager, UserRole.admin];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Only managers and admins can advance escalations');
    }

    // Get the latest escalation log for this shipment
    const latestLog = await this.prisma.escalationLog.findFirst({
      where: {
        shipmentId,
        ackReceived: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        contact: true,
      },
    });

    if (!latestLog) {
      throw new NotFoundException('No active escalation found for this shipment');
    }

    // Get next contact in escalation ladder
    const contacts = await this.prisma.escalationContact.findMany({
      where: {
        isActive: true,
        position: { gt: latestLog.contact.position },
      },
      orderBy: { position: 'asc' },
    });

    if (contacts.length === 0) {
      throw new NotFoundException('No higher level escalation contact available');
    }

    const nextContact = contacts[0];

    // Create advanced escalation log
    const escalationLog = await this.prisma.escalationLog.create({
      data: {
        shipmentId,
        deliveryIssueId: latestLog.deliveryIssueId,
        contactId: nextContact.id,
        attemptNumber: latestLog.attemptNumber + 1,
        eventType: EscalationEventType.advanced,
        payload: {
          previousContact: latestLog.contact.id,
          reason: 'Timeout or manual advancement',
        },
      },
      include: {
        contact: {
          include: {
            user: true,
          },
        },
        shipment: true,
      },
    });

    // Emit WebSocket event
    this.websocketGateway.emitEscalationAdvanced(escalationLog);

    return escalationLog;
  }

  async acknowledgeEscalation(
    shipmentId: string,
    dto: AcknowledgeEscalationDto,
    userId: string,
    userRole: UserRole,
  ) {
    const allowedRoles: UserRole[] = [UserRole.manager, UserRole.admin];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('Only managers and admins can acknowledge escalations');
    }

    // Find the active escalation log
    const escalationLog = await this.prisma.escalationLog.findFirst({
      where: {
        shipmentId,
        ackReceived: false,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        contact: true,
      },
    });

    if (!escalationLog) {
      throw new NotFoundException('No active escalation found for this shipment');
    }

    // Verify the user is the contact for this escalation
    if (escalationLog.contact.userId !== userId) {
      throw new ForbiddenException('You are not authorized to acknowledge this escalation');
    }

    // Update escalation log
    const updatedLog = await this.prisma.escalationLog.update({
      where: { id: escalationLog.id },
      data: {
        ackReceived: true,
        ackMethod: dto.method,
        acknowledgedAt: new Date(),
      },
      include: {
        contact: {
          include: {
            user: true,
          },
        },
        shipment: true,
      },
    });

    // Create acknowledgment record
    await this.prisma.acknowledgment.create({
      data: {
        shipmentId,
        deliveryIssueId: escalationLog.deliveryIssueId,
        userId,
        method: dto.method,
        notes: dto.notes,
      },
    });

    // Emit WebSocket event
    this.websocketGateway.emitEscalationAcknowledged(updatedLog);

    return updatedLog;
  }

  async getEscalationHistory(shipmentId: string) {
    return this.prisma.escalationLog.findMany({
      where: { shipmentId },
      include: {
        contact: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        deliveryIssue: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}

