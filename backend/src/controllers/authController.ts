import { Request, Response } from 'express';
import passport from 'passport';

export const googleAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
});

export const googleAuthCallback = passport.authenticate('google', {
  failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173',
});

export const googleAuthCallbackSuccess = (req: Request, res: Response) => {
  // Redirect to frontend after successful authentication
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
  res.redirect(frontendUrl);
};

export const getCurrentUser = (req: Request, res: Response) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
};

export const logout = (req: Request, res: Response) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.json({ message: 'Logged out successfully' });
  });
};
