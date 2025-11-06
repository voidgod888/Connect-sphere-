
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

export type UserSettings = {
  identity: UserIdentity;
  preference: PartnerPreference;
  country: string;
};

export type ChatState = 'idle' | 'requesting_permissions' | 'searching' | 'connected' | 'disconnected';

export type VerificationStatus = 'idle' | 'verifying' | 'verified' | 'mismatch';

export type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'partner';
  timestamp?: string;
};

export type AuthState = 'unauthenticated' | 'authenticated';

export type User = {
  id:string;
  name: string;
  email: string;
};

export type Partner = {
  id: string; // Will use the video URL as ID
  videoUrl: string;
};
