<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ConnectSphere - Video Chat Application

A real-time video chat application similar to Omegle, built with React, TypeScript, Node.js, and WebRTC.

View your app in AI Studio: https://ai.studio/apps/drive/1ofeiJrs9NpD6RVASf3zfsigHOpHV4ncW

## 📋 Table of Contents

- [Features](#features)
- [Architecture Overview](#architecture-overview)
- [Codebase Structure](#codebase-structure)
- [Detailed Component Documentation](#detailed-component-documentation)
- [Prerequisites](#prerequisites)
- [Setup and Build Instructions](#setup-and-build-instructions)
- [Termux One-Line Build](#termux-one-line-build)
- [API Documentation](#api-documentation)
- [Development Notes](#development-notes)

## ✨ Features

- 🔐 User authentication (Google OAuth + Mock for development)
- 🎥 Real-time video chat with partner matching
- 💬 WebSocket-based chat messaging
- 🎯 Partner preference filtering (gender-based)
- 🛡️ User reporting and blocking
- 📊 Gender detection using AI/ML (YOLO/COCO-SSD)
- 🌍 Country-based filtering
- 🔄 Real-time matchmaking queue system

## 🏗️ Architecture Overview

ConnectSphere follows a **client-server architecture** with real-time communication:

- **Frontend**: React + TypeScript + Vite (SPA)
- **Backend**: Node.js + Express + Socket.io (REST API + WebSocket)
- **Database**: SQLite (better-sqlite3) - can be swapped for PostgreSQL
- **Real-time**: WebSocket (Socket.io) for chat and signaling
- **Video**: WebRTC (signaling via Socket.io, currently using sample videos)
- **AI/ML**: YOLO/COCO-SSD for gender detection (runs in Web Worker)

## 📁 Codebase Structure

```
connectsphere/
├── components/              # React UI components
│   ├── ChatHistory.tsx     # Chat message history display
│   ├── ChatInput.tsx        # Message input component
│   ├── ChatScreen.tsx       # Main chat interface
│   ├── Controls.tsx         # Chat control buttons
│   ├── LoginScreen.tsx      # Authentication screen
│   ├── SettingsScreen.tsx  # User preferences/settings
│   ├── Toast.tsx            # Toast notification system
│   └── VideoPlayer.tsx      # Video player component
├── services/               # Frontend services
│   ├── api.ts              # REST API client
│   ├── socketService.ts    # WebSocket client service
│   ├── yoloService.ts      # Gender detection service
│   └── yolo.worker.ts      # Web Worker for ML model
├── server/                 # Backend server
│   ├── database/
│   │   └── db.js          # SQLite database setup & queries
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   ├── routes/
│   │   ├── auth.js        # Authentication routes
│   │   └── users.js       # User management routes
│   ├── services/
│   │   └── matching.js    # Partner matching algorithm
│   ├── socket/
│   │   └── socketHandler.js # WebSocket event handlers
│   └── index.js           # Express server entry point
├── App.tsx                 # Main React application component
├── index.tsx               # React DOM entry point
├── types.ts                # TypeScript type definitions
├── constants.ts            # Application constants
├── vite.config.ts          # Vite build configuration
└── package.json            # Frontend dependencies

```

## 📚 Detailed Component Documentation

### Frontend Components

#### `App.tsx` - Main Application Component
The root component managing application state and orchestration:
- **State Management**: Handles authentication, chat state, user settings, media streams
- **Key Functions**:
  - `handleLogin()`: Mock authentication (can be extended for Google OAuth)
  - `startChat()`: Initiates video chat, requests camera/mic permissions
  - `findNext()`: Joins matching queue to find a partner
  - `stopChat()`: Cleans up media streams and ends current match
  - `handleReport()`: Reports and blocks abusive users
- **Socket Integration**: Listens for match-found, new-message, match-ended events
- **Verification**: Uses YOLO service for gender verification when preference is set

#### `components/SettingsScreen.tsx`
User preference configuration:
- Identity selection (Male/Female/Multiple)
- Partner preference (Male/Female/Everyone)
- Country selection
- Validates settings before starting chat

#### `components/ChatScreen.tsx`
Main chat interface displaying:
- Local video stream (user's camera)
- Remote video stream (partner's video)
- Chat message history
- Control buttons (Next, Stop, Report)
- Verification status indicator

#### `components/LoginScreen.tsx`
Authentication interface:
- Mock login button (for development)
- Can be extended for Google OAuth integration

### Frontend Services

#### `services/api.ts` - REST API Client
HTTP client for backend communication:
- **Methods**:
  - `authMock()`: Mock authentication
  - `authGoogle()`: Google OAuth authentication
  - `verifySession()`: Check if user session is valid
  - `updateUserSettings()`: Update user preferences
  - `logout()`: End user session
- **Token Management**: Stores JWT tokens in localStorage

#### `services/socketService.ts` - WebSocket Client
Real-time communication service:
- **Connection**: Authenticates with token, handles reconnection
- **Queue Management**: `joinQueue()`, `leaveQueue()`
- **Chat**: `sendMessage()` for text messaging
- **Matching**: Listens for `match-found`, `match-ended` events
- **WebRTC Signaling**: `sendOffer()`, `sendAnswer()`, `sendIceCandidate()`

#### `services/yoloService.ts` - Gender Detection Service
AI/ML service for gender verification:
- **Model Loading**: Loads COCO-SSD model in Web Worker
- **Detection**: `detectGender()` analyzes video frames
- **Worker Communication**: Uses request/response pattern with unique IDs
- **Note**: Currently simulated - COCO-SSD doesn't detect gender, but architecture is ready

#### `services/yolo.worker.ts` - ML Model Worker
Web Worker running TensorFlow.js model:
- Loads COCO-SSD model for object detection
- Processes video frames sent from main thread
- Returns detection results asynchronously

### Backend Server

#### `server/index.js` - Express Server
Main server entry point:
- **HTTP Server**: Express app on port 3001 (configurable)
- **WebSocket Server**: Socket.io server for real-time events
- **Middleware**: CORS, JSON parsing, authentication
- **Routes**: `/api/auth/*`, `/api/users/*`, `/api/health`
- **Database**: Initializes SQLite on startup

#### `server/database/db.js` - Database Layer
SQLite database setup and queries:
- **Tables**:
  - `users`: User accounts (id, name, email, identity, country)
  - `sessions`: Active user sessions (token-based)
  - `matches`: Match records (user pairs, timestamps)
  - `messages`: Chat messages (match_id, sender_id, text)
  - `blocks`: User blocking relationships
  - `reports`: User reports for moderation
- **Queries**: Prepared statements for all CRUD operations
- **Indexes**: Optimized for common queries

#### `server/routes/auth.js` - Authentication Routes
User authentication endpoints:
- `POST /api/auth/mock`: Mock authentication (dev only)
- `POST /api/auth/google`: Google OAuth authentication
- `POST /api/auth/logout`: Invalidate session token
- `GET /api/auth/verify`: Verify current session

#### `server/routes/users.js` - User Management Routes
User profile endpoints:
- `GET /api/users/me`: Get current user profile
- `PUT /api/users/me`: Update user settings (identity, country)

#### `server/socket/socketHandler.js` - WebSocket Handler
Real-time event handling:
- **Authentication**: Validates socket connections with JWT tokens
- **Queue Management**: Manages waiting users for matching
- **Matching**: Finds compatible partners based on preferences
- **Chat**: Relays messages between matched users
- **WebRTC Signaling**: Forwards offer/answer/ICE candidates
- **Match Management**: Handles match creation and termination
- **Moderation**: Processes user reports and blocks

#### `server/services/matching.js` - Matching Algorithm
Partner matching service:
- **Queue System**: Maintains waiting users with preferences
- **Matching Logic**: 
  - Filters blocked users
  - Checks preference compatibility
  - Random selection from candidates
- **State Management**: Tracks active matches to prevent duplicates

#### `server/middleware/auth.js` - Authentication Middleware
Express middleware for route protection:
- Validates JWT tokens from Authorization header
- Attaches user object to request
- Returns 401 for invalid/missing tokens

### Type Definitions (`types.ts`)

- `UserIdentity`: Enum (Male, Female, Multiple)
- `PartnerPreference`: Enum (Male, Female, Everyone)
- `UserSettings`: User preferences object
- `ChatState`: Enum (idle, requesting_permissions, searching, connected, disconnected)
- `VerificationStatus`: Enum (idle, verifying, verified, mismatch)
- `ChatMessage`: Message object with id, text, sender
- `User`: User profile object
- `Partner`: Partner information object

### Constants (`constants.ts`)

- `PARTNER_VIDEOS`: Array of sample video URLs (for demo)
- `COUNTRIES`: List of all countries for filtering

## 🔧 Prerequisites

- **Node.js**: 18+ (LTS recommended)
- **npm**: Comes with Node.js (or use yarn/pnpm)
- **Git**: For cloning the repository
- **Termux** (Android): For mobile development (optional)

## 🚀 Setup and Build Instructions

### Standard Setup (Linux/macOS/Windows)

#### 1. Install Frontend Dependencies

```bash
npm install
```

#### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

#### 3. Configure Environment Variables

**Frontend** (optional - defaults work for local dev):
Create `.env` file in root:
```bash
VITE_API_URL=http://localhost:3001/api
VITE_WS_URL=http://localhost:3001
```

**Backend**:
Create `server/.env` file:
```bash
PORT=3001
CLIENT_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id_here  # Optional for mock auth
DATABASE_PATH=./data/connectsphere.db
```

#### 4. Build the Application

**Development Mode:**
```bash
# Terminal 1 - Backend Server
cd server
npm run dev

# Terminal 2 - Frontend
npm run dev
```

**Production Build:**
```bash
# Build frontend
npm run build

# Start backend
cd server
npm start

# Preview production build (optional)
npm run preview
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## 📱 Termux One-Line Build

For Android users using Termux, run this single command to install dependencies and build:

```bash
npm install && cd server && npm install && cd .. && npm run build && echo "✅ Build complete! Start server with: cd server && npm start"
```

**Or for development mode:**
```bash
npm install && cd server && npm install && cd .. && (cd server && npm run dev &) && npm run dev
```

**Complete Termux Setup (including Node.js installation if needed):**
```bash
pkg update && pkg install -y nodejs git && npm install && cd server && npm install && cd .. && npm run build && echo "✅ Build complete!"
```

**Note**: In Termux, you may need to:
1. Install Node.js: `pkg install nodejs`
2. Allow storage permissions: `termux-setup-storage`
3. For production, use `npm start` in the server directory
4. Access via `localhost:3000` on your device or use `ifconfig` to find your IP

## 📡 API Documentation

### Authentication Endpoints

- `POST /api/auth/google` - Authenticate with Google token
  ```json
  Request: { "token": "google_id_token", "identity": "male", "country": "USA" }
  Response: { "user": {...}, "token": "jwt_token", "expiresAt": "..." }
  ```

- `POST /api/auth/mock` - Mock authentication (development)
  ```json
  Request: { "email": "user@example.com", "name": "User", "identity": "male", "country": "Global" }
  Response: { "user": {...}, "token": "jwt_token", "expiresAt": "..." }
  ```

- `POST /api/auth/logout` - Logout
  ```json
  Headers: { "Authorization": "Bearer <token>" }
  Response: { "success": true }
  ```

- `GET /api/auth/verify` - Verify session token
  ```json
  Headers: { "Authorization": "Bearer <token>" }
  Response: { "user": {...} }
  ```

### User Endpoints

- `GET /api/users/me` - Get current user
  ```json
  Headers: { "Authorization": "Bearer <token>" }
  Response: { "user": { "id": "...", "name": "...", "email": "..." } }
  ```

- `PUT /api/users/me` - Update user settings
  ```json
  Headers: { "Authorization": "Bearer <token>" }
  Request: { "identity": "male", "country": "USA" }
  Response: { "user": {...} }
  ```

### WebSocket Events

See [server/README.md](server/README.md) for detailed WebSocket event documentation.

**Client → Server:**
- `authenticate` - Authenticate socket with token
- `join-queue` - Join matching queue
- `leave-queue` - Leave matching queue
- `send-message` - Send chat message
- `end-match` - End current match
- `report-user` - Report and block user

**Server → Client:**
- `match-found` - Match found notification
- `new-message` - New chat message received
- `match-ended` - Match ended notification

## 💡 Development Notes

### Database
- The backend uses SQLite by default, stored in `server/data/connectsphere.db`
- Database is automatically initialized on first server start
- Can be swapped for PostgreSQL by modifying `server/database/db.js`

### Authentication
- Mock authentication is enabled by default for easy development
- Google OAuth can be configured by setting `GOOGLE_CLIENT_ID` in `server/.env`
- Tokens are stored in localStorage on the frontend

### Gender Detection
- Gender detection is simulated (COCO-SSD doesn't detect gender)
- Architecture is ready for real gender detection models
- Detection runs in a Web Worker to avoid blocking the UI

### Video Matching
- Currently uses sample videos from Google Cloud Storage
- Architecture supports WebRTC - replace sample videos with real peer connections
- WebRTC signaling is implemented but not fully connected

### Security Considerations
- Always use HTTPS in production
- Implement rate limiting for API endpoints
- Add input validation and sanitization
- Use environment variables for sensitive data
- Implement proper CORS policies

### Performance Optimization
- Frontend uses Vite for fast HMR (Hot Module Replacement)
- Database queries use prepared statements
- Web Workers prevent UI blocking during ML inference
- Socket.io handles reconnection automatically

## 🐛 Known Issues & Limitations

- Gender detection is simulated (not real detection)
- Video matching uses sample videos (not real WebRTC)
- No rate limiting implemented
- SQLite may not scale for high concurrency (consider PostgreSQL)

## 📝 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For issues or feature requests, contact the project maintainers.

---

**Built with ❤️ using React, TypeScript, Node.js, and Socket.io**
