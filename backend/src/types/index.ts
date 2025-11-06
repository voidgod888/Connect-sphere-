export enum UserIdentity {
  Male = 'male',
  Female = 'female',
  Multiple = 'multiple',
}

export enum PartnerPreference {
  Male = 'male',
  Female = 'female',
  Everyone = 'everyone',
}

export interface UserSettings {
  identity: UserIdentity;
  preference: PartnerPreference;
  country: string;
}

export interface User {
  id: string;
  googleId: string;
  name: string;
  email: string;
  settings?: UserSettings;
  socketId?: string;
  currentPartnerId?: string;
  blockedUsers: string[];
  reportedBy: string[];
}

export interface MatchRequest {
  userId: string;
  settings: UserSettings;
  socketId: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  senderId: string;
  receiverId: string;
  timestamp: number;
}

export interface WebRTCSignal {
  type: 'offer' | 'answer' | 'ice-candidate';
  data: any;
  from: string;
  to: string;
}

export interface Connection {
  user1Id: string;
  user2Id: string;
  startedAt: number;
}
