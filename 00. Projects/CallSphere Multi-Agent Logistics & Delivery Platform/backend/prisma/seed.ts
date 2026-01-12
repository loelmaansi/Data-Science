import { PrismaClient, UserRole, ShipmentStatus, ServiceLevel, ScanType, IssueType, IssueStatus, EscalationContactType, MetricAggregationType, DashboardOwnerType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users with different roles
  const admin = await prisma.user.upsert({
    where: { email: 'admin@callsphere.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@callsphere.com',
      passwordHash: await bcrypt.hash('admin123', 10),
      role: UserRole.admin,
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@callsphere.com' },
    update: {},
    create: {
      name: 'Manager User',
      email: 'manager@callsphere.com',
      passwordHash: await bcrypt.hash('manager123', 10),
      role: UserRole.manager,
    },
  });

  const dispatcher = await prisma.user.upsert({
    where: { email: 'dispatcher@callsphere.com' },
    update: {},
    create: {
      name: 'Dispatcher User',
      email: 'dispatcher@callsphere.com',
      passwordHash: await bcrypt.hash('dispatcher123', 10),
      role: UserRole.dispatcher,
    },
  });

  const driver = await prisma.user.upsert({
    where: { email: 'driver@callsphere.com' },
    update: {},
    create: {
      name: 'Driver User',
      email: 'driver@callsphere.com',
      passwordHash: await bcrypt.hash('driver123', 10),
      role: UserRole.driver,
    },
  });

  const customers = [];
  for (let i = 1; i <= 10; i++) {
    const customer = await prisma.user.upsert({
      where: { email: `customer${i}@example.com` },
      update: {},
      create: {
        name: `Customer ${i}`,
        email: `customer${i}@example.com`,
        passwordHash: await bcrypt.hash('customer123', 10),
        role: UserRole.customer,
      },
    });
    customers.push(customer);
  }

  console.log('Created users...');

  // Create vehicles
  const vehicles = [];
  for (let i = 1; i <= 5; i++) {
    const vehicle = await prisma.vehicle.create({
      data: {
        vehicleCode: `VH${String(i).padStart(3, '0')}`,
        capacityVolume: 1000 + i * 100,
        capacityWeight: 500 + i * 50,
        homeBase: `Warehouse ${i}`,
      },
    });
    vehicles.push(vehicle);
  }

  // Create driver records
  const driverRecord = await prisma.driver.create({
    data: {
      driverCode: 'DRV001',
      userId: driver.id,
      assignedVehicleId: vehicles[0].id,
      homeBase: 'Warehouse 1',
    },
  });

  console.log('Created vehicles and drivers...');

  // Create shipments (30-50 as required)
  const shipments = [];
  const statuses: ShipmentStatus[] = [
    ShipmentStatus.pending,
    ShipmentStatus.in_transit,
    ShipmentStatus.out_for_delivery,
    ShipmentStatus.delivered,
    ShipmentStatus.failed,
  ];

  for (let i = 1; i <= 45; i++) {
    const customer = customers[i % customers.length];
    const promisedDate = new Date();
    promisedDate.setDate(promisedDate.getDate() + Math.floor(Math.random() * 7) + 1);
    
    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber: `CS${String(i).padStart(6, '0')}`,
        orderId: `ORD${String(i).padStart(6, '0')}`,
        customerId: customer.id,
        fromAddress: `123 Sender St, City ${i % 5 + 1}, Country`,
        toAddress: `456 Receiver Ave, City ${i % 10 + 1}, Country`,
        currentStatus: statuses[i % statuses.length],
        serviceLevel: i % 4 === 0 ? ServiceLevel.express : ServiceLevel.standard,
        promisedDeliveryDate: promisedDate,
        isVip: i % 10 === 0,
        slaRiskScore: Math.random() * 0.8,
      },
    });
    shipments.push(shipment);

    // Create scans for each shipment
    const scanTypes: ScanType[] = [
      ScanType.picked_up,
      ScanType.in_transit,
      ScanType.out_for_delivery,
    ];

    if (shipment.currentStatus === ShipmentStatus.delivered) {
      scanTypes.push(ScanType.delivered);
    } else if (shipment.currentStatus === ShipmentStatus.failed) {
      scanTypes.push(ScanType.failed);
    }

    for (let j = 0; j < scanTypes.length; j++) {
      const scanDate = new Date();
      scanDate.setHours(scanDate.getHours() - (scanTypes.length - j) * 4);
      
      await prisma.shipmentScan.create({
        data: {
          shipmentId: shipment.id,
          scanType: scanTypes[j],
          location: `Location ${j + 1}`,
          timestamp: scanDate,
          notes: `Scan ${j + 1} notes`,
        },
      });

      if (j === scanTypes.length - 1) {
        await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            lastScanAt: scanDate,
            lastScanLocation: `Location ${j + 1}`,
          },
        });
      }
    }
  }

  console.log('Created shipments and scans...');

  // Create routes
  const routes = [];
  for (let i = 1; i <= 10; i++) {
    const routeDate = new Date();
    routeDate.setDate(routeDate.getDate() + i);
    
    const route = await prisma.route.create({
      data: {
        routeCode: `RT${String(i).padStart(4, '0')}`,
        date: routeDate,
        driverId: driverRecord.id,
        vehicleId: vehicles[i % vehicles.length].id,
        region: `Region ${(i % 5) + 1}`,
      },
    });

    // Add stops to route (3-5 stops per route)
    const numStops = Math.floor(Math.random() * 3) + 3;
    const routeShipments = shipments.slice((i - 1) * 4, (i - 1) * 4 + numStops);
    
    for (let j = 0; j < routeShipments.length; j++) {
      const stopEta = new Date(routeDate);
      stopEta.setHours(9 + j * 2);
      
      await prisma.routeStop.create({
        data: {
          routeId: route.id,
          shipmentId: routeShipments[j].id,
          sequenceNumber: j + 1,
          plannedEta: stopEta,
          status: j < 2 ? 'completed' : 'pending',
        },
      });
    }

    routes.push(route);
  }

  console.log('Created routes and stops...');

  // Create delivery issues
  const issueTypes: IssueType[] = [
    IssueType.damaged,
    IssueType.missing,
    IssueType.wrong_address,
    IssueType.missed_delivery,
    IssueType.delay,
  ];

  for (let i = 0; i < 8; i++) {
    const shipment = shipments[i * 5];
    const customer = customers[i % customers.length];
    
    await prisma.deliveryIssue.create({
      data: {
        shipmentId: shipment.id,
        reportedByUserId: customer.id,
        issueType: issueTypes[i % issueTypes.length],
        description: `Issue description ${i + 1}: Sample issue details`,
        aiSeverityScore: 0.3 + (i % 3) * 0.3,
        status: i % 3 === 0 ? IssueStatus.open : IssueStatus.in_progress,
      },
    });
  }

  console.log('Created delivery issues...');

  // Create escalation contacts
  await prisma.escalationContact.create({
    data: {
      userId: dispatcher.id,
      position: '1',
      contactType: EscalationContactType.email,
      timeoutSeconds: 300,
      isActive: true,
    },
  });

  await prisma.escalationContact.create({
    data: {
      userId: manager.id,
      position: '2',
      contactType: EscalationContactType.phone,
      timeoutSeconds: 600,
      isActive: true,
    },
  });

  await prisma.escalationContact.create({
    data: {
      userId: admin.id,
      position: '3',
      contactType: EscalationContactType.push,
      timeoutSeconds: 900,
      isActive: true,
    },
  });

  console.log('Created escalation contacts...');

  // Create metric definitions
  await prisma.metricDefinition.create({
    data: {
      key: 'on_time_delivery_rate',
      name: 'On-Time Delivery Rate',
      description: 'Percentage of shipments delivered on or before promised date',
      aggregationType: MetricAggregationType.ratio,
      dimension: 'global',
      targetValue: 95,
      warningThreshold: 90,
      criticalThreshold: 85,
      ownerRole: UserRole.admin,
      isVisibleOnDashboard: true,
    },
  });

  await prisma.metricDefinition.create({
    data: {
      key: 'first_attempt_success',
      name: 'First Attempt Success Rate',
      description: 'Percentage of deliveries successful on first attempt',
      aggregationType: MetricAggregationType.ratio,
      dimension: 'global',
      targetValue: 92,
      warningThreshold: 87,
      criticalThreshold: 82,
      ownerRole: UserRole.admin,
      isVisibleOnDashboard: true,
    },
  });

  await prisma.metricDefinition.create({
    data: {
      key: 'open_issues_count',
      name: 'Open Issues Count',
      description: 'Total number of open and in-progress issues',
      aggregationType: MetricAggregationType.count,
      dimension: 'global',
      targetValue: 0,
      warningThreshold: 5,
      criticalThreshold: 10,
      ownerRole: UserRole.admin,
      isVisibleOnDashboard: true,
    },
  });

  await prisma.metricDefinition.create({
    data: {
      key: 'sla_risk_count',
      name: 'SLA Risk Count',
      description: 'Number of shipments with high SLA risk score',
      aggregationType: MetricAggregationType.count,
      dimension: 'global',
      targetValue: 0,
      warningThreshold: 3,
      criticalThreshold: 5,
      ownerRole: UserRole.admin,
      isVisibleOnDashboard: true,
    },
  });

  console.log('Created metric definitions...');

  // Create default dashboard configs
  for (const role of [UserRole.customer, UserRole.driver, UserRole.dispatcher, UserRole.manager, UserRole.admin]) {
    await prisma.dashboardConfig.create({
      data: {
        ownerType: DashboardOwnerType.role,
        ownerRole: role,
        layout: {
          widgets: [],
          columns: 3,
        },
      },
    });
  }

  console.log('Created dashboard configs...');
  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

