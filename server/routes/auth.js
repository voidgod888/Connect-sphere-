import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { userQueries, sessionQueries } from '../database/db.js';
import { verifyAppleIdentityToken } from '../services/appleAuth.js';

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

const googleClientId = process.env.GOOGLE_CLIENT_ID;
if (!googleClientId) {
  console.warn('⚠️  GOOGLE_CLIENT_ID is not set. Google authentication requests will fail.');
}

const googleClient = new OAuth2Client(googleClientId);

const VALID_IDENTITIES = new Set(['male', 'female', 'multiple']);
const DEFAULT_IDENTITY = 'male';
const DEFAULT_COUNTRY = 'Global';

const allowMockAuth = process.env.ALLOW_MOCK_AUTH === 'true';

function normalizeIdentity(value) {
  if (!value) return undefined;
  const normalized = String(value).toLowerCase();
  if (!VALID_IDENTITIES.has(normalized)) {
    return undefined;
  }
  return normalized;
}

function normalizeCountry(value) {
  if (!value || typeof value !== 'string') {
    return undefined;
  }
  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }
  return trimmed.slice(0, 64);
}

function normalizeName(value, fallback) {
  if (typeof value !== 'string') {
    return fallback;
  }
  const sanitized = value.replace(/\s+/g, ' ').trim().slice(0, 64);
  return sanitized || fallback;
}

function ensureEmail(value) {
  if (!value || typeof value !== 'string') {
    throw new Error('Email is required');
  }
  return value.trim().toLowerCase();
}

function createSession(userId) {
  sessionQueries.cleanupExpired.run();

  const sessionId = uuidv4();
  const sessionToken = `session_${uuidv4()}_${Date.now()}`;
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  sessionQueries.create.run(sessionId, userId, sessionToken, expiresAt);

  return { token: sessionToken, expiresAt };
}

async function upsertUser({
  provider,
  providerId,
  email,
  name,
  identity,
  country,
}) {
  const normalizedEmail = ensureEmail(email);
  const normalizedIdentity = normalizeIdentity(identity) || undefined;
  const normalizedCountry = normalizeCountry(country) || undefined;
  const fallbackName = normalizedEmail.split('@')[0];
  const normalizedName = normalizeName(name, fallbackName);

  let user = null;

  if (provider === 'google' && providerId) {
    user = userQueries.findByGoogleId.get(providerId);
  } else if (provider === 'apple' && providerId) {
    user = userQueries.findByAppleId.get(providerId);
  }

  if (!user) {
    user = userQueries.findByEmail.get(normalizedEmail);
  }

  if (!user) {
    const userId = `user_${uuidv4()}`;
    try {
      userQueries.create.run(
        userId,
        normalizedName,
        normalizedEmail,
        provider === 'google' ? providerId : null,
        provider === 'apple' ? providerId : null,
        normalizedIdentity || DEFAULT_IDENTITY,
        normalizedCountry || DEFAULT_COUNTRY
      );
    } catch (error) {
      if (String(error.message).includes('UNIQUE constraint failed')) {
        // Another request created the user before us; fetch the latest record.
      } else {
        throw error;
      }
    }

    user = userQueries.findById.get(userId) || userQueries.findByEmail.get(normalizedEmail);
  }

  if (!user) {
    throw new Error('Unable to load user after creation');
  }

  if (provider === 'google' && providerId && !user.google_id) {
    userQueries.linkGoogleId.run(providerId, user.id);
  }

  if (provider === 'apple' && providerId && !user.apple_id) {
    userQueries.linkAppleId.run(providerId, user.id);
  }

  const targetName = normalizeName(name, user.name || fallbackName);
  const targetIdentity = normalizedIdentity || user.identity || DEFAULT_IDENTITY;
  const targetCountry = normalizedCountry || user.country || DEFAULT_COUNTRY;

  if (
    targetName !== user.name ||
    targetIdentity !== user.identity ||
    targetCountry !== user.country
  ) {
    userQueries.update.run(targetName, targetIdentity, targetCountry, user.id);
  } else {
    userQueries.updateLastSeen.run(user.id);
  }

  return userQueries.findById.get(user.id);
}

