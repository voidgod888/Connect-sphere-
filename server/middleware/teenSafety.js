import { database } from '../database/db.js';

/**
 * Teen Safety Middleware
 * Applies additional safety measures for users under 18
 */

export function applyTeenSafetyDefaults(userId) {
  try {
    const user = database.prepare('SELECT age FROM users WHERE id = ?').get(userId);
    
    if (!user || !user.age) {
      return;
    }

    const isTeen = user.age < 18;

    if (isTeen) {
      // Ensure teen has enhanced safety settings
      const settingsCheck = database.prepare('SELECT * FROM user_settings WHERE user_id = ?').get(userId);
      
      if (settingsCheck) {
        // Update existing settings with teen-safe defaults
        database.prepare(`
          UPDATE user_settings 
          SET profanity_filter = 'high',
              safe_mode = 1,
              age_range_min = CASE 
                WHEN age_range_min < 13 THEN 13
                WHEN age_range_min > ? THEN ?
                ELSE age_range_min
              END,
              age_range_max = CASE
                WHEN age_range_max < ? THEN ?
                ELSE age_range_max
              END
          WHERE user_id = ?
        `).run(user.age + 2, user.age + 2, user.age - 2, user.age - 2, userId);
      } else {
        // Create settings with teen-safe defaults
        database.prepare(`
          INSERT INTO user_settings (
            user_id, theme, connection_quality, auto_skip_mismatch,
            min_chat_duration, profanity_filter, show_typing_indicator,
            safe_mode, age_range_min, age_range_max
          ) VALUES (?, 'dark', 'auto', 0, 0, 'high', 1, 1, ?, ?)
        `).run(userId, Math.max(13, user.age - 2), user.age + 2);
      }

      console.log(`✓ Teen safety defaults applied for user ${userId} (age: ${user.age})`);
    }
  } catch (error) {
    console.error('Error applying teen safety defaults:', error);
  }
}

export function validateTeenSafetyRules(userId, partnerId) {
  try {
    const user = database.prepare('SELECT age FROM users WHERE id = ?').get(userId);
    const partner = database.prepare('SELECT age FROM users WHERE id = ?').get(partnerId);

    if (!user || !partner || !user.age || !partner.age) {
      return { allowed: true };
    }

    const userIsTeen = user.age < 18;
    const partnerIsTeen = partner.age < 18;

    // Teen safety rules
    if (userIsTeen) {
      const ageDifference = Math.abs(user.age - partner.age);
      
      // Teens should match within similar age range (max 2 years difference for 13-15, 3 years for 16-17)
      const maxAgeDiff = user.age < 16 ? 2 : 3;
      
      if (ageDifference > maxAgeDiff) {
        return {
          allowed: false,
          reason: 'Age difference too large for teen safety'
        };
      }

      // Teens under 16 should not match with adults
      if (user.age < 16 && !partnerIsTeen) {
        return {
          allowed: false,
          reason: 'Teen safety: cannot match minors with adults'
        };
      }
    }

    return { allowed: true };
  } catch (error) {
    console.error('Error validating teen safety rules:', error);
    return { allowed: true }; // Fail open to avoid blocking legitimate matches
  }
}

export function getSessionTimeLimits(userId) {
  try {
    const user = database.prepare('SELECT age FROM users WHERE id = ?').get(userId);
    
    if (!user || !user.age) {
      return null;
    }

    // Session time limits for teens (in minutes)
    if (user.age < 14) {
      return {
        maxSessionLength: 30, // 30 minutes per session
        maxDailyUsage: 120,   // 2 hours per day
        warningAt: 25         // Warn at 25 minutes
      };
    } else if (user.age < 16) {
      return {
        maxSessionLength: 45,
        maxDailyUsage: 180,   // 3 hours per day
        warningAt: 40
      };
    } else if (user.age < 18) {
      return {
        maxSessionLength: 60,
        maxDailyUsage: 240,   // 4 hours per day
        warningAt: 55
      };
    }

    return null; // No limits for adults
  } catch (error) {
    console.error('Error getting session time limits:', error);
    return null;
  }
}

export function logTeenActivity(userId, activityType, metadata = {}) {
  try {
    // Log teen activity for safety monitoring
    database.prepare(`
      INSERT INTO teen_activity_log (
        user_id, activity_type, metadata, created_at
      ) VALUES (?, ?, ?, datetime('now'))
    `).run(userId, activityType, JSON.stringify(metadata));
  } catch (error) {
    // Table might not exist yet, create it
    try {
      database.exec(`
        CREATE TABLE IF NOT EXISTS teen_activity_log (
          id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          user_id TEXT NOT NULL,
          activity_type TEXT NOT NULL,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
      `);
      
      // Try logging again
      database.prepare(`
        INSERT INTO teen_activity_log (
          user_id, activity_type, metadata, created_at
        ) VALUES (?, ?, ?, datetime('now'))
      `).run(userId, activityType, JSON.stringify(metadata));
    } catch (createError) {
      console.error('Error creating teen activity log table:', createError);
    }
  }
}
