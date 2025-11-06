import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { userQueries, sessionQueries } from '../database/db.js';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Verify Google token and authenticate user
router.post('/google', async (req, res) => {
  try {
    const { token, identity, country, preference } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }

    const { email, name, sub: googleId } = payload;

    // Find or create user
    let user = userQueries.findByGoogleId.get(googleId);
    
    if (!user) {
      // Check if user exists by email
      user = userQueries.findByEmail.get(email);
      if (user) {
        // Update with Google ID if missing
        user.google_id = googleId;
      } else {
        // Create new user
        const userId = `user_${uuidv4()}`;
        userQueries.create.run(
          userId,
          name || email.split('@')[0],
          email,
          googleId,
          identity || 'male',
          country || 'Global'
        );
        user = userQueries.findById.get(userId);
      }
    }

    // Update user settings if provided
    if (identity || country) {
      userQueries.update.run(
        user.name,
        identity || user.identity,
        country || user.country,
        user.id
      );
      user = userQueries.findById.get(user.id);
    }

    // Create session
    const sessionId = uuidv4();
    const sessionToken = `session_${uuidv4()}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    sessionQueries.create.run(
      sessionId,
      user.id,
      sessionToken,
      expiresAt.toISOString()
    );

    // Update last seen
    userQueries.updateLastSeen.run(user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token: sessionToken,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Mock login endpoint for development (if Google auth is not configured)
router.post('/mock', async (req, res) => {
  try {
    const { email, name, identity, country } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find or create user
    let user = userQueries.findByEmail.get(email);
    
    if (!user) {
      const userId = `user_${uuidv4()}`;
      userQueries.create.run(
        userId,
        name || email.split('@')[0],
        email,
        null, // No Google ID for mock
        identity || 'male',
        country || 'Global'
      );
      user = userQueries.findById.get(userId);
    } else {
      // Update settings if provided
      if (identity || country) {
        userQueries.update.run(
          user.name,
          identity || user.identity,
          country || user.country,
          user.id
        );
        user = userQueries.findById.get(user.id);
      }
    }

    // Create session
    const sessionId = uuidv4();
    const sessionToken = `session_${uuidv4()}_${Date.now()}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    sessionQueries.create.run(
      sessionId,
      user.id,
      sessionToken,
      expiresAt.toISOString()
    );

    userQueries.updateLastSeen.run(user.id);

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      },
      token: sessionToken,
      expiresAt: expiresAt.toISOString()
    });

  } catch (error) {
    console.error('Mock authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (token) {
      sessionQueries.deleteByToken.run(token);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ error: 'Logout failed' });
  }
});

// Verify session
router.get('/verify', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const session = sessionQueries.findByToken.get(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    const user = userQueries.findById.get(session.user_id);
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Session verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

export { router as authRouter };
