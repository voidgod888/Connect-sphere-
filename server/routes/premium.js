import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { authenticateToken } from '../middleware/auth.js';
import { transactionQueries, database } from '../database/db.js';

export const premiumRouter = express.Router();

// Upgrade subscription
premiumRouter.post('/upgrade', authenticateToken, (req, res) => {
  try {
    const { tier } = req.body;
    const userId = req.user.id;

    if (!['free', 'premium', 'vip'].includes(tier)) {
      return res.status(400).json({ error: 'Invalid subscription tier' });
    }

    // Update user subscription
    database.prepare('UPDATE users SET subscription_tier = ? WHERE id = ?').run(tier, userId);

    // Award coins for paid tiers
    let coinsToAward = 0;
    if (tier === 'premium') coinsToAward = 500;
    if (tier === 'vip') coinsToAward = 1200;

    if (coinsToAward > 0) {
      const transactionId = uuidv4();
      transactionQueries.create.run(
        transactionId,
        userId,
        coinsToAward,
        'reward',
        `Subscription upgrade to ${tier}`
      );
      transactionQueries.updateUserCoins.run(coinsToAward, userId);
    }

    const updatedUser = database.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    res.json({
      success: true,
      subscription: updatedUser.subscription_tier,
      coins: updatedUser.coins
    });
  } catch (error) {
    console.error('Error upgrading subscription:', error);
    res.status(500).json({ error: 'Failed to upgrade subscription' });
  }
});

// Purchase coins
premiumRouter.post('/coins/purchase', authenticateToken, (req, res) => {
  try {
    const { amount } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid coin amount' });
    }

    const transactionId = uuidv4();
    transactionQueries.create.run(
      transactionId,
      userId,
      amount,
      'purchase',
      `Purchased ${amount} coins`
    );
    transactionQueries.updateUserCoins.run(amount, userId);

    const updatedUser = database.prepare('SELECT coins FROM users WHERE id = ?').get(userId);

    res.json({
      success: true,
      coins: updatedUser.coins
    });
  } catch (error) {
    console.error('Error purchasing coins:', error);
    res.status(500).json({ error: 'Failed to purchase coins' });
  }
});

// Boost profile
premiumRouter.post('/boost', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const boostCost = 100; // coins

    const user = database.prepare('SELECT * FROM users WHERE id = ?').get(userId);

    if (user.coins < boostCost) {
      return res.status(400).json({ error: 'Insufficient coins' });
    }

    // Deduct coins
    const transactionId = uuidv4();
    transactionQueries.create.run(
      transactionId,
      userId,
      -boostCost,
      'spend',
      'Profile boost (24 hours)'
    );
    transactionQueries.updateUserCoins.run(-boostCost, userId);

    // Set boost expiration (24 hours)
    const boostUntil = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    database.prepare('UPDATE users SET profile_boost_until = ? WHERE id = ?').run(boostUntil, userId);

    res.json({
      success: true,
      profileBoostUntil: boostUntil,
      coins: user.coins - boostCost
    });
  } catch (error) {
    console.error('Error boosting profile:', error);
    res.status(500).json({ error: 'Failed to boost profile' });
  }
});

// Set custom username
premiumRouter.post('/username', authenticateToken, (req, res) => {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username || username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: 'Username must be 3-20 characters' });
    }

    // Check if username is taken
    const existing = database.prepare('SELECT id FROM users WHERE username = ? AND id != ?').get(username, userId);
    if (existing) {
      return res.status(400).json({ error: 'Username already taken' });
    }

    // Check if user has premium
    const user = database.prepare('SELECT subscription_tier FROM users WHERE id = ?').get(userId);
    if (user.subscription_tier === 'free') {
      return res.status(403).json({ error: 'Premium subscription required' });
    }

    database.prepare('UPDATE users SET username = ? WHERE id = ?').run(username, userId);

    res.json({ success: true, username });
  } catch (error) {
    console.error('Error setting username:', error);
    res.status(500).json({ error: 'Failed to set username' });
  }
});

// Get transaction history
premiumRouter.get('/transactions', authenticateToken, (req, res) => {
  try {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;

    const transactions = database.prepare(`
      SELECT * FROM transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    `).all(userId, limit);

    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});
