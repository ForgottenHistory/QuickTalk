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

  // NEW: Typing indicator methods
  sendTypingStatus(sessionId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing-status', { sessionId, isTyping, sender: 'user' });
    }
  }

  onTypingUpdate(callback: (data: TypingData) => void) {
    if (this.socket) {
      this.socket.on('typing-update', callback);
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

  onSessionJoined(callback: (session: SessionData) => void) {
    if (this.socket) {
      this.socket.on('session-joined', callback);
    }
  }

  onNewMessage(callback: (message: Message) => void) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  onExtensionResponse(callback: (response: ExtensionResponse) => void) {
    if (this.socket) {
      this.socket.on('extension-response', callback);
    }
  }

  onSessionEnded(callback: () => void) {
    if (this.socket) {
      this.socket.on('session-ended', callback);
    }
  }

  onError(callback: (error: { message: string }) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  offAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketService();