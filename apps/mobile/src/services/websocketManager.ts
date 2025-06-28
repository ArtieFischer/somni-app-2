import { io, Socket } from 'socket.io-client';

// Enable Socket.IO debugging in development
if (__DEV__) {
  (global as any).localStorage = {
    debug: 'socket.io-client:*'
  };
}

export interface WebSocketOptions {
  namespace: string;
  token?: string;
  query?: Record<string, any>;
  transports?: string[];
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  timeout?: number;
  autoConnect?: boolean;
  extraHeaders?: Record<string, string>;
  baseUrl?: string;
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export abstract class WebSocketManager {
  protected socket: Socket | null = null;
  protected options: WebSocketOptions;
  protected connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
  };
  
  private listeners: Map<string, Set<Function>> = new Map();
  private reconnectAttempts = 0;

  constructor(options: WebSocketOptions) {
    this.options = {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
      autoConnect: false,
      ...options,
    };
  }

  async connect(): Promise<void> {
    if (this.socket?.connected) {
      console.log(`Already connected to ${this.options.namespace}`);
      return;
    }

    return new Promise((resolve, reject) => {
      this.connectionState.isConnecting = true;
      this.connectionState.error = null;

      let url: string;
      
      if (this.options.baseUrl) {
        // If a specific baseUrl is provided, check if it already contains a path
        console.log('🔗 Original baseUrl:', this.options.baseUrl);
        console.log('🏷️ Namespace:', this.options.namespace);
        
        const urlParts = this.options.baseUrl.split('://');
        if (urlParts.length > 1 && urlParts[1].includes('/')) {
          // baseUrl already has a path, replace it with our namespace
          const [protocol, rest] = urlParts;
          const [host] = rest.split('/');
          url = `${protocol}://${host}${this.options.namespace}`;
          console.log('🔄 Replaced path in URL:', url);
        } else {
          // baseUrl is just host, append namespace
          url = `${this.options.baseUrl}${this.options.namespace}`;
          console.log('➕ Appended namespace to URL:', url);
        }
      } else {
        // Use default URL
        const baseUrl = process.env.EXPO_PUBLIC_SOMNI_BACKEND_URL || 'http://localhost:3000';
        url = `${baseUrl}${this.options.namespace}`;
        console.log('🏠 Using default URL:', url);
      }

      console.log('🔌 WebSocket connecting to:', url);
      console.log('🔑 Auth token provided:', !!this.options.token);
      console.log('📡 Transport options:', this.options.transports);

      this.socket = io(url, {
        auth: this.options.token ? { token: this.options.token } : undefined,
        query: this.options.query,
        transports: this.options.transports,
        reconnection: this.options.reconnection,
        reconnectionAttempts: this.options.reconnectionAttempts,
        reconnectionDelay: this.options.reconnectionDelay,
        timeout: this.options.timeout,
        autoConnect: this.options.autoConnect,
        extraHeaders: this.options.extraHeaders,
      });

      console.log('🔌 Socket created, autoConnect:', this.options.autoConnect !== false);

      this.setupBaseEventHandlers();

      // Set up a timeout handler
      const connectTimeout = setTimeout(() => {
        console.error('⏱️ Connection timeout after', this.options.timeout, 'ms');
        if (this.connectionState.isConnecting) {
          this.connectionState.error = 'Connection timeout';
          this.connectionState.isConnecting = false;
          this.emit('connection_state_changed', this.connectionState);
          reject(new Error('Connection timeout'));
        }
      }, this.options.timeout || 20000);

      this.socket.on('connect', () => {
        clearTimeout(connectTimeout);
        console.log(`✅ Connected to ${this.options.namespace}`);
        this.connectionState.isConnected = true;
        this.connectionState.isConnecting = false;
        this.reconnectAttempts = 0;
        this.emit('connection_state_changed', this.connectionState);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(connectTimeout);
        console.error(`❌ Connection error on ${this.options.namespace}:`, error.message);
        console.error('Full error:', error);
        console.error('Error type:', error.type);
        console.error('Error data:', error.data);
        this.connectionState.error = error.message;
        this.connectionState.isConnecting = false;
        this.emit('connection_state_changed', this.connectionState);
        reject(error);
      });

      if (this.options.autoConnect !== false) {
        console.log('🔌 Calling socket.connect()...');
        this.socket.connect();
      } else {
        console.log('⏸️ AutoConnect is false, manually calling connect...');
        this.socket.connect();
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connectionState.isConnected = false;
      this.connectionState.isConnecting = false;
      this.emit('connection_state_changed', this.connectionState);
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  protected setupBaseEventHandlers(): void {
    if (!this.socket) return;

    // Log all events for debugging
    this.socket.onAny((eventName, ...args) => {
      console.log(`📨 Socket event: ${eventName}`, args);
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`🔌 Disconnected from ${this.options.namespace}:`, reason);
      this.connectionState.isConnected = false;
      this.emit('connection_state_changed', this.connectionState);
    });

    this.socket.on('reconnecting', (attemptNumber) => {
      console.log(`🔄 Reconnecting to ${this.options.namespace}, attempt ${attemptNumber}`);
      this.reconnectAttempts = attemptNumber;
      this.emit('reconnecting', { attempt: attemptNumber });
    });

    this.socket.on('reconnect', () => {
      console.log(`✅ Reconnected to ${this.options.namespace}`);
      this.connectionState.isConnected = true;
      this.connectionState.error = null;
      this.reconnectAttempts = 0;
      this.emit('connection_state_changed', this.connectionState);
      this.emit('reconnected');
    });

    this.socket.on('error', (error) => {
      console.error(`❌ Socket error on ${this.options.namespace}:`, error);
      this.connectionState.error = error.message || 'Unknown error';
      this.emit('connection_state_changed', this.connectionState);
    });
  }

  protected emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  protected getSocket(): Socket | null {
    return this.socket;
  }
}