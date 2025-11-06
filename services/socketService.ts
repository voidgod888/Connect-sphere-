import { io, Socket } from 'socket.io-client';
import { apiService } from './api';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3001';

export interface MatchFoundEvent {
  matchId: string;
  partner: {
    id: string;
    name: string;
  };
}

export interface MessageEvent {
  id: string;
  text: string;
  sender: 'user' | 'partner';
  createdAt: string;
}

class SocketService {
  private socket: Socket | null = null;
  private isConnected: boolean = false;

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      const token = apiService.getToken();
      
      if (!token) {
        reject(new Error('No authentication token'));
        return;
      }

      this.socket = io(WS_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.isConnected = true;
        resolve();
      });

      this.socket.on('disconnect', () => {
        console.log('Socket disconnected');
        this.isConnected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('reconnect', (attemptNumber) => {
        console.log('Socket reconnected after', attemptNumber, 'attempts');
        this.isConnected = true;
        // Re-authenticate on reconnect
        const token = apiService.getToken();
        if (token) {
          this.socket?.emit('authenticate', token, (response: any) => {
            if (response.error) {
              console.error('Re-authentication failed:', response.error);
            }
          });
        }
      });

      this.socket.on('reconnect_attempt', (attemptNumber) => {
        console.log('Reconnection attempt', attemptNumber);
      });

      this.socket.on('reconnect_failed', () => {
        console.error('Socket reconnection failed');
        this.isConnected = false;
      });

      // Authenticate on connection
      this.socket.emit('authenticate', token, (response: any) => {
        if (response.error) {
          reject(new Error(response.error));
        }
      });
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  joinQueue(preference: string, settings: any, callback: (response: any) => void) {
    if (!this.socket) {
      callback({ error: 'Not connected' });
      return;
    }

    this.socket.emit('join-queue', { preference, settings }, callback);
  }

  leaveQueue() {
    if (this.socket) {
      this.socket.emit('leave-queue');
    }
  }

  sendMessage(matchId: string, text: string, callback: (response: any) => void) {
    if (!this.socket) {
      callback({ error: 'Not connected' });
      return;
    }

    this.socket.emit('send-message', { matchId, text }, callback);
  }

  endMatch(matchId?: string, callback?: (response: any) => void) {
    if (!this.socket) {
      callback?.({ error: 'Not connected' });
      return;
    }

    this.socket.emit('end-match', { matchId }, callback || (() => {}));
  }

  reportUser(reportedId: string, reason?: string, matchId?: string, callback?: (response: any) => void) {
    if (!this.socket) {
      callback?.({ error: 'Not connected' });
      return;
    }

    this.socket.emit('report-user', { reportedId, reason, matchId }, callback || (() => {}));
  }

  // WebRTC signaling
  sendOffer(matchId: string, offer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('offer', { matchId, offer });
    }
  }

  sendAnswer(matchId: string, answer: RTCSessionDescriptionInit) {
    if (this.socket) {
      this.socket.emit('answer', { matchId, answer });
    }
  }

  sendIceCandidate(matchId: string, candidate: RTCIceCandidateInit) {
    if (this.socket) {
      this.socket.emit('ice-candidate', { matchId, candidate });
    }
  }

  // Event listeners
  onMatchFound(callback: (event: MatchFoundEvent) => void) {
    this.socket?.on('match-found', callback);
  }

  offMatchFound(callback: (event: MatchFoundEvent) => void) {
    this.socket?.off('match-found', callback);
  }

  onMessage(callback: (event: MessageEvent) => void) {
    this.socket?.on('new-message', callback);
  }

  offMessage(callback: (event: MessageEvent) => void) {
    this.socket?.off('new-message', callback);
  }

  onMatchEnded(callback: () => void) {
    this.socket?.on('match-ended', callback);
  }

  offMatchEnded(callback: () => void) {
    this.socket?.off('match-ended', callback);
  }

  onOffer(callback: (data: { offer: RTCSessionDescriptionInit }) => void) {
    this.socket?.on('offer', callback);
  }

  offOffer(callback: (data: { offer: RTCSessionDescriptionInit }) => void) {
    this.socket?.off('offer', callback);
  }

  onAnswer(callback: (data: { answer: RTCSessionDescriptionInit }) => void) {
    this.socket?.on('answer', callback);
  }

  offAnswer(callback: (data: { answer: RTCSessionDescriptionInit }) => void) {
    this.socket?.off('answer', callback);
  }

  onIceCandidate(callback: (data: { candidate: RTCIceCandidateInit }) => void) {
    this.socket?.on('ice-candidate', callback);
  }

  offIceCandidate(callback: (data: { candidate: RTCIceCandidateInit }) => void) {
    this.socket?.off('ice-candidate', callback);
  }

  // Typing indicators
  sendTyping(matchId: string, isTyping: boolean) {
    if (this.socket) {
      this.socket.emit('typing', { matchId, isTyping });
    }
  }

  onTyping(callback: (data: { isTyping: boolean }) => void) {
    this.socket?.on('partner-typing', callback);
  }

  offTyping(callback: (data: { isTyping: boolean }) => void) {
    this.socket?.off('partner-typing', callback);
  }

  getConnected(): boolean {
    return this.isConnected;
  }
}

export const socketService = new SocketService();