function respondWithSession(res, user, session) {
  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    token: session.token,
    expiresAt: session.expiresAt,
  });
}

// Google OAuth
router.post('/google', async (req, res) => {
  try {
    const { token, identity, country } = req.body;

    // Input validation
    const validationErrors = validateInput({ token }, {
      token: { required: true, type: 'string' }
    });

    if (validationErrors.length > 0) {
      return res.status(400).json({ error: validationErrors.join(', ') });
    if (typeof token !== 'string' || !token.trim()) {
      return res.status(400).json({ error: 'Google token is required' });
    }

    let ticket;
    try {
      ticket = await googleClient.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });
    } catch (error) {
      console.error('Google token verification failed:', error);
      return res.status(401).json({ error: 'Invalid Google token' });
    }

    const payload = ticket.getPayload();
    if (!payload) {
      return res.status(401).json({ error: 'Invalid Google token payload' });
    }

    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (!emailVerified) {
      return res.status(401).json({ error: 'Google account email is not verified' });
    }

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
    const user = await upsertUser({
      provider: 'google',
      providerId: payload.sub,
      email: payload.email,
      name: payload.name,
      identity,
      country,
    });

    const session = createSession(user.id);
    return respondWithSession(res, user, session);
  } catch (error) {
    console.error('Authentication error:', error);
    const message = error instanceof Error && error.message === 'Email is required'
      ? error.message
      : 'Authentication failed';
    return res.status(message === 'Email is required' ? 400 : 500).json({ error: message });
  }
});

// Apple Sign-In
router.post('/apple', async (req, res) => {
  try {
    const { identityToken, fullName, identity, country } = req.body;

    if (typeof identityToken !== 'string' || !identityToken.trim()) {
      return res.status(400).json({ error: 'Apple identity token is required' });
    }

    let payload;
    try {
      payload = await verifyAppleIdentityToken(identityToken);
    } catch (error) {
      console.error('Apple identity token verification failed:', error);
      return res.status(401).json({ error: 'Invalid Apple identity token' });
    }

    const emailVerified = payload.email_verified === true || payload.email_verified === 'true';
    if (!emailVerified) {
      return res.status(401).json({ error: 'Apple account email is not verified' });
    }

    if (!payload.email) {
      return res.status(400).json({ error: 'Apple account email is required' });
    }

    const namePayload = fullName && typeof fullName === 'string' ? fullName : payload.name;

    const user = await upsertUser({
      provider: 'apple',
      providerId: payload.sub,
      email: payload.email,
      name: namePayload,
      identity,
      country,
    });

    const session = createSession(user.id);
    return respondWithSession(res, user, session);
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
    console.error('Apple authentication error:', error);
    const message = error instanceof Error && error.message === 'Email is required'
      ? error.message
      : 'Authentication failed';
    return res.status(message === 'Email is required' ? 400 : 500).json({ error: message });
  }
});

// Mock login endpoint (disabled by default)
router.post('/mock', async (req, res) => {
  if (!allowMockAuth) {
    return res.status(403).json({ error: 'Mock authentication is disabled' });
  }

  try {
    const { email, name, identity, country } = req.body;

    const user = await upsertUser({
      provider: 'mock',
      providerId: null,
      email,
      name,
      identity,
      country,
    });

    const session = createSession(user.id);
    return respondWithSession(res, user, session);
  } catch (error) {
    console.error('Apple authentication error:', error);
    res.status(500).json({ error: 'Authentication failed' });
    console.error('Mock authentication error:', error);
    const message = error instanceof Error && error.message === 'Email is required'
      ? error.message
      : 'Authentication failed';
    return res.status(message === 'Email is required' ? 400 : 500).json({ error: message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (token) {
      sessionQueries.deleteByToken.run(token);
    }

    sessionQueries.cleanupExpired.run();

    return res.json({ success: true });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Logout failed' });
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

    userQueries.updateLastSeen.run(user.id);

    return res.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Session verification error:', error);
    return res.status(500).json({ error: 'Verification failed' });
  }
});

export { router as authRouter };
