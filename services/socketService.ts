import { io, Socket } from 'socket.io-client';
import type { UserSettings, ChatMessage } from '../types';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to?: string;
}

class SocketServiceClass {
  private socket: Socket | null = null;
  private connected = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.connected) {
        resolve();
        return;
      }

      this.socket = io(SOCKET_URL, {
        withCredentials: true,
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.connected = true;
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.connected = false;
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.connected = false;
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected(): boolean {
    return this.connected && this.socket !== null;
  }

  // Event emitters
  findPartner(settings: UserSettings) {
    if (this.socket) {
      this.socket.emit('find-partner', settings);
    }
  }

  sendWebRTCSignal(signal: WebRTCSignal) {
    if (this.socket) {
      this.socket.emit('webrtc-signal', signal);
    }
  }

  sendChatMessage(text: string, to: string) {
    if (this.socket) {
      this.socket.emit('chat-message', { text, to });
    }
  }

  disconnectPartner() {
    if (this.socket) {
      this.socket.emit('disconnect-partner');
    }
  }

  reportUser(userId: string) {
    if (this.socket) {
      this.socket.emit('report-user', userId);
    }
  }

  // Event listeners
  onPartnerFound(callback: (data: { partnerId: string; partnerName: string }) => void) {
    if (this.socket) {
      this.socket.on('partner-found', callback);
    }
  }

  onSearching(callback: () => void) {
    if (this.socket) {
      this.socket.on('searching', callback);
    }
  }

  onWebRTCSignal(callback: (signal: WebRTCSignal) => void) {
    if (this.socket) {
      this.socket.on('webrtc-signal', callback);
    }
  }

  onChatMessage(callback: (message: { id: string; text: string; sender: string }) => void) {
    if (this.socket) {
      this.socket.on('chat-message', callback);
    }
  }

  onPartnerDisconnected(callback: () => void) {
    if (this.socket) {
      this.socket.on('partner-disconnected', callback);
    }
  }

  onMessageSent(callback: (data: { id: string }) => void) {
    if (this.socket) {
      this.socket.on('message-sent', callback);
    }
  }

  onError(callback: (error: { message: string }) => void) {
    if (this.socket) {
      this.socket.on('error', callback);
    }
  }

  // Remove listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

export const socketService = new SocketServiceClass();
