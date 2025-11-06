import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const VALID_IDENTITIES = new Set(['male', 'female', 'multiple']);

function normalizeIdentity(value, fallback) {
  if (!value) {
    return fallback;
  }
  const normalized = String(value).toLowerCase();
  if (!VALID_IDENTITIES.has(normalized)) {
    return fallback;
  }
  return normalized;
}

function normalizeCountry(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return fallback;
  }
  return trimmed.slice(0, 64);
}

// Get current user profile
router.get('/me', authenticateToken, (req, res) => {
  try {
    res.json({ user: req.user });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user' });
  }
});

// Update user settings
router.put('/me', authenticateToken, async (req, res) => {
  try {
    const { identity, country } = req.body;
    const { userQueries } = await import('../database/db.js');

    if (!identity && !country) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const user = userQueries.findById.get(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const nextIdentity = normalizeIdentity(identity, user.identity);
    const nextCountry = normalizeCountry(country, user.country);

    userQueries.update.run(user.name, nextIdentity, nextCountry, user.id);
    const updatedUser = userQueries.findById.get(user.id);
    res.json({ user: updatedUser });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export { router as userRouter };
