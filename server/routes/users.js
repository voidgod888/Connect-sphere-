import express from 'express';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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
    
    // Input validation
    const validIdentities = ['male', 'female', 'multiple'];
    if (identity && !validIdentities.includes(identity)) {
      return res.status(400).json({ error: 'Invalid identity value' });
    }

    if (country && (typeof country !== 'string' || country.length > 100)) {
      return res.status(400).json({ error: 'Invalid country value' });
    }

    if (identity || country) {
      const user = userQueries.findById.get(req.user.id);
      if (user) {
        // Sanitize country input
        const sanitizedCountry = country ? country.trim().slice(0, 100) : user.country;
        const sanitizedIdentity = identity || user.identity;
        
        userQueries.update.run(
          user.name,
          sanitizedIdentity,
          sanitizedCountry,
          user.id
        );
        const updatedUser = userQueries.findById.get(user.id);
        res.json({ user: updatedUser });
      } else {
        res.status(404).json({ error: 'User not found' });
      }
    } else {
      res.status(400).json({ error: 'No fields to update' });
    }
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

export { router as userRouter };
