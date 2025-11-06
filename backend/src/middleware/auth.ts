import { Request, Response, NextFunction } from 'express';

export function ensureAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: 'Not authenticated' });
}

export function ensureAuthenticatedSocket(socket: any, next: any) {
  const session = socket.request.session;
  if (session && session.passport && session.passport.user) {
    return next();
  }
  next(new Error('Not authenticated'));
}
