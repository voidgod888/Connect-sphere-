import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { initDatabase } from './database/db.js';
import { authRouter } from './routes/auth.js';
import { userRouter } from './routes/users.js';
import { socketHandler } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const allowedOrigins = (process.env.CLIENT_URLS || process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const io = new Server(httpServer, {
  cors: {
    origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

const PORT = process.env.PORT || 3001;

// Middleware
app.disable('x-powered-by');

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : ['http://localhost:3000'],
  credentials: true,
}));

app.use(express.json({ limit: '1mb' }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});

app.use('/api/', apiLimiter);

// Initialize database
initDatabase();

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', userRouter);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
io.on('connection', (socket) => {
  socketHandler(socket, io);
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
});

export { io };
