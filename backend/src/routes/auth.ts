import { Router } from 'express';
import {
  googleAuth,
  googleAuthCallback,
  googleAuthCallbackSuccess,
  getCurrentUser,
  logout,
} from '../controllers/authController.js';
import { ensureAuthenticated } from '../middleware/auth.js';

const router = Router();

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleAuthCallback, googleAuthCallbackSuccess);

// User info and logout
router.get('/user', ensureAuthenticated, getCurrentUser);
router.post('/logout', ensureAuthenticated, logout);

export default router;
