import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { CreateScanDto } from './dto/create-scan.dto';
import { UserRole, ShipmentStatus } from '@prisma/client';

@Injectable()
export class ShipmentsService {
  constructor(private prisma: PrismaService) {}

  async create(createShipmentDto: CreateShipmentDto) {
    return this.prisma.shipment.create({
      data: createShipmentDto,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(userId?: string, userRole?: UserRole) {
    if (userRole === UserRole.customer && userId) {
      return this.prisma.shipment.findMany({
        where: { customerId: userId },
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
            take: 10,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    return this.prisma.shipment.findMany({
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
          take: 10,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByTrackingNumber(trackingNumber: string, userId?: string, userRole?: UserRole) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { trackingNumber },
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
        },
        issues: {
          where: {
            status: { in: ['open', 'in_progress'] },
          },
          orderBy: { createdAt: 'desc' },
        },
        routeStops: {
          include: {
            route: {
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
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with tracking number ${trackingNumber} not found`);
    }

    // RBAC: Customers can only view their own shipments
    if (userRole === UserRole.customer && shipment.customerId !== userId) {
      throw new ForbiddenException('You do not have permission to view this shipment');
    }

    return shipment;
  }

  async findOne(id: string, userId?: string, userRole?: UserRole) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id },
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
        },
        issues: {
          orderBy: { createdAt: 'desc' },
        },
        routeStops: {
          include: {
            route: {
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
              },
            },
          },
        },
      },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${id} not found`);
    }

    // RBAC: Customers can only view their own shipments
    if (userRole === UserRole.customer && shipment.customerId !== userId) {
      throw new ForbiddenException('You do not have permission to view this shipment');
    }

    return shipment;
  }

  async update(id: string, updateShipmentDto: UpdateShipmentDto, userRole: UserRole) {
    // Only dispatcher, manager, admin can update shipments
    const allowedRoles: UserRole[] = [UserRole.dispatcher, UserRole.manager, UserRole.admin];
    if (!allowedRoles.includes(userRole)) {
      throw new ForbiddenException('You do not have permission to update shipments');
    }

    return this.prisma.shipment.update({
      where: { id },
      data: updateShipmentDto,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
  }

  async createScan(shipmentId: string, createScanDto: CreateScanDto) {
    const scan = await this.prisma.shipmentScan.create({
      data: {
        ...createScanDto,
        shipmentId,
      },
    });

    // Update shipment's last scan info and potentially status
    const statusMap: Record<string, ShipmentStatus> = {
      picked_up: ShipmentStatus.in_transit,
      in_transit: ShipmentStatus.in_transit,
      out_for_delivery: ShipmentStatus.out_for_delivery,
      delivered: ShipmentStatus.delivered,
      failed: ShipmentStatus.failed,
      returned: ShipmentStatus.returned,
    };

    const newStatus = statusMap[createScanDto.scanType] || undefined;

    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        lastScanAt: createScanDto.timestamp || new Date(),
        lastScanLocation: createScanDto.location,
        ...(newStatus && { currentStatus: newStatus }),
      },
    });

    return scan;
  }

  async calculateSlaRisk(shipmentId: string) {
    const shipment = await this.prisma.shipment.findUnique({
      where: { id: shipmentId },
    });

    if (!shipment) {
      throw new NotFoundException(`Shipment with ID ${shipmentId} not found`);
    }

    const now = new Date();
    const daysUntilDelivery = Math.max(
      0,
      Math.ceil((shipment.promisedDeliveryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
    );

    let riskScore = 0;

    // Risk increases as delivery date approaches
    if (daysUntilDelivery <= 0) {
      riskScore = 1.0; // Past due
    } else if (daysUntilDelivery <= 1) {
      riskScore = 0.8; // High risk
    } else if (daysUntilDelivery <= 2) {
      riskScore = 0.5; // Medium risk
    } else if (daysUntilDelivery <= 3) {
      riskScore = 0.3; // Low risk
    }

    // VIP shipments have higher risk weight
    if (shipment.isVip) {
      riskScore = Math.min(1.0, riskScore * 1.2);
    }

    // If shipment hasn't been scanned recently, increase risk
    if (shipment.lastScanAt) {
      const hoursSinceLastScan = (now.getTime() - shipment.lastScanAt.getTime()) / (1000 * 60 * 60);
      if (hoursSinceLastScan > 24) {
        riskScore = Math.min(1.0, riskScore + 0.2);
      }
    }

    await this.prisma.shipment.update({
      where: { id: shipmentId },
      data: { slaRiskScore: riskScore },
    });

    return { slaRiskScore: riskScore };
  }
}

