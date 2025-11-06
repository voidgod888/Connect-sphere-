import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { v4 as uuidv4 } from 'uuid';
import { userQueries, sessionQueries } from '../database/db.js';
import { verifyAppleIdentityToken } from '../services/appleAuth.js';

const router = express.Router();

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

    const session = sessionQueries.findByToken.get(token);

    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired token' });
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
