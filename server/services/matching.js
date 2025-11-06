// Anonymous matching service - no database required
class MatchingService {
  constructor() {
    this.waitingUsers = new Map(); // Map<userId, { socketId, preference, settings }>
    this.blockedPairs = new Map(); // Map<userId, Set<blockedUserIds>>
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

  blockUser(userId, blockedUserId) {
    if (!this.blockedPairs.has(userId)) {
      this.blockedPairs.set(userId, new Set());
    }
    this.blockedPairs.get(userId).add(blockedUserId);
  }

  isBlocked(userId, candidateId) {
    const userBlocks = this.blockedPairs.get(userId);
    const candidateBlocks = this.blockedPairs.get(candidateId);
    
    return (userBlocks && userBlocks.has(candidateId)) || 
           (candidateBlocks && candidateBlocks.has(userId));
  }

  findMatch(userId, preference, settings) {
    // Find available users
    const candidates = [];
    for (const [candidateId, candidateData] of this.waitingUsers.entries()) {
      // Skip self
      if (candidateId === userId) continue;
      
      // Skip blocked users
      if (this.isBlocked(userId, candidateId)) continue;

      // Check preference matching (simplified for anonymous mode)
      candidates.push({ userId: candidateId, data: candidateData });
    }

    if (candidates.length === 0) return null;

    // Random selection
    const selected = candidates[Math.floor(Math.random() * candidates.length)];
    
    return {
      userId: selected.userId,
      socketId: selected.data.socketId
    };
  }

  getWaitingCount() {
    return this.waitingUsers.size;
  }
}

export const matchingService = new MatchingService();
