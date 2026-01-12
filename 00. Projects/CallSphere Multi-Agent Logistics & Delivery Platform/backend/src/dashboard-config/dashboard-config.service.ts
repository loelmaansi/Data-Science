import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDashboardConfigDto } from './dto/create-dashboard-config.dto';
import { UpdateDashboardConfigDto } from './dto/update-dashboard-config.dto';
import { DashboardOwnerType, UserRole } from '@prisma/client';

@Injectable()
export class DashboardConfigService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateDashboardConfigDto, userId?: string) {
    return this.prisma.dashboardConfig.create({
      data: {
        ...dto,
        ownerUserId: dto.ownerType === DashboardOwnerType.user ? userId : null,
      },
    });
  }

  async findForUser(userId: string, userRole: UserRole) {
    // Try user-specific config first
    let config = await this.prisma.dashboardConfig.findFirst({
      where: {
        ownerType: DashboardOwnerType.user,
        ownerUserId: userId,
      },
    });

    // Fallback to role-based config
    if (!config) {
      config = await this.prisma.dashboardConfig.findFirst({
        where: {
          ownerType: DashboardOwnerType.role,
          ownerRole: userRole,
        },
      });
    }

    // Default config if none found
    if (!config) {
      config = await this.prisma.dashboardConfig.findFirst({
        where: {
          ownerType: DashboardOwnerType.role,
          ownerRole: UserRole.customer,
        },
      });
    }

    return config || {
      layout: { widgets: [] },
      ownerType: DashboardOwnerType.role,
      ownerRole: userRole,
    };
  }

  async update(id: string, dto: UpdateDashboardConfigDto) {
    const config = await this.prisma.dashboardConfig.findUnique({
      where: { id },
    });

    if (!config) {
      throw new NotFoundException(`Dashboard config with ID ${id} not found`);
    }

    return this.prisma.dashboardConfig.update({
      where: { id },
      data: dto,
    });
  }
}

