import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

class WebSocketService {
  private socket: Socket | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribeShipment(trackingNumber: string, callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:shipment', { trackingNumber });
    this.socket.on('shipment.scan.created', callback);
    this.socket.on('shipment.status.updated', callback);
  }

  subscribeIssues(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:issues');
    this.socket.on('issue.created', callback);
    this.socket.on('issue.updated', callback);
  }

  subscribeEscalations(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:escalations');
    this.socket.on('escalation.triggered', callback);
    this.socket.on('escalation.advanced', callback);
    this.socket.on('escalation.acknowledged', callback);
  }

  subscribeMetrics(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:metrics');
    this.socket.on('metrics.snapshot.created', callback);
  }

  unsubscribe(event: string) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const wsService = new WebSocketService();

