import { userQueries, blockQueries, matchQueries } from '../database/db.js';

class MatchingService {
  constructor() {
    this.waitingUsers = new Map(); // Map<userId, { socketId, preference, settings }>
  }

  addWaitingUser(userId, socketId, preference, settings) {
    this.waitingUsers.set(userId, {
      socketId,
      preference,
      settings,
      timestamp: Date.now()
    });
  }

  removeWaitingUser(userId) {
    this.waitingUsers.delete(userId);
  }

  findMatch(userId, preference, settings) {
    const user = userQueries.findById.get(userId);
    if (!user) return null;

    const blockedIds = new Set();
    const blockedResult = blockQueries.getBlockedIds.all(userId, userId);
    blockedResult.forEach(row => blockedIds.add(row.blocked_id));

    // Find available users
    const candidates = [];
    for (const [candidateId, candidateData] of this.waitingUsers.entries()) {
      // Skip self
      if (candidateId === userId) continue;
      
      // Skip blocked users
      if (blockedIds.has(candidateId)) continue;

      // Skip if already in an active match
      const activeMatch = matchQueries.findActiveByUserId.get(candidateId, candidateId);
      if (activeMatch) continue;

      const candidateUser = userQueries.findById.get(candidateId);
      if (!candidateUser) continue;

      // Check preference matching
      if (preference === 'everyone') {
        candidates.push({ userId: candidateId, data: candidateData, user: candidateUser });
      } else {
        // For now, we'll match based on preference
        // In a real app, you'd verify the candidate's identity matches preference
        // For demo, we'll allow matching and let frontend verification handle it
        candidates.push({ userId: candidateId, data: candidateData, user: candidateUser });
      }
    }

    if (candidates.length === 0) return null;

    // Random selection (in production, you might want smarter matching)
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    
    return {
      userId: selected.userId,
      socketId: selected.data.socketId,
      user: selected.user
    };
  }

  getWaitingCount() {
    return this.waitingUsers.size;
  }
}

export const matchingService = new MatchingService();
