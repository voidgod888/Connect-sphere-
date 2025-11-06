import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dbPath = path.join(__dirname, '../data', 'connectsphere.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // Users table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      google_id TEXT UNIQUE,
      username TEXT UNIQUE,
      apple_id TEXT UNIQUE,
      identity TEXT CHECK(identity IN ('male', 'female', 'multiple')) NOT NULL,
      country TEXT NOT NULL DEFAULT 'Global',
      age INTEGER,
      subscription_tier TEXT CHECK(subscription_tier IN ('free', 'premium', 'vip')) DEFAULT 'free',
      coins INTEGER DEFAULT 0,
      profile_boost_until DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Ensure legacy databases get the apple_id column
  const userColumns = db.prepare('PRAGMA table_info(users)').all();
  const hasAppleIdColumn = userColumns.some(column => column.name === 'apple_id');
  if (!hasAppleIdColumn) {
    try {
      db.exec('ALTER TABLE users ADD COLUMN apple_id TEXT UNIQUE');
    } catch (error) {
      console.warn('⚠️  Could not add apple_id column (may already exist):', error.message);
    }
  }

  // Sessions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Matches table
  db.exec(`
    CREATE TABLE IF NOT EXISTS matches (
      id TEXT PRIMARY KEY,
      user1_id TEXT NOT NULL,
      user2_id TEXT NOT NULL,
      started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      ended_at DATETIME,
      status TEXT CHECK(status IN ('active', 'ended', 'disconnected')) DEFAULT 'active',
      FOREIGN KEY (user1_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (user2_id) REFERENCES users(id) ON DELETE CASCADE,
      CHECK(user1_id != user2_id)
    )
  `);

  // Messages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      match_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      text TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Blocks table
  db.exec(`
    CREATE TABLE IF NOT EXISTS blocks (
      id TEXT PRIMARY KEY,
      blocker_id TEXT NOT NULL,
      blocked_id TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (blocker_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (blocked_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(blocker_id, blocked_id),
      CHECK(blocker_id != blocked_id)
    )
  `);

  // Reports table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      reporter_id TEXT NOT NULL,
      reported_id TEXT NOT NULL,
      category TEXT CHECK(category IN ('inappropriate_content', 'harassment', 'spam', 'underage', 'violence', 'other')),
      reason TEXT,
      match_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
      CHECK(reporter_id != reported_id)
    )
  `);

  // User Interests table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_interests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      interest TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, interest)
    )
  `);

  // User Languages table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_languages (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      language TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, language)
    )
  `);

  // User Stats table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_stats (
      user_id TEXT PRIMARY KEY,
      total_chats INTEGER DEFAULT 0,
      total_minutes INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      longest_streak INTEGER DEFAULT 0,
      last_chat_date DATE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      max_progress INTEGER DEFAULT 1
    )
  `);

  // User Achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      progress INTEGER DEFAULT 0,
      unlocked_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
      UNIQUE(user_id, achievement_id)
    )
  `);

  // Ratings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ratings (
      id TEXT PRIMARY KEY,
      rater_id TEXT NOT NULL,
      rated_id TEXT NOT NULL,
      match_id TEXT NOT NULL,
      rating INTEGER CHECK(rating >= 1 AND rating <= 5),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (rater_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (rated_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE CASCADE,
      UNIQUE(rater_id, match_id)
    )
  `);

  // Countries Connected table
  db.exec(`
    CREATE TABLE IF NOT EXISTS countries_connected (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      country TEXT NOT NULL,
      first_connected DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, country)
    )
  `);

  // Transactions table (for coins)
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT CHECK(type IN ('purchase', 'reward', 'spend', 'refund')),
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // User Settings table
  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      user_id TEXT PRIMARY KEY,
      theme TEXT DEFAULT 'dark',
      connection_quality TEXT DEFAULT 'auto',
      auto_skip_mismatch BOOLEAN DEFAULT 0,
      min_chat_duration INTEGER DEFAULT 0,
      profanity_filter TEXT DEFAULT 'medium',
      show_typing_indicator BOOLEAN DEFAULT 1,
      safe_mode BOOLEAN DEFAULT 0,
      age_range_min INTEGER,
      age_range_max INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // Create indexes
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_matches_user1 ON matches(user1_id);
    CREATE INDEX IF NOT EXISTS idx_matches_user2 ON matches(user2_id);
    CREATE INDEX IF NOT EXISTS idx_matches_status ON matches(status);
    CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
    CREATE INDEX IF NOT EXISTS idx_blocks_blocker ON blocks(blocker_id);
    CREATE INDEX IF NOT EXISTS idx_blocks_blocked ON blocks(blocked_id);
    CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests(user_id);
    CREATE INDEX IF NOT EXISTS idx_user_languages_user ON user_languages(user_id);
    CREATE INDEX IF NOT EXISTS idx_ratings_rated ON ratings(rated_id);
    CREATE INDEX IF NOT EXISTS idx_countries_connected_user ON countries_connected(user_id);
  `);

  // Initialize default achievements
  const defaultAchievements = [
    { id: 'first_chat', name: 'First Contact', description: 'Complete your first chat', icon: '🎉', max_progress: 1 },
    { id: 'globe_trotter', name: 'Globe Trotter', description: 'Chat with users from 50 countries', icon: '🌍', max_progress: 50 },
    { id: 'night_owl', name: 'Night Owl', description: 'Complete 100 chats after midnight', icon: '🦉', max_progress: 100 },
    { id: 'polyglot', name: 'Polyglot', description: 'Chat in 5 different languages', icon: '🗣️', max_progress: 5 },
    { id: 'marathon', name: 'Marathon Chatter', description: 'Have a 1-hour continuous chat', icon: '⏱️', max_progress: 60 },
    { id: 'social_butterfly', name: 'Social Butterfly', description: 'Complete 100 chats', icon: '🦋', max_progress: 100 },
    { id: 'streak_master', name: 'Streak Master', description: 'Maintain a 7-day streak', icon: '🔥', max_progress: 7 },
    { id: 'highly_rated', name: 'Highly Rated', description: 'Receive 50 five-star ratings', icon: '⭐', max_progress: 50 },
  ];

  const insertAchievement = db.prepare(`
    INSERT OR IGNORE INTO achievements (id, name, description, icon, max_progress)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const achievement of defaultAchievements) {
    insertAchievement.run(achievement.id, achievement.name, achievement.description, achievement.icon, achievement.max_progress);
  }

  console.log('✅ Database initialized successfully');
}

