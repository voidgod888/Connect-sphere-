import { Server, Socket } from 'socket.io';
import { UserModel } from '../models/User.js';
import { MatchingService } from './MatchingService.js';
import { UserSettings, WebRTCSignal, ChatMessage } from '../types/index.js';

export class SocketService {
  private io: Server;
  private userModel: UserModel;
  private matchingService: MatchingService;

  constructor(io: Server, userModel: UserModel, matchingService: MatchingService) {
    this.io = io;
    this.userModel = userModel;
    this.matchingService = matchingService;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers() {
    this.io.on('connection', (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      // Get user from session
      const session = (socket.request as any).session;
      const userId = session?.passport?.user;

      if (!userId) {
        console.log('Unauthenticated socket connection attempt');
        socket.disconnect();
        return;
      }

      // Update user's socket ID
      this.userModel.setUserSocketId(userId, socket.id);
      const user = this.userModel.getUserById(userId);

      if (user) {
        console.log(`User ${user.name} (${userId}) connected with socket ${socket.id}`);
      }

      // Handle finding a partner
      socket.on('find-partner', (settings: UserSettings) => {
        this.handleFindPartner(socket, userId, settings);
      });

      // Handle WebRTC signaling
      socket.on('webrtc-signal', (signal: WebRTCSignal) => {
        this.handleWebRTCSignal(socket, signal);
      });

      // Handle chat messages
      socket.on('chat-message', (message: { text: string; to: string }) => {
        this.handleChatMessage(socket, userId, message);
      });

      // Handle disconnect from current partner
      socket.on('disconnect-partner', () => {
        this.handleDisconnectPartner(socket, userId);
      });

      // Handle report
      socket.on('report-user', (reportedUserId: string) => {
        this.handleReportUser(userId, reportedUserId);
      });

      // Handle socket disconnection
      socket.on('disconnect', () => {
        this.handleDisconnect(socket, userId);
      });
    });
  }

  private handleFindPartner(socket: Socket, userId: string, settings: UserSettings) {
    const user = this.userModel.getUserById(userId);
    if (!user) {
      socket.emit('error', { message: 'User not found' });
      return;
    }

    // Update user settings
    this.userModel.updateUserSettings(userId, settings);

    // Clear any existing partner
    if (user.currentPartnerId) {
      this.disconnectPartners(userId, user.currentPartnerId);
    }

    // Remove from queue if already there
    this.matchingService.removeFromQueue(userId);

    // Try to find a match
    const matchedUserId = this.matchingService.addToQueue({
      userId,
      settings,
      socketId: socket.id,
    });

    if (matchedUserId) {
      const partner = this.userModel.getUserById(matchedUserId);
      if (partner && partner.socketId) {
        // Notify both users of the match
        socket.emit('partner-found', {
          partnerId: matchedUserId,
          partnerName: partner.name,
        });

        this.io.to(partner.socketId).emit('partner-found', {
          partnerId: userId,
          partnerName: user.name,
        });

        console.log(`Matched ${user.name} with ${partner.name}`);
      }
    } else {
      // Added to queue, waiting for a match
      socket.emit('searching');
      console.log(`User ${user.name} added to matching queue`);
    }
  }

  private handleWebRTCSignal(socket: Socket, signal: WebRTCSignal) {
    const toUser = this.userModel.getUserById(signal.to);
    
    if (toUser && toUser.socketId) {
      this.io.to(toUser.socketId).emit('webrtc-signal', {
        type: signal.type,
        data: signal.data,
        from: signal.from,
      });
    }
  }

  private handleChatMessage(socket: Socket, userId: string, message: { text: string; to: string }) {
    const user = this.userModel.getUserById(userId);
    const partner = this.userModel.getUserById(message.to);

    if (!user || !partner || !partner.socketId) {
      socket.emit('error', { message: 'Cannot send message' });
      return;
    }

    // Verify they are connected to each other
    if (user.currentPartnerId !== message.to) {
      socket.emit('error', { message: 'Not connected to this user' });
      return;
    }

    const chatMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: message.text,
      senderId: userId,
      receiverId: message.to,
      timestamp: Date.now(),
    };

    // Send message to partner
    this.io.to(partner.socketId).emit('chat-message', {
      id: chatMessage.id,
      text: chatMessage.text,
      sender: 'partner',
    });

    // Confirm to sender
    socket.emit('message-sent', {
      id: chatMessage.id,
    });
  }

  private handleDisconnectPartner(socket: Socket, userId: string) {
    const user = this.userModel.getUserById(userId);
    
    if (user && user.currentPartnerId) {
      this.disconnectPartners(userId, user.currentPartnerId);
    }

    // Remove from matching queue
    this.matchingService.removeFromQueue(userId);
  }

  private handleReportUser(reporterId: string, reportedUserId: string) {
    // Block the reported user for the reporter
    this.userModel.blockUser(reporterId, reportedUserId);
    
    // Add to reported list
    this.userModel.reportUser(reportedUserId, reporterId);
    
    const reporter = this.userModel.getUserById(reporterId);
    const reported = this.userModel.getUserById(reportedUserId);

    console.log(`User ${reporter?.name} reported ${reported?.name}`);

    // Disconnect the users
    if (reporter?.currentPartnerId === reportedUserId) {
      this.disconnectPartners(reporterId, reportedUserId);
    }
  }

  private handleDisconnect(socket: Socket, userId: string) {
    console.log(`Client disconnected: ${socket.id}`);
    
    const user = this.userModel.getUserById(userId);
    
    if (user) {
      // Notify partner if connected
      if (user.currentPartnerId) {
        const partner = this.userModel.getUserById(user.currentPartnerId);
        if (partner && partner.socketId) {
          this.io.to(partner.socketId).emit('partner-disconnected');
          this.userModel.clearUserPartner(partner.id);
        }
        this.userModel.clearUserPartner(userId);
      }

      // Remove from matching queue
      this.matchingService.removeFromQueue(userId);

      // Clear socket ID
      this.userModel.removeUserSocketId(socket.id);
      
      console.log(`User ${user.name} disconnected`);
    }
  }

  private disconnectPartners(userId1: string, userId2: string) {
    const user1 = this.userModel.getUserById(userId1);
    const user2 = this.userModel.getUserById(userId2);

    if (user1 && user1.socketId) {
      this.io.to(user1.socketId).emit('partner-disconnected');
    }

    if (user2 && user2.socketId) {
      this.io.to(user2.socketId).emit('partner-disconnected');
    }

    this.userModel.clearUserPartner(userId1);
    this.userModel.clearUserPartner(userId2);
  }
}
