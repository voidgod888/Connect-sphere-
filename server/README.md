# ConnectSphere Backend Server

Backend API server for ConnectSphere video chat application.

## Features

- User authentication (Google OAuth + Mock for development)
- Real-time partner matching
- WebSocket-based chat messaging
- WebRTC signaling for video connections
- User blocking and reporting
- SQLite database for data persistence

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

3. Configure environment variables:
- `PORT`: Server port (default: 3001)
- `CLIENT_URL`: Frontend URL (default: http://localhost:3000)
- `GOOGLE_CLIENT_ID`: Google OAuth Client ID (optional for mock auth)
- `DATABASE_PATH`: Path to SQLite database file

4. Start the server:
```bash
npm run dev  # Development mode with auto-reload
# or
npm start    # Production mode
```

## API Endpoints

### Authentication
- `POST /api/auth/google` - Authenticate with Google token
- `POST /api/auth/mock` - Mock authentication for development
- `POST /api/auth/logout` - Logout and invalidate session
- `GET /api/auth/verify` - Verify current session token

### Users
- `GET /api/users/me` - Get current user profile
- `PUT /api/users/me` - Update user settings

### Health
- `GET /api/health` - Health check endpoint

## WebSocket Events

### Client → Server
- `authenticate` - Authenticate socket connection with token
- `join-queue` - Join matching queue
- `leave-queue` - Leave matching queue
- `send-message` - Send chat message
- `offer` - WebRTC offer
- `answer` - WebRTC answer
- `ice-candidate` - WebRTC ICE candidate
- `end-match` - End current match
- `report-user` - Report and block user

### Server → Client
- `match-found` - Match found notification
- `new-message` - New chat message received
- `match-ended` - Match ended notification
- `offer` - WebRTC offer from partner
- `answer` - WebRTC answer from partner
- `ice-candidate` - WebRTC ICE candidate from partner

## Database Schema

The database automatically initializes on first run with the following tables:
- `users` - User accounts
- `sessions` - Active user sessions
- `matches` - Match records
- `messages` - Chat messages
- `blocks` - User blocks
- `reports` - User reports
