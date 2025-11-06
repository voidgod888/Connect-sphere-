import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { userQueries, sessionQueries } from '../database/db.js';

const router = express.Router();

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  console.error('ERROR: GOOGLE_CLIENT_ID environment variable is required');
  process.exit(1);
}

// Apple Sign-In configuration (optional - will be validated when used)
const APPLE_CLIENT_ID = process.env.APPLE_CLIENT_ID;
const APPLE_TEAM_ID = process.env.APPLE_TEAM_ID;
const APPLE_KEY_ID = process.env.APPLE_KEY_ID;
const APPLE_PRIVATE_KEY = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Input validation helper
function validateInput(data, schema) {
  const errors = [];
  for (const [key, validator] of Object.entries(schema)) {
    if (validator.required && !data[key]) {
      errors.push(`${key} is required`);
    }
    if (data[key] && validator.type && typeof data[key] !== validator.type) {
      errors.push(`${key} must be a ${validator.type}`);
    }
    if (data[key] && validator.maxLength && data[key].length > validator.maxLength) {
      errors.push(`${key} must be less than ${validator.maxLength} characters`);
    }
  }
  return errors;
}

// Sanitize string input
function sanitizeString(str) {
  if (typeof str !== 'string') return '';
  return str.trim().slice(0, 500);
}

// Verify Google token and authenticate user
router.post('/google', async (req, res) => {
  try {
    const { token, identity, country } = req.body;

    // Input validation
    const validationErrors = validateInput({ token }, {
      token: { required: true, type: 'string' }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    }

    // Verify Google token
    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
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

    if (!email || !googleId) {
      return res.status(401).json({ error: 'Invalid token payload: missing email or Google ID' });
    }

    // Sanitize inputs
    const sanitizedIdentity = identity && ['male', 'female', 'multiple'].includes(identity) 
      ? identity 
      : 'male';
    const sanitizedCountry = sanitizeString(country || 'Global');

    // Find or create user
    let user = userQueries.findByGoogleId.get(googleId);
    
    if (!user) {
      // Check if user exists by email
      user = userQueries.findByEmail.get(email);
      if (user) {
        // User exists but doesn't have this Google ID
        // If they have an Apple ID, create a new account (can't link easily)
        // If they don't have any OAuth ID, we should update them (but SQLite makes this tricky)
        // For now, if user exists with same email but different OAuth, create new account
        // In production, you might want to implement account linking
        if (!user.google_id && !user.apple_id) {
          // User exists but has no OAuth ID - this shouldn't happen with new schema
          // But handle gracefully by creating new account
          const userId = `user_${uuidv4()}`;
          userQueries.create.run(
            userId,
            sanitizeString(name || email.split('@')[0]),
            email,
            googleId,
            null, // apple_id
            sanitizedIdentity,
            sanitizedCountry
          );
          user = userQueries.findById.get(userId);
        } else {
          // User has different OAuth provider - create new account
          const userId = `user_${uuidv4()}`;
          userQueries.create.run(
            userId,
            sanitizeString(name || email.split('@')[0]),
            email,
            googleId,
            null, // apple_id
            sanitizedIdentity,
            sanitizedCountry
          );
          user = userQueries.findById.get(userId);
        }
      } else {
        // Create new user
        const userId = `user_${uuidv4()}`;
        userQueries.create.run(
          userId,
          sanitizeString(name || email.split('@')[0]),
          email,
          googleId,
          null, // apple_id
          sanitizedIdentity,
          sanitizedCountry
        );
        user = userQueries.findById.get(userId);
      }
    }

    // Update user settings if provided
    if (identity || country) {
      userQueries.update.run(
        user.name,
        sanitizedIdentity,
        sanitizedCountry,
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
    console.error('Google authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
});

// Verify Apple Sign-In token and authenticate user
router.post('/apple', async (req, res) => {
  try {
    const { identity_token, authorization_code, identity, country } = req.body;

    // Input validation
    if (!identity_token && !authorization_code) {
      return res.status(400).json({ error: 'Apple identity_token or authorization_code is required' });
    }

    let appleId, email, name;

    if (identity_token) {
      // Verify Apple identity token
      try {
        // Decode the token (first part is header, second is payload, third is signature)
        const tokenParts = identity_token.split('.');
        if (tokenParts.length !== 3) {
          return res.status(401).json({ error: 'Invalid Apple token format' });
        }

        // Decode payload (base64url - Apple uses base64url encoding)
        // Convert base64url to base64
        let base64 = tokenParts[1].replace(/-/g, '+').replace(/_/g, '/');
        // Add padding if needed
        while (base64.length % 4) {
          base64 += '=';
        }
        const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
        
        // Verify token claims
        if (payload.iss !== 'https://appleid.apple.com') {
          return res.status(401).json({ error: 'Invalid token issuer' });
        }

        if (APPLE_CLIENT_ID && payload.aud !== APPLE_CLIENT_ID) {
          return res.status(401).json({ error: 'Invalid token audience' });
        }

        // Check expiration
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return res.status(401).json({ error: 'Token expired' });
        }

        appleId = payload.sub;
        email = payload.email;
        name = payload.name || (email ? email.split('@')[0] : null);
      } catch (error) {
        console.error('Apple token verification failed:', error);
        return res.status(401).json({ error: 'Invalid Apple token' });
      }
    } else {
      // If authorization_code is provided, we would exchange it for tokens
      // For now, we'll require identity_token for simplicity
      return res.status(400).json({ error: 'identity_token is required for Apple Sign-In' });
    }

    if (!appleId) {
      return res.status(401).json({ error: 'Invalid Apple token: missing user ID' });
    }

    // Sanitize inputs
    const sanitizedIdentity = identity && ['male', 'female', 'multiple'].includes(identity) 
      ? identity 
      : 'male';
    const sanitizedCountry = sanitizeString(country || 'Global');

    // Find or create user
    let user = userQueries.findByAppleId.get(appleId);
    
    if (!user) {
      // Check if user exists by email
      if (email) {
        user = userQueries.findByEmail.get(email);
        if (user && !user.apple_id) {
          // User exists but doesn't have Apple ID - create new account
          // (In production, you might want to link accounts)
          const userId = `user_${uuidv4()}`;
          userQueries.create.run(
            userId,
            sanitizeString(name || email.split('@')[0]),
            email,
            null, // google_id
            appleId,
            sanitizedIdentity,
            sanitizedCountry
          );
          user = userQueries.findById.get(userId);
        }
      }
      
      if (!user) {
        // Create new user
        const userId = `user_${uuidv4()}`;
        const userEmail = email || `apple_${appleId}@appleid.local`;
        userQueries.create.run(
          userId,
          sanitizeString(name || userEmail.split('@')[0]),
          userEmail,
          null, // google_id
          appleId,
          sanitizedIdentity,
          sanitizedCountry
        );
        user = userQueries.findById.get(userId);
      }
    }

    // Update user settings if provided
    if (identity || country) {
      userQueries.update.run(
        user.name,
        sanitizedIdentity,
        sanitizedCountry,
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
    console.error('Apple authentication error:', error);
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

    // Validate token format
    if (typeof token !== 'string' || token.length < 10) {
      return res.status(401).json({ error: 'Invalid token format' });
    }

    const session = sessionQueries.findByToken.get(token);
    
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      sessionQueries.deleteByToken.run(token);
      return res.status(401).json({ error: 'Session expired' });
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