export const database = db;

// Helper functions
export const userQueries = {
  create: db.prepare(`
    INSERT INTO users (id, name, email, google_id, apple_id, identity, country)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `),
  
  findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findById: db.prepare('SELECT * FROM users WHERE id = ?'),
  findByGoogleId: db.prepare('SELECT * FROM users WHERE google_id = ?'),
  findByAppleId: db.prepare('SELECT * FROM users WHERE apple_id = ?'),
  
  update: db.prepare(`
    UPDATE users 
    SET name = ?, identity = ?, country = ?, last_seen = CURRENT_TIMESTAMP
    WHERE id = ?
  `),

  updateLastSeen: db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?'),
  linkGoogleId: db.prepare('UPDATE users SET google_id = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?'),
  linkAppleId: db.prepare('UPDATE users SET apple_id = ?, last_seen = CURRENT_TIMESTAMP WHERE id = ?')
};

export const sessionQueries = {
  create: db.prepare(`
    INSERT INTO sessions (id, user_id, token, expires_at)
    VALUES (?, ?, ?, ?)
  `),
  
  findByToken: db.prepare('SELECT * FROM sessions WHERE token = ? AND expires_at > CURRENT_TIMESTAMP'),
  deleteByToken: db.prepare('DELETE FROM sessions WHERE token = ?'),
  deleteByUserId: db.prepare('DELETE FROM sessions WHERE user_id = ?'),
  cleanupExpired: db.prepare('DELETE FROM sessions WHERE expires_at < CURRENT_TIMESTAMP')
};

export const matchQueries = {
  create: db.prepare(`
    INSERT INTO matches (id, user1_id, user2_id, status)
    VALUES (?, ?, ?, 'active')
  `),
  
  findActiveByUserId: db.prepare(`
    SELECT * FROM matches 
    WHERE (user1_id = ? OR user2_id = ?) AND status = 'active'
    ORDER BY started_at DESC LIMIT 1
  `),
  
  endMatch: db.prepare(`
    UPDATE matches 
    SET status = ?, ended_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `),
  
  getPartnerId: db.prepare(`
    SELECT CASE 
      WHEN user1_id = ? THEN user2_id 
      ELSE user1_id 
    END as partner_id
    FROM matches 
    WHERE id = ?
  `)
};

export const messageQueries = {
  create: db.prepare(`
    INSERT INTO messages (id, match_id, sender_id, text)
    VALUES (?, ?, ?, ?)
  `),
  
  getByMatchId: db.prepare(`
    SELECT m.*, u.name as sender_name
    FROM messages m
    JOIN users u ON m.sender_id = u.id
    WHERE m.match_id = ?
    ORDER BY m.created_at ASC
  `)
};

