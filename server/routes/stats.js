import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import {
  statsQueries,
  achievementQueries,
  ratingQueries,
  countryQueries,
  database
} from '../database/db.js';

export const statsRouter = express.Router();

// Get user stats
statsRouter.get('/me', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;

    // Get basic stats
    let stats = statsQueries.getUserStats.get(userId);
    if (!stats) {
      statsQueries.createUserStats.run(userId);
      stats = statsQueries.getUserStats.get(userId) || {
        user_id: userId,
        total_chats: 0,
        total_minutes: 0,
        current_streak: 0,
        longest_streak: 0,
        last_chat_date: null
      };
    }

    // Get achievements
    const achievements = achievementQueries.getUserAchievements.all(userId);

    // Get ratings
    const ratingData = ratingQueries.getAverageRating.get(userId) || {
      avg_rating: 0,
      total_ratings: 0
    };

    // Get countries
    const countries = countryQueries.getUserCountries.all(userId);

    // Calculate rank (simplified - in production use a more efficient query)
    const allStats = database.prepare('SELECT user_id FROM user_stats ORDER BY total_chats DESC').all();
    const rank = allStats.findIndex(s => s.user_id === userId) + 1;

    res.json({
      totalChats: stats.total_chats,
      totalMinutes: stats.total_minutes,
      countriesConnected: countries.map(c => c.country),
      currentStreak: stats.current_streak,
      longestStreak: stats.longest_streak,
      averageRating: parseFloat(ratingData.avg_rating) || 0,
      totalRatings: ratingData.total_ratings,
      achievements: achievements.map(a => ({
        id: a.id,
        name: a.name,
        description: a.description,
        icon: a.icon,
        progress: a.progress,
        maxProgress: a.max_progress,
        unlockedAt: a.unlocked_at
      })),
      rank: rank > 0 ? rank : undefined
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get leaderboard
statsRouter.get('/leaderboard', authenticateToken, (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 100;

    const leaderboard = database.prepare(`
      SELECT 
        u.id as userId,
        COALESCE(u.username, u.name) as username,
        s.total_chats as score
      FROM user_stats s
      JOIN users u ON s.user_id = u.id
      ORDER BY s.total_chats DESC
      LIMIT ?
    `).all(limit);

    const entries = leaderboard.map((entry, index) => ({
      userId: entry.userId,
      username: entry.username,
      rank: index + 1,
      score: entry.score
    }));

    res.json({ entries });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({ error: 'Failed to fetch leaderboard' });
  }
});

// Rate a user after a chat
statsRouter.post('/rate', authenticateToken, (req, res) => {
  try {
    const { ratedId, matchId, rating } = req.body;
    const raterId = req.user.id;

    if (!ratedId || !matchId || !rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Invalid rating data' });
    }

    if (raterId === ratedId) {
      return res.status(400).json({ error: 'Cannot rate yourself' });
    }

    const ratingId = uuidv4();
    ratingQueries.addRating.run(ratingId, raterId, ratedId, matchId, rating);

    // Check for achievement unlock (highly rated)
    const ratingData = ratingQueries.getAverageRating.get(ratedId);
    if (ratingData && rating === 5) {
      updateAchievementProgress(ratedId, 'highly_rated', 1);
    }

    res.json({ success: true });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint')) {
      return res.status(400).json({ error: 'You have already rated this match' });
    }
    console.error('Error adding rating:', error);
    res.status(500).json({ error: 'Failed to add rating' });
  }
});

// Helper function to update achievement progress
function updateAchievementProgress(userId, achievementId, incrementBy = 1) {
  try {
    const achievement = database.prepare('SELECT * FROM achievements WHERE id = ?').get(achievementId);
    if (!achievement) return;

    const userAchievement = database.prepare(
      'SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?'
    ).get(userId, achievementId);

    const currentProgress = userAchievement ? userAchievement.progress : 0;
    const newProgress = currentProgress + incrementBy;
    const unlocked = newProgress >= achievement.max_progress ? new Date().toISOString() : null;

    const id = userAchievement ? userAchievement.id : uuidv4();
    achievementQueries.updateAchievementProgress.run(
      id,
      userId,
      achievementId,
      Math.min(newProgress, achievement.max_progress),
      unlocked
    );
  } catch (error) {
    console.error('Error updating achievement:', error);
  }
}

export { updateAchievementProgress };
