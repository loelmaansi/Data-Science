import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMetricDefinitionDto } from './dto/create-metric-definition.dto';
import { UpdateMetricDefinitionDto } from './dto/update-metric-definition.dto';
import { UserRole, MetricAggregationType } from '@prisma/client';

@Injectable()
export class MetricsService {
  constructor(private prisma: PrismaService) {}

  async getOverview() {
    // Calculate key metrics
    const totalShipments = await this.prisma.shipment.count();
    const deliveredShipmentsCount = await this.prisma.shipment.count({
      where: { currentStatus: 'delivered' },
    });
    // Calculate on-time deliveries (delivered before or on promised date)
    const allDelivered = await this.prisma.shipment.findMany({
      where: { currentStatus: 'delivered' },
    });
    const onTimeDeliveries = allDelivered.filter(
      (s) => s.lastScanAt && s.lastScanAt <= s.promisedDeliveryDate,
    ).length;

    const openIssues = await this.prisma.deliveryIssue.count({
      where: { status: { in: ['open', 'in_progress'] } },
    });

    const slaRiskShipments = await this.prisma.shipment.count({
      where: { slaRiskScore: { gte: 0.7 } },
    });

    // Calculate first attempt success (delivered without failed scans)
    const deliveredShipmentsList = await this.prisma.shipment.findMany({
      where: { currentStatus: 'delivered' },
      include: { scans: true },
    });
    const firstAttemptSuccess = deliveredShipmentsList.filter(
      (s) => {
        const hasDeliveredScan = s.scans.some((scan) => scan.scanType === 'delivered');
        const hasFailedScan = s.scans.some((scan) => scan.scanType === 'failed');
        return hasDeliveredScan && !hasFailedScan;
      },
    ).length;

    return {
      totalShipments,
      deliveredShipments: deliveredShipmentsCount,
      onTimeDeliveryRate: deliveredShipmentsCount > 0 ? (onTimeDeliveries / deliveredShipmentsCount) * 100 : 0,
      firstAttemptSuccessRate: deliveredShipmentsCount > 0 ? (firstAttemptSuccess / deliveredShipmentsCount) * 100 : 0,
      openIssues,
      slaRiskCount: slaRiskShipments,
    };
  }

  async getMetricDefinitions(userRole: UserRole) {
    const where: any = {};

    // Non-admin roles only see visible metrics
    if (userRole !== UserRole.admin) {
      where.isVisibleOnDashboard = true;
    }

    return this.prisma.metricDefinition.findMany({
      where,
      include: {
        snapshots: {
          orderBy: { computedAt: 'desc' },
          take: 10,
        },
      },
      orderBy: { key: 'asc' },
    });
  }

  async createMetricDefinition(dto: CreateMetricDefinitionDto, userRole: UserRole) {
    if (userRole !== UserRole.admin) {
      throw new ForbiddenException('Only admins can create metric definitions');
    }

    return this.prisma.metricDefinition.create({
      data: dto,
    });
  }

  async updateMetricDefinition(
    id: string,
    dto: UpdateMetricDefinitionDto,
    userRole: UserRole,
  ) {
    if (userRole !== UserRole.admin) {
      throw new ForbiddenException('Only admins can update metric definitions');
    }

    const definition = await this.prisma.metricDefinition.findUnique({
      where: { id },
    });

    if (!definition) {
      throw new NotFoundException(`Metric definition with ID ${id} not found`);
    }

    return this.prisma.metricDefinition.update({
      where: { id },
      data: dto,
    });
  }

  async computeMetricSnapshot(metricKey: string) {
    const definition = await this.prisma.metricDefinition.findUnique({
      where: { key: metricKey },
    });

    if (!definition) {
      throw new NotFoundException(`Metric definition with key ${metricKey} not found`);
    }

    let value = 0;
    const now = new Date();
    const dayStart = new Date(now.setHours(0, 0, 0, 0));
    const dayEnd = new Date(now.setHours(23, 59, 59, 999));

    // Simplified metric calculation - in production, this would be more sophisticated
    switch (definition.aggregationType) {
      case MetricAggregationType.ratio:
        // Calculate ratio based on metric key
        if (definition.key === 'on_time_delivery_rate') {
          const allDelivered = await this.prisma.shipment.findMany({
            where: {
              currentStatus: 'delivered',
              lastScanAt: {
                gte: dayStart,
                lte: dayEnd,
              },
            },
          });
          const delivered = allDelivered.length;
          const onTime = allDelivered.filter(
            (s) => s.lastScanAt && s.lastScanAt <= s.promisedDeliveryDate,
          ).length;
          value = delivered > 0 ? (onTime / delivered) * 100 : 0;
        }
        break;

      case MetricAggregationType.count:
        // Count based on metric key
        if (definition.key === 'open_issues_count') {
          value = await this.prisma.deliveryIssue.count({
            where: { status: { in: ['open', 'in_progress'] } },
          });
        }
        break;

      case MetricAggregationType.avg:
        // Average calculation would go here
        break;
    }

    const snapshot = await this.prisma.metricSnapshot.create({
      data: {
        metricId: definition.id,
        value,
        timeRangeStart: dayStart,
        timeRangeEnd: dayEnd,
        computedAt: new Date(),
      },
    });

    return snapshot;
  }
}

