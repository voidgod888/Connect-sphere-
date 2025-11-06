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

    // Find available users with weighted scoring
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

      let score = 0;
      
      // Country matching bonus (higher score for same country)
      if (settings.country && candidateData.settings?.country) {
        if (settings.country === candidateData.settings.country) {
          score += 10;
        } else if (settings.country === 'Global' || candidateData.settings.country === 'Global') {
          score += 5;
        }
      }

      // Preference matching
      if (preference === 'everyone') {
        score += 5;
      } else if (candidateData.settings?.identity === preference) {
        score += 10;
      } else {
        // Still allow matching but with lower score
        score += 2;
      }

      // Recency bonus (prefer users who joined recently)
      const waitTime = Date.now() - candidateData.timestamp;
      const waitTimeMinutes = waitTime / 60000;
      if (waitTimeMinutes < 5) {
        score += 3; // Bonus for recent joiners
      }

      candidates.push({ 
        userId: candidateId, 
        data: candidateData, 
        user: candidateUser,
        score 
      });
    }

    if (candidates.length === 0) return null;

    // Sort by score (highest first) and select from top candidates
    candidates.sort((a, b) => b.score - a.score);
    
    // Select from top 30% of candidates (or top 3, whichever is larger)
    const topCandidates = Math.max(3, Math.ceil(candidates.length * 0.3));
    const selectedCandidates = candidates.slice(0, topCandidates);
    
    // Random selection from top candidates (weighted matching)
    const selected = selectedCandidates[Math.floor(Math.random() * selectedCandidates.length)];
    
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
