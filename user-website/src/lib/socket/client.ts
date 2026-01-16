import { io, Socket } from 'socket.io-client';
import { toast } from '@/lib/toast';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:6006';

interface SocketEventCallbacks {
  [event: string]: ((...args: any[]) => void)[]
}

class SocketClient {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private eventCallbacks: SocketEventCallbacks = {};
  private connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private lastConnectionTime: number | null = null;
  private onReconnectCallbacks: (() => void)[] = [];

  connect(token: string): void {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    console.log('Connecting to Socket.IO server...');
    this.connectionStatus = 'connecting';

    this.socket = io(SOCKET_URL, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: this.reconnectDelay,
      reconnectionAttempts: this.maxReconnectAttempts,
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket?.id);
      this.connectionStatus = 'connected';
      this.reconnectAttempts = 0;
      this.lastConnectionTime = Date.now();

      // Show connection success toast only after reconnection
      if (this.lastConnectionTime && this.reconnectAttempts > 0) {
        toast.success('Connection restored');
      }

      // Trigger reconnection callbacks for data sync
      this.onReconnectCallbacks.forEach(callback => {
        try {
          callback();
        } catch (error) {
          console.error('Error in reconnection callback:', error);
        }
      });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      this.connectionStatus = 'disconnected';

      // Show disconnect toast for unexpected disconnections
      if (reason === 'io server disconnect' || reason === 'transport close') {
        toast.error('Connection lost. Attempting to reconnect...');
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      this.connectionStatus = 'disconnected';
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('Max reconnection attempts reached');
        toast.error('Unable to connect to server. Please check your connection.');
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      this.connectionStatus = 'connected';
      toast.success('Reconnected successfully');
    });

    this.socket.on('reconnect_attempt', (attemptNumber) => {
      console.log('Socket reconnection attempt:', attemptNumber);
      this.connectionStatus = 'reconnecting';
      
      if (attemptNumber === 1) {
        toast.info('Reconnecting...');
      }
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error.message);
      this.connectionStatus = 'reconnecting';
    });

    this.socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      this.connectionStatus = 'disconnected';
      toast.error('Failed to reconnect. Please refresh the page.');
    });

    // Setup application-specific event handlers
    this.setupApplicationEvents();
  }

  private setupApplicationEvents(): void {
    if (!this.socket) return;

    // Order update events
    this.socket.on('order:updated', (data) => {
      console.log('Order updated:', data);
      toast.info(`Order #${data.orderNumber} status updated to ${data.status}`);
      this.triggerCallbacks('order:updated', data);
    });

    this.socket.on('order:created', (data) => {
      console.log('New order created:', data);
      toast.success(`New order #${data.orderNumber} received`);
      this.triggerCallbacks('order:created', data);
    });

    // Notification events
    this.socket.on('notification', (data) => {
      console.log('Notification received:', data);
      
      switch (data.type) {
        case 'info':
          toast.info(data.message);
          break;
        case 'success':
          toast.success(data.message);
          break;
        case 'warning':
          toast.warning(data.message);
          break;
        case 'error':
          toast.error(data.message);
          break;
        default:
          toast.info(data.message);
      }
      
      this.triggerCallbacks('notification', data);
    });

    // System events
    this.socket.on('system:maintenance', (data) => {
      console.log('System maintenance notification:', data);
      toast.warning(`System maintenance scheduled: ${data.message}`);
      this.triggerCallbacks('system:maintenance', data);
    });

    // User-specific events
    this.socket.on('user:session_expired', () => {
      console.log('Session expired');
      toast.error('Your session has expired. Please log in again.');
      this.triggerCallbacks('user:session_expired');
    });
  }

  private triggerCallbacks(event: string, ...args: any[]): void {
    const callbacks = this.eventCallbacks[event] || [];
    callbacks.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        console.error(`Error in callback for event ${event}:`, error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      console.log('Disconnecting socket...');
      this.socket.disconnect();
      this.socket = null;
      this.reconnectAttempts = 0;
      this.connectionStatus = 'disconnected';
      this.eventCallbacks = {};
      this.onReconnectCallbacks = [];
    }
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }

    // Store callback for internal event management
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = [];
    }
    this.eventCallbacks[event].push(callback);

    this.socket.on(event, callback);
  }

  off(event: string, callback?: (...args: any[]) => void): void {
    if (!this.socket) return;

    if (callback) {
      // Remove specific callback
      const callbacks = this.eventCallbacks[event] || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
      this.socket.off(event, callback);
    } else {
      // Remove all callbacks for event
      delete this.eventCallbacks[event];
      this.socket.off(event);
    }
  }

  emit(event: string, ...args: any[]): void {
    if (!this.socket) {
      console.warn('Socket not connected. Call connect() first.');
      return;
    }
    this.socket.emit(event, ...args);
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionStatus(): 'disconnected' | 'connecting' | 'connected' | 'reconnecting' {
    return this.connectionStatus;
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  // Register callback for when connection is restored (for data sync)
  onReconnect(callback: () => void): void {
    this.onReconnectCallbacks.push(callback);
  }

  // Remove reconnection callback
  offReconnect(callback: () => void): void {
    const index = this.onReconnectCallbacks.indexOf(callback);
    if (index > -1) {
      this.onReconnectCallbacks.splice(index, 1);
    }
  }

  // Join a room (for user-specific or tenant-specific events)
  joinRoom(room: string): void {
    if (this.isConnected()) {
      this.emit('join:room', room);
    }
  }

  // Leave a room
  leaveRoom(room: string): void {
    if (this.isConnected()) {
      this.emit('leave:room', room);
    }
  }
}

export const socketClient = new SocketClient();
export default socketClient;