export const blockQueries = {
  create: db.prepare(`
    INSERT INTO blocks (id, blocker_id, blocked_id)
    VALUES (?, ?, ?)
  `),
  
  isBlocked: db.prepare(`
    SELECT COUNT(*) as count FROM blocks 
    WHERE (blocker_id = ? AND blocked_id = ?) OR (blocker_id = ? AND blocked_id = ?)
  `),
  
  getBlockedIds: db.prepare(`
    SELECT blocked_id FROM blocks WHERE blocker_id = ?
    UNION
    SELECT blocker_id FROM blocks WHERE blocked_id = ?
  `)
};

export const reportQueries = {
  create: db.prepare(`
    INSERT INTO reports (id, reporter_id, reported_id, category, reason, match_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `)
};

// New queries for extended features
export const statsQueries = {
  getUserStats: db.prepare(`
    SELECT * FROM user_stats WHERE user_id = ?
  `),
  
  createUserStats: db.prepare(`
    INSERT OR IGNORE INTO user_stats (user_id) VALUES (?)
  `),
  
  incrementChats: db.prepare(`
    UPDATE user_stats 
    SET total_chats = total_chats + 1,
        last_chat_date = DATE('now')
    WHERE user_id = ?
  `),
  
  addMinutes: db.prepare(`
    UPDATE user_stats 
    SET total_minutes = total_minutes + ?
    WHERE user_id = ?
  `),
  
  updateStreak: db.prepare(`
    UPDATE user_stats 
    SET current_streak = ?,
        longest_streak = MAX(longest_streak, ?)
    WHERE user_id = ?
  `)
};

export const interestQueries = {
  addInterest: db.prepare(`
    INSERT OR IGNORE INTO user_interests (id, user_id, interest)
    VALUES (?, ?, ?)
  `),
  
  getUserInterests: db.prepare(`
    SELECT interest FROM user_interests WHERE user_id = ?
  `),
  
  removeUserInterests: db.prepare(`
    DELETE FROM user_interests WHERE user_id = ?
  `)
};

export const languageQueries = {
  addLanguage: db.prepare(`
    INSERT OR IGNORE INTO user_languages (id, user_id, language)
    VALUES (?, ?, ?)
  `),
  
  getUserLanguages: db.prepare(`
    SELECT language FROM user_languages WHERE user_id = ?
  `),
  
  removeUserLanguages: db.prepare(`
    DELETE FROM user_languages WHERE user_id = ?
  `)
};

export const achievementQueries = {
  getUserAchievements: db.prepare(`
    SELECT a.*, ua.progress, ua.unlocked_at
    FROM user_achievements ua
    JOIN achievements a ON ua.achievement_id = a.id
    WHERE ua.user_id = ?
  `),
  
  updateAchievementProgress: db.prepare(`
    INSERT INTO user_achievements (id, user_id, achievement_id, progress, unlocked_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(user_id, achievement_id) DO UPDATE SET
      progress = excluded.progress,
      unlocked_at = COALESCE(user_achievements.unlocked_at, excluded.unlocked_at)
  `),
  
  getAllAchievements: db.prepare(`
    SELECT * FROM achievements
  `)
};

export const ratingQueries = {
  addRating: db.prepare(`
    INSERT OR IGNORE INTO ratings (id, rater_id, rated_id, match_id, rating)
    VALUES (?, ?, ?, ?, ?)
  `),
  
  getAverageRating: db.prepare(`
    SELECT AVG(rating) as avg_rating, COUNT(*) as total_ratings
    FROM ratings
    WHERE rated_id = ?
  `)
};

export const countryQueries = {
  addCountry: db.prepare(`
    INSERT OR IGNORE INTO countries_connected (id, user_id, country)
    VALUES (?, ?, ?)
  `),
  
  getUserCountries: db.prepare(`
    SELECT country FROM countries_connected WHERE user_id = ?
  `)
};

export const transactionQueries = {
  create: db.prepare(`
    INSERT INTO transactions (id, user_id, amount, type, description)
    VALUES (?, ?, ?, ?, ?)
  `),
  
  updateUserCoins: db.prepare(`
    UPDATE users SET coins = coins + ? WHERE id = ?
  `)
};

export const settingsQueries = {
  getUserSettings: db.prepare(`
    SELECT * FROM user_settings WHERE user_id = ?
  `),
  
  createUserSettings: db.prepare(`
    INSERT OR IGNORE INTO user_settings (user_id) VALUES (?)
  `),
  
  updateUserSettings: db.prepare(`
    UPDATE user_settings 
    SET theme = ?,
        connection_quality = ?,
        auto_skip_mismatch = ?,
        min_chat_duration = ?,
        profanity_filter = ?,
        show_typing_indicator = ?,
        safe_mode = ?,
        age_range_min = ?,
        age_range_max = ?
    WHERE user_id = ?
  `)
};
