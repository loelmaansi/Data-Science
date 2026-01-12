import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { UpdateRouteStopDto } from './dto/update-route-stop.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class RoutesService {
  constructor(private prisma: PrismaService) {}

  async create(createRouteDto: CreateRouteDto) {
    return this.prisma.route.create({
      data: {
        ...createRouteDto,
        date: new Date(createRouteDto.date),
        stops: {
          create: createRouteDto.stops?.map((stop) => ({
            shipmentId: stop.shipmentId,
            sequenceNumber: stop.sequenceNumber,
            plannedEta: new Date(stop.plannedEta),
          })) || [],
        },
      },
      include: {
        driver: {
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
        vehicle: true,
        stops: {
          include: {
            shipment: {
              select: {
                id: true,
                trackingNumber: true,
                toAddress: true,
                currentStatus: true,
              },
            },
          },
          orderBy: { sequenceNumber: 'asc' },
        },
      },
    });
  }

  async findAll(userId?: string, userRole?: UserRole, region?: string) {
    const where: any = {};

    if (userRole === UserRole.driver) {
      where.driver = { userId };
    } else if (userRole === UserRole.dispatcher && region) {
      where.region = region;
    }

    return this.prisma.route.findMany({
      where,
      include: {
        driver: {
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
        vehicle: true,
        stops: {
          include: {
            shipment: {
              select: {
                id: true,
                trackingNumber: true,
                toAddress: true,
                currentStatus: true,
              },
            },
          },
          orderBy: { sequenceNumber: 'asc' },
        },
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const route = await this.prisma.route.findUnique({
      where: { id },
      include: {
        driver: {
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
        vehicle: true,
        stops: {
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
                scans: {
                  orderBy: { timestamp: 'desc' },
                  take: 5,
                },
              },
            },
          },
          orderBy: { sequenceNumber: 'asc' },
        },
      },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${id} not found`);
    }

    // RBAC: Drivers can only view their own routes
    if (userRole === UserRole.driver && route.driver.userId !== userId) {
      throw new ForbiddenException('You do not have permission to view this route');
    }

    return route;
  }

  async updateStopStatus(
    routeId: string,
    stopId: string,
    updateDto: UpdateRouteStopDto,
    userId?: string,
    userRole?: UserRole,
  ) {
    // Only drivers can update their own route stops
    if (userRole !== UserRole.driver) {
      throw new ForbiddenException('Only drivers can update route stop status');
    }

    const route = await this.prisma.route.findUnique({
      where: { id: routeId },
      include: { driver: true },
    });

    if (!route) {
      throw new NotFoundException(`Route with ID ${routeId} not found`);
    }

    if (route.driver.userId !== userId) {
      throw new ForbiddenException('You can only update stops on your assigned routes');
    }

    return this.prisma.routeStop.update({
      where: { id: stopId },
      data: {
        ...updateDto,
        actualArrival: updateDto.status === 'completed' || updateDto.status === 'failed'
          ? new Date()
          : undefined,
      },
      include: {
        shipment: true,
      },
    });
  }
}

