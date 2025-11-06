import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import session from 'express-session';
import passport from 'passport';
import dotenv from 'dotenv';
import { UserModel } from './models/User.js';
import { MatchingService } from './services/MatchingService.js';
import { SocketService } from './services/SocketService.js';
import { setupPassport } from './config/passport.js';
import authRoutes from './routes/auth.js';
import apiRoutes from './routes/api.js';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'connectsphere-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  },
});

app.use(sessionMiddleware);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize models and services
const userModel = new UserModel();
const matchingService = new MatchingService(userModel);

// Setup Passport
setupPassport(userModel);

// Setup Socket.io
const io = new Server(httpServer, {
  cors: corsOptions,
});

// Share session with socket.io
io.engine.use(sessionMiddleware);

// Initialize socket service
new SocketService(io, userModel, matchingService);

// Routes
app.use('/auth', authRoutes);
app.use('/api', apiRoutes);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'ConnectSphere Backend API',
    version: '1.0.0',
    endpoints: {
      auth: {
        google: '/auth/google',
        user: '/auth/user',
        logout: '/auth/logout',
      },
      api: {
        health: '/api/health',
        stats: '/api/stats',
      },
    },
  });
});

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// Start server
const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`🚀 ConnectSphere backend server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🌍 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  console.log(`🔐 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  httpServer.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
