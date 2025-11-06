import { sessionQueries, userQueries } from '../database/db.js';

export function authenticateToken(req, res, next) {
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

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      identity: user.identity,
      country: user.country
    };

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
}
