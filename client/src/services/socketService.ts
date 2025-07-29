import { io, Socket } from 'socket.io-client';
import { Message, AICharacter } from '../types';

export interface SessionData {
  id: string;
  aiCharacter: AICharacter;
  messages: Message[];
  timeRemaining: number;
  isActive: boolean;
}

export interface ExtensionResponse {
  userDecision: 'extend' | 'decline';
  aiDecision: 'extend' | 'decline';
  success: boolean;
}

export interface TypingData {
  isTyping: boolean;
  sender: 'user' | 'ai';
}

class SocketService {
  private socket: Socket | null = null;
  private serverUrl = 'http://localhost:5000';
  private listeners: Map<string, Function[]> = new Map();

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl);
      
      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve(this.socket!);
      });
      
      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  joinSession(sessionId: string) {
    if (this.socket) {
      this.socket.emit('join-session', sessionId);
    }
  }

  sendMessage(sessionId: string, message: string) {
    console.log('Socket service sending:', { sessionId, message, messageType: typeof message });
    if (this.socket) {
      this.socket.emit('send-message', { sessionId, message });
    }
  }

  sendTypingStatus(sessionId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing-status', { sessionId, isTyping, sender: 'user' });
    }
  }

  requestExtension(sessionId: string, decision: 'extend' | 'decline') {
    if (this.socket) {
      this.socket.emit('extend-session', { sessionId, decision });
    }
  }

  endSession(sessionId: string) {
    if (this.socket) {
      this.socket.emit('end-session', sessionId);
    }
  }

  // Event listeners with tracking
  onSessionJoined(callback: (session: SessionData) => void) {
    if (this.socket) {
      this.socket.on('session-joined', callback);
      this.addListener('session-joined', callback);
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
      this.addListener('new-message', callback);
    }
  }

  onExtensionResponse(callback: (response: ExtensionResponse) => void) {
    if (this.socket) {
      this.socket.on('extension-response', callback);
      this.addListener('extension-response', callback);
    }
  }

  onSessionEnded(callback: () => void) {
    if (this.socket) {
      this.socket.on('session-ended', callback);
      this.addListener('session-ended', callback);
    }
  }

  onTypingUpdate(callback: (data: TypingData) => void) {
    if (this.socket) {
      this.socket.on('typing-update', callback);
      this.addListener('typing-update', callback);
    }
  }

  onError(callback: (error: { message: string }) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
      this.addListener('error', callback);
    }
  }

  // Helper methods for listener management
  private addListener(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  removeSessionEndedListeners() {
    if (this.socket && this.listeners.has('session-ended')) {
      const callbacks = this.listeners.get('session-ended')!;
      callbacks.forEach(callback => {
        this.socket!.off('session-ended', callback as any);
      });
      this.listeners.delete('session-ended');
    }
  }

  // Only remove all listeners on disconnect - don't use this elsewhere
  offAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.listeners.clear();
    }
  }
}

export const socketService = new SocketService();