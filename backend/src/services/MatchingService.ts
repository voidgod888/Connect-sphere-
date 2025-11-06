import { UserModel } from '../models/User.js';
import { MatchRequest, PartnerPreference, UserIdentity } from '../types/index.js';

export class MatchingService {
  private waitingUsers: Map<string, MatchRequest> = new Map();
  private userModel: UserModel;

  constructor(userModel: UserModel) {
    this.userModel = userModel;
  }

  addToQueue(matchRequest: MatchRequest): string | null {
    const user = this.userModel.getUserById(matchRequest.userId);
    if (!user) return null;

    // Try to find an immediate match
    const match = this.findMatch(matchRequest);
    
    if (match) {
      // Remove matched user from waiting queue
      this.waitingUsers.delete(match.userId);
      
      // Set partners for both users
      this.userModel.setUserPartner(matchRequest.userId, match.userId);
      this.userModel.setUserPartner(match.userId, matchRequest.userId);
      
      return match.userId;
    }

    // No match found, add to waiting queue
    this.waitingUsers.set(matchRequest.userId, matchRequest);
    return null;
  }

  removeFromQueue(userId: string): void {
    this.waitingUsers.delete(userId);
  }

  private findMatch(request: MatchRequest): MatchRequest | null {
    const requestingUser = this.userModel.getUserById(request.userId);
    if (!requestingUser) return null;

    for (const [waitingUserId, waitingRequest] of this.waitingUsers.entries()) {
      // Skip if it's the same user
      if (waitingUserId === request.userId) continue;

      const waitingUser = this.userModel.getUserById(waitingUserId);
      if (!waitingUser) continue;

      // Check if users have blocked each other
      if (this.userModel.isUserBlocked(request.userId, waitingUserId)) {
        continue;
      }

      // Check country preference
      if (request.settings.country !== 'Global' && 
          waitingRequest.settings.country !== 'Global' &&
          request.settings.country !== waitingRequest.settings.country) {
        continue;
      }

      // Check gender preferences
      if (!this.arePreferencesCompatible(request, waitingRequest)) {
        continue;
      }

      return waitingRequest;
    }

    return null;
  }

  private arePreferencesCompatible(request1: MatchRequest, request2: MatchRequest): boolean {
    // If both are looking for everyone, they match
    if (request1.settings.preference === PartnerPreference.Everyone && 
        request2.settings.preference === PartnerPreference.Everyone) {
      return true;
    }

    // If one is looking for everyone, check if the other's identity matches the first's preference
    if (request1.settings.preference === PartnerPreference.Everyone) {
      return this.identityMatchesPreference(request1.settings.identity, request2.settings.preference);
    }

    if (request2.settings.preference === PartnerPreference.Everyone) {
      return this.identityMatchesPreference(request2.settings.identity, request1.settings.preference);
    }

    // Both have specific preferences - check mutual compatibility
    const user1MatchesUser2Preference = this.identityMatchesPreference(
      request1.settings.identity,
      request2.settings.preference
    );

    const user2MatchesUser1Preference = this.identityMatchesPreference(
      request2.settings.identity,
      request1.settings.preference
    );

    return user1MatchesUser2Preference && user2MatchesUser1Preference;
  }

  private identityMatchesPreference(identity: UserIdentity, preference: PartnerPreference): boolean {
    // Multiple identity matches any preference
    if (identity === UserIdentity.Multiple) return true;
    
    // Check if identity matches preference
    if (identity === UserIdentity.Male && preference === PartnerPreference.Male) return true;
    if (identity === UserIdentity.Female && preference === PartnerPreference.Female) return true;
    
    return false;
  }

  getQueueSize(): number {
    return this.waitingUsers.size;
  }

  getQueuedUsers(): string[] {
    return Array.from(this.waitingUsers.keys());
  }
}
