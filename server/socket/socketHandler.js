import { v4 as uuidv4 } from 'uuid';
import { matchQueries, messageQueries, blockQueries, reportQueries } from '../database/db.js';
import { matchingService } from '../services/matching.js';

const activeSockets = new Map(); // Map<socketId, userId>
const userSockets = new Map(); // Map<userId, socketId>
const matchSocketPairs = new Map(); // Map<matchId, { socket1, socket2 }>
const messageRateLimits = new Map(); // Map<userId, { count, resetTime }>

// Rate limiting: max 10 messages per 10 seconds per user
const RATE_LIMIT_WINDOW = 10000; // 10 seconds
const RATE_LIMIT_MAX_MESSAGES = 10;

export function socketHandler(socket, io) {
  // Assign anonymous user ID on connection
  socket.userId = `anon_${uuidv4()}`;
  activeSockets.set(socket.id, socket.userId);
  userSockets.set(socket.userId, socket.id);
  
  console.log(`Anonymous user connected: ${socket.userId}`);

  // Join waiting queue
  socket.on('join-queue', (data, callback) => {
    try {
      if (!socket.userId) {
        callback({ error: 'Not authenticated' });
        return;
      }

      const { preference, settings } = data;

      matchingService.addWaitingUser(socket.userId, socket.id, preference, settings);

      // Try to find a match immediately
      const match = matchingService.findMatch(socket.userId, preference, settings);

      if (match) {
        // Found a match!
        matchingService.removeWaitingUser(socket.userId);
        matchingService.removeWaitingUser(match.userId);

        // Create match ID (no database record needed)
        const matchId = `match_${uuidv4()}`;

        // Store socket pair for in-memory tracking
        matchSocketPairs.set(matchId, {
          socket1: socket.id,
          socket2: match.socketId,
          user1Id: socket.userId,
          user2Id: match.userId
        });

        // Notify both users (anonymous matching)
        socket.emit('match-found', {
          matchId,
          partner: {
            id: match.userId,
            name: 'Stranger'
          }
        });

        const partnerSocket = io.sockets.sockets.get(match.socketId);
        if (partnerSocket) {
          partnerSocket.emit('match-found', {
            matchId,
            partner: {
              id: socket.userId,
              name: 'Stranger'
            }
          });
        }

        callback({ success: true, matched: true, matchId });
      } else {
        callback({ success: true, matched: false, waiting: matchingService.getWaitingCount() });
      }

    } catch (error) {
      console.error('Join queue error:', error);
      callback({ error: 'Failed to join queue' });
    }
  });

  // Leave queue
  socket.on('leave-queue', () => {
    if (socket.userId) {
      matchingService.removeWaitingUser(socket.userId);
    }
  });

  // Send message
  socket.on('send-message', (data, callback) => {
    try {
      if (!socket.userId) {
        callback({ error: 'Not authenticated' });
        return;
      }

      const { matchId, text } = data;

      if (!matchId || !text) {
        callback({ error: 'Match ID and text are required' });
        return;
      }

      // Rate limiting check
      const now = Date.now();
      const userLimit = messageRateLimits.get(socket.userId);
      
      if (userLimit) {
        if (now < userLimit.resetTime) {
          if (userLimit.count >= RATE_LIMIT_MAX_MESSAGES) {
            callback({ error: 'Rate limit exceeded. Please slow down.' });
            return;
          }
          userLimit.count += 1;
        } else {
          // Reset window
          messageRateLimits.set(socket.userId, {
            count: 1,
            resetTime: now + RATE_LIMIT_WINDOW
          });
        }
      } else {
        messageRateLimits.set(socket.userId, {
          count: 1,
          resetTime: now + RATE_LIMIT_WINDOW
        });
      }

      // Input validation and sanitization
      if (typeof text !== 'string' || text.length > 500) {
        callback({ error: 'Message must be a string and less than 500 characters' });
        return;
      }

      // Basic XSS prevention - remove script tags and dangerous HTML
      const sanitizedText = text
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>/g, '')
        .trim();

      if (!sanitizedText) {
        callback({ error: 'Message cannot be empty' });
        return;
      }

      // Verify user is part of this match
      const match = matchQueries.findActiveByUserId.get(socket.userId, socket.userId);
      if (!match || match.id !== matchId) {
        callback({ error: 'Invalid match' });
        return;
      }

      // Save message
      const messageId = `msg_${uuidv4()}`;
      messageQueries.create.run(messageId, matchId, socket.userId, sanitizedText);

      // Get partner socket
      const pair = matchSocketPairs.get(matchId);
      if (!pair) {
        callback({ error: 'Match session not found' });
        return;
      }

      const partnerSocketId = pair.socket1 === socket.id ? pair.socket2 : pair.socket1;
      
      const message = {
        id: messageId,
        text: sanitizedText,
        sender: 'user',
        createdAt: new Date().toISOString()
      };

      // Send to partner
      const partnerSocket = io.sockets.sockets.get(partnerSocketId);
      if (partnerSocket) {
        partnerSocket.emit('new-message', {
          ...message,
          sender: 'partner'
        });
      }

      callback({ success: true, message });

    } catch (error) {
      console.error('Send message error:', error);
      callback({ error: 'Failed to send message' });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    try {
      if (!socket.userId) return;

      const { matchId, isTyping } = data;

      if (!matchId) return;

      // Verify user is part of this match
      const match = matchQueries.findActiveByUserId.get(socket.userId, socket.userId);
      if (!match || match.id !== matchId) return;

      // Get partner socket
      const pair = matchSocketPairs.get(matchId);
      if (!pair) return;

      const partnerSocketId = pair.socket1 === socket.id ? pair.socket2 : pair.socket1;
      const partnerSocket = io.sockets.sockets.get(partnerSocketId);
      
      if (partnerSocket) {
        partnerSocket.emit('partner-typing', { isTyping });
      }
    } catch (error) {
      console.error('Typing indicator error:', error);
    }
  });

  // WebRTC signaling
  socket.on('offer', (data) => {
    const { matchId, offer } = data;
    const pair = matchSocketPairs.get(matchId);
    if (pair) {
      const partnerSocketId = pair.socket1 === socket.id ? pair.socket2 : pair.socket1;
      const partnerSocket = io.sockets.sockets.get(partnerSocketId);
      if (partnerSocket) {
        partnerSocket.emit('offer', { offer });
      }
    }
  });

  socket.on('answer', (data) => {
    const { matchId, answer } = data;
    const pair = matchSocketPairs.get(matchId);
    if (pair) {
      const partnerSocketId = pair.socket1 === socket.id ? pair.socket2 : pair.socket1;
      const partnerSocket = io.sockets.sockets.get(partnerSocketId);
      if (partnerSocket) {
        partnerSocket.emit('answer', { answer });
      }
    }
  });

  socket.on('ice-candidate', (data) => {
    const { matchId, candidate } = data;
    const pair = matchSocketPairs.get(matchId);
    if (pair) {
      const partnerSocketId = pair.socket1 === socket.id ? pair.socket2 : pair.socket1;
      const partnerSocket = io.sockets.sockets.get(partnerSocketId);
      if (partnerSocket) {
        partnerSocket.emit('ice-candidate', { candidate });
      }
    }
  });

  // End match
  socket.on('end-match', (data, callback) => {
    try {
      if (!socket.userId) {
        callback({ error: 'Not authenticated' });
        return;
      }

      const { matchId } = data || {};
      const match = matchQueries.findActiveByUserId.get(socket.userId, socket.userId);

      if (!match) {
        callback({ error: 'No active match found' });
        return;
      }

      // End match
      matchQueries.endMatch.run('ended', match.id);

      const pair = matchSocketPairs.get(match.id);
      if (pair) {
        const partnerSocketId = pair.socket1 === socket.id ? pair.socket2 : pair.socket1;
        const partnerSocket = io.sockets.sockets.get(partnerSocketId);
        if (partnerSocket) {
          partnerSocket.emit('match-ended');
        }
        
        matchSocketPairs.delete(match.id);
      }

      callback({ success: true });

    } catch (error) {
      console.error('End match error:', error);
      callback({ error: 'Failed to end match' });
    }
  });

  // Report user
  socket.on('report-user', (data, callback) => {
    try {
      if (!socket.userId) {
        callback({ error: 'Not authenticated' });
        return;
      }

      const { reportedId, reason, matchId } = data;

      if (!reportedId) {
        callback({ error: 'Reported user ID is required' });
        return;
      }

      // Create report
      const reportId = `report_${uuidv4()}`;
      reportQueries.create.run(reportId, socket.userId, reportedId, reason || null, matchId || null);

      // Block user
      const blockId = `block_${uuidv4()}`;
      try {
        blockQueries.create.run(blockId, socket.userId, reportedId);
      } catch (error) {
        // Block might already exist, ignore
      }

      callback({ success: true });

    } catch (error) {
      console.error('Report user error:', error);
      callback({ error: 'Failed to report user' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (socket.userId) {
      matchingService.removeWaitingUser(socket.userId);
      activeSockets.delete(socket.id);
      userSockets.delete(socket.userId);
      // Clean up rate limit (optional - can keep for a while)
      // messageRateLimits.delete(socket.userId);

      // End any active matches
      const match = matchQueries.findActiveByUserId.get(socket.userId, socket.userId);
      if (match) {
        matchQueries.endMatch.run('disconnected', match.id);
        
        const pair = matchSocketPairs.get(match.id);
        if (pair) {
          const partnerSocketId = pair.socket1 === socket.id ? pair.socket2 : pair.socket1;
          const partnerSocket = io.sockets.sockets.get(partnerSocketId);
          if (partnerSocket) {
            partnerSocket.emit('match-ended');
          }
          
          matchSocketPairs.delete(match.id);
        }
      }
    }
  });
}
