-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('customer', 'driver', 'dispatcher', 'manager', 'admin');

-- CreateEnum
CREATE TYPE "ShipmentStatus" AS ENUM ('pending', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned');

-- CreateEnum
CREATE TYPE "ServiceLevel" AS ENUM ('standard', 'express', 'overnight', 'same_day');

-- CreateEnum
CREATE TYPE "ScanType" AS ENUM ('picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'returned');

-- CreateEnum
CREATE TYPE "RouteStopStatus" AS ENUM ('pending', 'in_progress', 'completed', 'failed', 'skipped');

-- CreateEnum
CREATE TYPE "IssueType" AS ENUM ('damaged', 'missing', 'wrong_address', 'missed_delivery', 'delay', 'other');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- CreateEnum
CREATE TYPE "EscalationEventType" AS ENUM ('triggered', 'advanced', 'acknowledged');

-- CreateEnum
CREATE TYPE "EscalationContactType" AS ENUM ('email', 'sms', 'phone', 'push');

-- CreateEnum
CREATE TYPE "AgentChannel" AS ENUM ('chat', 'voice');

-- CreateEnum
CREATE TYPE "AgentSessionStatus" AS ENUM ('active', 'completed', 'error');

-- CreateEnum
CREATE TYPE "MetricAggregationType" AS ENUM ('ratio', 'count', 'avg');

-- CreateEnum
CREATE TYPE "MetricDimension" AS ENUM ('global', 'region', 'route', 'driver');

-- CreateEnum
CREATE TYPE "DashboardOwnerType" AS ENUM ('role', 'user');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'customer',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL,
    "trackingNumber" TEXT NOT NULL,
    "orderId" TEXT,
    "customerId" TEXT NOT NULL,
    "fromAddress" TEXT NOT NULL,
    "toAddress" TEXT NOT NULL,
    "currentStatus" "ShipmentStatus" NOT NULL DEFAULT 'pending',
    "serviceLevel" "ServiceLevel" NOT NULL DEFAULT 'standard',
    "promisedDeliveryDate" TIMESTAMP(3) NOT NULL,
    "lastScanAt" TIMESTAMP(3),
    "lastScanLocation" TEXT,
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "slaRiskScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Shipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentScan" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "scanType" "ScanType" NOT NULL,
    "location" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "ShipmentScan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "vehicleCode" TEXT NOT NULL,
    "capacityVolume" DOUBLE PRECISION NOT NULL,
    "capacityWeight" DOUBLE PRECISION NOT NULL,
    "homeBase" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Driver" (
    "id" TEXT NOT NULL,
    "driverCode" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "assignedVehicleId" TEXT,
    "homeBase" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Route" (
    "id" TEXT NOT NULL,
    "routeCode" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "driverId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "region" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Route_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RouteStop" (
    "id" TEXT NOT NULL,
    "routeId" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "sequenceNumber" INTEGER NOT NULL,
    "plannedEta" TIMESTAMP(3) NOT NULL,
    "actualArrival" TIMESTAMP(3),
    "status" "RouteStopStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RouteStop_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DeliveryIssue" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "reportedByUserId" TEXT NOT NULL,
    "issueType" "IssueType" NOT NULL,
    "description" TEXT NOT NULL,
    "aiSeverityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "IssueStatus" NOT NULL DEFAULT 'open',
    "resolutionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DeliveryIssue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationContact" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "contactType" "EscalationContactType" NOT NULL,
    "timeoutSeconds" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EscalationContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EscalationLog" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "deliveryIssueId" TEXT,
    "contactId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "eventType" "EscalationEventType" NOT NULL,
    "payload" JSONB NOT NULL,
    "ackReceived" BOOLEAN NOT NULL DEFAULT false,
    "ackMethod" TEXT,
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EscalationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Acknowledgment" (
    "id" TEXT NOT NULL,
    "shipmentId" TEXT NOT NULL,
    "deliveryIssueId" TEXT,
    "userId" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Acknowledgment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "role" TEXT NOT NULL,
    "channel" "AgentChannel" NOT NULL,
    "linkedShipmentId" TEXT,
    "deliveryIssueId" TEXT,
    "openAiSessionId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "status" "AgentSessionStatus" NOT NULL DEFAULT 'active',
    "lastAgentName" TEXT,
    "transcript" JSONB,
    "outcome" JSONB,

    CONSTRAINT "AgentSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "aggregationType" "MetricAggregationType" NOT NULL,
    "dimension" TEXT NOT NULL,
    "targetValue" DOUBLE PRECISION NOT NULL,
    "warningThreshold" DOUBLE PRECISION,
    "criticalThreshold" DOUBLE PRECISION,
    "ownerRole" "UserRole" NOT NULL DEFAULT 'admin',
    "isVisibleOnDashboard" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MetricDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetricSnapshot" (
    "id" TEXT NOT NULL,
    "metricId" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "timeRangeStart" TIMESTAMP(3) NOT NULL,
    "timeRangeEnd" TIMESTAMP(3) NOT NULL,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "breakdown" JSONB,

    CONSTRAINT "MetricSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DashboardConfig" (
    "id" TEXT NOT NULL,
    "ownerType" "DashboardOwnerType" NOT NULL,
    "ownerRole" "UserRole",
    "ownerUserId" TEXT,
    "layout" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DashboardConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_trackingNumber_idx" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_customerId_idx" ON "Shipment"("customerId");

-- CreateIndex
CREATE INDEX "Shipment_currentStatus_idx" ON "Shipment"("currentStatus");

-- CreateIndex
CREATE INDEX "Shipment_promisedDeliveryDate_idx" ON "Shipment"("promisedDeliveryDate");

-- CreateIndex
CREATE INDEX "Shipment_slaRiskScore_idx" ON "Shipment"("slaRiskScore");

-- CreateIndex
CREATE INDEX "ShipmentScan_shipmentId_idx" ON "ShipmentScan"("shipmentId");

-- CreateIndex
CREATE INDEX "ShipmentScan_timestamp_idx" ON "ShipmentScan"("timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_vehicleCode_key" ON "Vehicle"("vehicleCode");

-- CreateIndex
CREATE INDEX "Vehicle_vehicleCode_idx" ON "Vehicle"("vehicleCode");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_driverCode_key" ON "Driver"("driverCode");

-- CreateIndex
CREATE UNIQUE INDEX "Driver_userId_key" ON "Driver"("userId");

-- CreateIndex
CREATE INDEX "Driver_driverCode_idx" ON "Driver"("driverCode");

-- CreateIndex
CREATE INDEX "Driver_userId_idx" ON "Driver"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Route_routeCode_key" ON "Route"("routeCode");

-- CreateIndex
CREATE INDEX "Route_routeCode_idx" ON "Route"("routeCode");

-- CreateIndex
CREATE INDEX "Route_date_idx" ON "Route"("date");

-- CreateIndex
CREATE INDEX "Route_driverId_idx" ON "Route"("driverId");

-- CreateIndex
CREATE INDEX "Route_region_idx" ON "Route"("region");

-- CreateIndex
CREATE INDEX "RouteStop_routeId_idx" ON "RouteStop"("routeId");

-- CreateIndex
CREATE INDEX "RouteStop_shipmentId_idx" ON "RouteStop"("shipmentId");

-- CreateIndex
CREATE INDEX "RouteStop_sequenceNumber_idx" ON "RouteStop"("sequenceNumber");

-- CreateIndex
CREATE INDEX "DeliveryIssue_shipmentId_idx" ON "DeliveryIssue"("shipmentId");

-- CreateIndex
CREATE INDEX "DeliveryIssue_reportedByUserId_idx" ON "DeliveryIssue"("reportedByUserId");

-- CreateIndex
CREATE INDEX "DeliveryIssue_status_idx" ON "DeliveryIssue"("status");

-- CreateIndex
CREATE INDEX "DeliveryIssue_aiSeverityScore_idx" ON "DeliveryIssue"("aiSeverityScore");

-- CreateIndex
CREATE INDEX "EscalationContact_userId_idx" ON "EscalationContact"("userId");

-- CreateIndex
CREATE INDEX "EscalationContact_isActive_idx" ON "EscalationContact"("isActive");

-- CreateIndex
CREATE INDEX "EscalationLog_shipmentId_idx" ON "EscalationLog"("shipmentId");

-- CreateIndex
CREATE INDEX "EscalationLog_deliveryIssueId_idx" ON "EscalationLog"("deliveryIssueId");

-- CreateIndex
CREATE INDEX "EscalationLog_contactId_idx" ON "EscalationLog"("contactId");

-- CreateIndex
CREATE INDEX "EscalationLog_eventType_idx" ON "EscalationLog"("eventType");

-- CreateIndex
CREATE INDEX "EscalationLog_ackReceived_idx" ON "EscalationLog"("ackReceived");

-- CreateIndex
CREATE INDEX "Acknowledgment_shipmentId_idx" ON "Acknowledgment"("shipmentId");

-- CreateIndex
CREATE INDEX "Acknowledgment_deliveryIssueId_idx" ON "Acknowledgment"("deliveryIssueId");

-- CreateIndex
CREATE INDEX "Acknowledgment_userId_idx" ON "Acknowledgment"("userId");

-- CreateIndex
CREATE INDEX "AgentSession_userId_idx" ON "AgentSession"("userId");

-- CreateIndex
CREATE INDEX "AgentSession_openAiSessionId_idx" ON "AgentSession"("openAiSessionId");

-- CreateIndex
CREATE INDEX "AgentSession_status_idx" ON "AgentSession"("status");

-- CreateIndex
CREATE INDEX "AgentSession_linkedShipmentId_idx" ON "AgentSession"("linkedShipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "MetricDefinition_key_key" ON "MetricDefinition"("key");

-- CreateIndex
CREATE INDEX "MetricDefinition_key_idx" ON "MetricDefinition"("key");

-- CreateIndex
CREATE INDEX "MetricDefinition_ownerRole_idx" ON "MetricDefinition"("ownerRole");

-- CreateIndex
CREATE INDEX "MetricSnapshot_metricId_idx" ON "MetricSnapshot"("metricId");

-- CreateIndex
CREATE INDEX "MetricSnapshot_timeRangeStart_idx" ON "MetricSnapshot"("timeRangeStart");

-- CreateIndex
CREATE INDEX "MetricSnapshot_computedAt_idx" ON "MetricSnapshot"("computedAt");

-- CreateIndex
CREATE INDEX "DashboardConfig_ownerType_ownerRole_idx" ON "DashboardConfig"("ownerType", "ownerRole");

-- CreateIndex
CREATE INDEX "DashboardConfig_ownerUserId_idx" ON "DashboardConfig"("ownerUserId");

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShipmentScan" ADD CONSTRAINT "ShipmentScan_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Driver" ADD CONSTRAINT "Driver_assignedVehicleId_fkey" FOREIGN KEY ("assignedVehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Route" ADD CONSTRAINT "Route_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_routeId_fkey" FOREIGN KEY ("routeId") REFERENCES "Route"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RouteStop" ADD CONSTRAINT "RouteStop_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryIssue" ADD CONSTRAINT "DeliveryIssue_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DeliveryIssue" ADD CONSTRAINT "DeliveryIssue_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationContact" ADD CONSTRAINT "EscalationContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationLog" ADD CONSTRAINT "EscalationLog_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationLog" ADD CONSTRAINT "EscalationLog_deliveryIssueId_fkey" FOREIGN KEY ("deliveryIssueId") REFERENCES "DeliveryIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EscalationLog" ADD CONSTRAINT "EscalationLog_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "EscalationContact"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acknowledgment" ADD CONSTRAINT "Acknowledgment_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acknowledgment" ADD CONSTRAINT "Acknowledgment_deliveryIssueId_fkey" FOREIGN KEY ("deliveryIssueId") REFERENCES "DeliveryIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Acknowledgment" ADD CONSTRAINT "Acknowledgment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_linkedShipmentId_fkey" FOREIGN KEY ("linkedShipmentId") REFERENCES "Shipment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentSession" ADD CONSTRAINT "AgentSession_deliveryIssueId_fkey" FOREIGN KEY ("deliveryIssueId") REFERENCES "DeliveryIssue"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MetricSnapshot" ADD CONSTRAINT "MetricSnapshot_metricId_fkey" FOREIGN KEY ("metricId") REFERENCES "MetricDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DashboardConfig" ADD CONSTRAINT "DashboardConfig_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
