import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateIssueDto } from './dto/create-issue.dto';
import { UpdateIssueDto } from './dto/update-issue.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class DeliveryIssuesService {
  constructor(private prisma: PrismaService) {}

  async create(createIssueDto: CreateIssueDto, reportedByUserId: string) {
    // Calculate AI severity score (simplified - in real app, this would use OpenAI)
    const aiSeverityScore = this.calculateSeverityScore(createIssueDto);

    const issue = await this.prisma.deliveryIssue.create({
      data: {
        ...createIssueDto,
        reportedByUserId,
        aiSeverityScore,
      },
      include: {
        shipment: {
          select: {
            id: true,
            trackingNumber: true,
            currentStatus: true,
            isVip: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return issue;
  }

  async findAll(
    userId?: string,
    userRole?: UserRole,
    filters?: {
      status?: string;
      severity?: string;
      type?: string;
      region?: string;
    },
  ) {
    const where: any = {};

    // RBAC: Customers can only see their own issues
    if (userRole === UserRole.customer) {
      where.reportedByUserId = userId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.type) {
      where.issueType = filters.type;
    }

    if (filters?.severity) {
      const threshold = filters.severity === 'high' ? 0.7 : filters.severity === 'medium' ? 0.4 : 0;
      where.aiSeverityScore = { gte: threshold };
    }

    // If region filter, need to join with shipment routes
    if (filters?.region && userRole !== UserRole.customer) {
      where.shipment = {
        routeStops: {
          some: {
            route: {
              region: filters.region,
            },
          },
        },
      };
    }

    return this.prisma.deliveryIssue.findMany({
      where,
      include: {
        shipment: {
          select: {
            id: true,
            trackingNumber: true,
            currentStatus: true,
            isVip: true,
            slaRiskScore: true,
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { aiSeverityScore: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const issue = await this.prisma.deliveryIssue.findUnique({
      where: { id },
      include: {
        shipment: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        escalationLogs: {
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
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!issue) {
      throw new NotFoundException(`Issue with ID ${id} not found`);
    }

    // RBAC: Customers can only view their own issues
    if (userRole === UserRole.customer && issue.reportedByUserId !== userId) {
      throw new ForbiddenException('You do not have permission to view this issue');
    }

    return issue;
  }

  async update(id: string, updateIssueDto: UpdateIssueDto, userRole: UserRole) {
    // Only dispatcher, manager, admin can update issues
    const allowedRoles: UserRole[] = [UserRole.dispatcher, UserRole.manager, UserRole.admin];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission to update issues');
    }

    return this.prisma.deliveryIssue.update({
      where: { id },
      data: updateIssueDto,
      include: {
        shipment: true,
        reportedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  private calculateSeverityScore(dto: CreateIssueDto): number {
    // Simplified severity calculation
    // In production, this would use OpenAI to analyze the description
    const baseScores: Record<string, number> = {
      damaged: 0.8,
      missing: 0.9,
      wrong_address: 0.5,
      missed_delivery: 0.6,
      delay: 0.4,
      other: 0.5,
    };

    return baseScores[dto.issueType] || 0.5;
  }
}

