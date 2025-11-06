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
      identity TEXT CHECK(identity IN ('male', 'female', 'multiple')) NOT NULL,
      country TEXT NOT NULL DEFAULT 'Global',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

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
      reason TEXT,
      match_id TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (reported_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (match_id) REFERENCES matches(id) ON DELETE SET NULL,
      CHECK(reporter_id != reported_id)
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
  `);

  console.log('✅ Database initialized successfully');
}

export const database = db;

// Helper functions
export const userQueries = {
  create: db.prepare(`
    INSERT INTO users (id, name, email, google_id, identity, country)
    VALUES (?, ?, ?, ?, ?, ?)
  `),
  
  findByEmail: db.prepare('SELECT * FROM users WHERE email = ?'),
  findById: db.prepare('SELECT * FROM users WHERE id = ?'),
  findByGoogleId: db.prepare('SELECT * FROM users WHERE google_id = ?'),
  
  update: db.prepare(`
    UPDATE users 
    SET name = ?, identity = ?, country = ?, last_seen = CURRENT_TIMESTAMP
    WHERE id = ?
  `),
  
  updateLastSeen: db.prepare('UPDATE users SET last_seen = CURRENT_TIMESTAMP WHERE id = ?')
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
    INSERT INTO reports (id, reporter_id, reported_id, reason, match_id)
    VALUES (?, ?, ?, ?, ?)
  `)
};
