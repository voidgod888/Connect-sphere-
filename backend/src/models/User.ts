import { User, UserSettings } from '../types/index.js';

export class UserModel {
  private users: Map<string, User> = new Map();
  private googleIdToUserId: Map<string, string> = new Map();
  private socketIdToUserId: Map<string, string> = new Map();

  createOrUpdateUser(googleId: string, name: string, email: string): User {
    let userId = this.googleIdToUserId.get(googleId);
    
    if (userId) {
      const existingUser = this.users.get(userId);
      if (existingUser) {
        existingUser.name = name;
        existingUser.email = email;
        return existingUser;
      }
    }

    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user: User = {
      id: userId,
      googleId,
      name,
      email,
      blockedUsers: [],
      reportedBy: [],
    };

    this.users.set(userId, user);
    this.googleIdToUserId.set(googleId, userId);
    return user;
  }

  getUserById(userId: string): User | undefined {
    return this.users.get(userId);
  }

  getUserBySocketId(socketId: string): User | undefined {
    const userId = this.socketIdToUserId.get(socketId);
    return userId ? this.users.get(userId) : undefined;
  }

  setUserSocketId(userId: string, socketId: string): void {
    const user = this.users.get(userId);
    if (user) {
      // Remove old socket mapping if exists
      if (user.socketId) {
        this.socketIdToUserId.delete(user.socketId);
      }
      user.socketId = socketId;
      this.socketIdToUserId.set(socketId, userId);
    }
  }

  removeUserSocketId(socketId: string): void {
    const userId = this.socketIdToUserId.get(socketId);
    if (userId) {
      const user = this.users.get(userId);
      if (user) {
        user.socketId = undefined;
        user.currentPartnerId = undefined;
      }
      this.socketIdToUserId.delete(socketId);
    }
  }

  updateUserSettings(userId: string, settings: UserSettings): void {
    const user = this.users.get(userId);
    if (user) {
      user.settings = settings;
    }
  }

  setUserPartner(userId: string, partnerId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.currentPartnerId = partnerId;
    }
  }

  clearUserPartner(userId: string): void {
    const user = this.users.get(userId);
    if (user) {
      user.currentPartnerId = undefined;
    }
  }

  blockUser(userId: string, blockedUserId: string): void {
    const user = this.users.get(userId);
    if (user && !user.blockedUsers.includes(blockedUserId)) {
      user.blockedUsers.push(blockedUserId);
    }
  }

  reportUser(reportedUserId: string, reporterId: string): void {
    const user = this.users.get(reportedUserId);
    if (user && !user.reportedBy.includes(reporterId)) {
      user.reportedBy.push(reporterId);
    }
  }

  isUserBlocked(userId: string, potentialPartnerId: string): boolean {
    const user = this.users.get(userId);
    const partner = this.users.get(potentialPartnerId);
    
    if (!user || !partner) return true;
    
    return user.blockedUsers.includes(potentialPartnerId) || 
           partner.blockedUsers.includes(userId);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  getOnlineUsers(): User[] {
    return Array.from(this.users.values()).filter(user => user.socketId);
  }
}
