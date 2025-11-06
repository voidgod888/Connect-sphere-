import { Router, Request, Response } from 'express';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

// Health check endpoint
router.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: Date.now() });
});

// Get user stats (optional)
router.get('/stats', ensureAuthenticated, (req: Request, res: Response) => {
  res.json({
    user: req.user,
    timestamp: Date.now(),
  });
});

export default router;
