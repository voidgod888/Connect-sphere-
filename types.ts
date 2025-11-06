
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

// Premium Subscription Tiers
export enum SubscriptionTier {
  Free = 'free',
  Premium = 'premium',
  VIP = 'vip',
}

// Theme options
export enum Theme {
  Dark = 'dark',
  Light = 'light',
  Blue = 'blue',
  Purple = 'purple',
  Green = 'green',
}

// Languages
export const LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Italian', 'Portuguese',
  'Russian', 'Chinese', 'Japanese', 'Korean', 'Arabic', 'Hindi',
  'Turkish', 'Dutch', 'Swedish', 'Polish', 'Other'
] as const;

export type Language = typeof LANGUAGES[number];

// Interest tags
export const INTERESTS = [
  'Gaming', 'Music', 'Sports', 'Movies', 'Art', 'Technology',
  'Travel', 'Food', 'Fashion', 'Books', 'Fitness', 'Photography',
  'Cooking', 'Dancing', 'Science', 'Anime', 'Pets', 'Nature'
] as const;

export type Interest = typeof INTERESTS[number];

// Report categories
export enum ReportCategory {
  InappropriateContent = 'inappropriate_content',
  Harassment = 'harassment',
  Spam = 'spam',
  Underage = 'underage',
  Violence = 'violence',
  Other = 'other',
}

export type UserSettings = {
  identity: UserIdentity;
  preference: PartnerPreference;
  country: string;
  languages?: Language[];
  interests?: Interest[];
  ageRange?: { min: number; max: number };
  safeMode?: boolean;
};

export type AdvancedSettings = {
  connectionQuality: 'auto' | 'high' | 'medium' | 'low';
  autoSkipMismatch: boolean;
  minChatDuration: number; // seconds
  profanityFilter: 'off' | 'low' | 'medium' | 'high';
  showTypingIndicator: boolean;
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
  id: string;
  name: string;
  email: string;
  username?: string;
  subscriptionTier?: SubscriptionTier;
  coins?: number;
  interests?: Interest[];
  languages?: Language[];
  age?: number;
  profileBoostUntil?: string;
};

export type Partner = {
  id: string;
  videoUrl: string;
  name?: string;
  interests?: Interest[];
  rating?: number;
};

// Gamification types
export type Achievement = {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
};

export type UserStats = {
  totalChats: number;
  totalMinutes: number;
  countriesConnected: string[];
  currentStreak: number;
  longestStreak: number;
  averageRating: number;
  totalRatings: number;
  achievements: Achievement[];
  rank?: number;
};

export type LeaderboardEntry = {
  userId: string;
  username: string;
  rank: number;
  score: number;
  avatar?: string;
};

// Queue info
export type QueueStats = {
  position?: number;
  estimatedWait?: number; // seconds
  activeUsers: number;
  usersByRegion?: Record<string, number>;
};

// Enhanced report
export type Report = {
  id: string;
  reportedId: string;
  category: ReportCategory;
  description?: string;
  screenshot?: string;
  timestamp: string;
};
