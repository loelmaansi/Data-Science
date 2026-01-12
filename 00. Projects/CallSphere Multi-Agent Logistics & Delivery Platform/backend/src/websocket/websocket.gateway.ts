import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebsocketGateway.name);
  private clients: Map<string, Socket> = new Map();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth?.token || client.handshake.headers?.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'default-secret',
      });

      client.data.user = payload;
      this.clients.set(client.id, client);
      this.logger.log(`Client ${client.id} connected as user ${payload.email}`);
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}: ${error.message}`);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    this.clients.delete(client.id);
    this.logger.log(`Client ${client.id} disconnected`);
  }

  @SubscribeMessage('subscribe:shipment')
  handleSubscribeShipment(@MessageBody() data: { trackingNumber: string }, @ConnectedSocket() client: Socket) {
    const room = `shipment:${data.trackingNumber}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribed', room };
  }

  @SubscribeMessage('subscribe:route')
  handleSubscribeRoute(@MessageBody() data: { routeCode: string }, @ConnectedSocket() client: Socket) {
    const room = `route:${data.routeCode}`;
    client.join(room);
    this.logger.log(`Client ${client.id} subscribed to ${room}`);
    return { event: 'subscribed', room };
  }

  @SubscribeMessage('subscribe:issues')
  handleSubscribeIssues(@ConnectedSocket() client: Socket) {
    client.join('issues');
    this.logger.log(`Client ${client.id} subscribed to issues`);
    return { event: 'subscribed', room: 'issues' };
  }

  @SubscribeMessage('subscribe:escalations')
  handleSubscribeEscalations(@ConnectedSocket() client: Socket) {
    client.join('escalations');
    this.logger.log(`Client ${client.id} subscribed to escalations`);
    return { event: 'subscribed', room: 'escalations' };
  }

  @SubscribeMessage('subscribe:metrics')
  handleSubscribeMetrics(@ConnectedSocket() client: Socket) {
    client.join('metrics:overview');
    this.logger.log(`Client ${client.id} subscribed to metrics`);
    return { event: 'subscribed', room: 'metrics:overview' };
  }

  // Event emitters for different event types
  emitShipmentScan(trackingNumber: string, scan: any) {
    this.server.to(`shipment:${trackingNumber}`).emit('shipment.scan.created', scan);
  }

  emitShipmentStatusUpdate(trackingNumber: string, shipment: any) {
    this.server.to(`shipment:${trackingNumber}`).emit('shipment.status.updated', shipment);
  }

  emitIssueCreated(issue: any) {
    this.server.to('issues').emit('issue.created', issue);
  }

  emitIssueUpdated(issue: any) {
    this.server.to('issues').emit('issue.updated', issue);
  }

  emitEscalationTriggered(escalation: any) {
    this.server.to('escalations').emit('escalation.triggered', escalation);
  }

  emitEscalationAdvanced(escalation: any) {
    this.server.to('escalations').emit('escalation.advanced', escalation);
  }

  emitEscalationAcknowledged(escalation: any) {
    this.server.to('escalations').emit('escalation.acknowledged', escalation);
  }

  emitMetricSnapshot(metric: any) {
    this.server.to('metrics:overview').emit('metrics.snapshot.created', metric);
  }
}

