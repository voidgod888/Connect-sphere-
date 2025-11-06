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
- [API Documentation](#api-documentation)
- [WebSocket Events](#websocket-events)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Build Instructions](#build-instructions)
- [Termux Build (One-Line)](#termux-build-one-line)
- [Environment Configuration](#environment-configuration)
- [Development Notes](#development-notes)

## ✨ Features

- 🔐 **User Authentication** - Google OAuth + Mock authentication for development
- 🎥 **Real-time Video Chat** - Partner matching with video streaming
- 💬 **WebSocket-based Chat** - Real-time text messaging during video calls
- 🎯 **Partner Preference Filtering** - Gender-based matching (Male/Female/Everyone)
- 🛡️ **User Moderation** - Reporting and blocking functionality
- 📊 **AI Gender Detection** - ML-based gender verification using YOLO (simulated)
- 🌍 **Country-based Filtering** - Match users by country preference
- 📱 **Responsive Design** - Modern UI with toast notifications

## 🏗️ Architecture Overview

### Frontend Stack
- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Socket.io Client** - WebSocket communication
- **Lucide React** - Icon library

### Backend Stack
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - WebSocket server
- **SQLite (better-sqlite3)** - Database
- **Google Auth Library** - OAuth authentication

### Real-time Communication
- **WebSocket (Socket.io)** - Signaling and chat
- **WebRTC** - Peer-to-peer video (signaling implemented, currently using sample videos)

## 📁 Codebase Structure

```
/workspace
├── components/              # React UI components
│   ├── ChatHistory.tsx     # Chat message history display
│   ├── ChatInput.tsx       # Message input component
│   ├── ChatScreen.tsx      # Main chat interface
│   ├── Controls.tsx       # Video call controls (Next, Stop, Report)
│   ├── LoginScreen.tsx    # Authentication screen
│   ├── SettingsScreen.tsx # User preferences before starting chat
│   ├── Toast.tsx          # Toast notification component
│   └── VideoPlayer.tsx    # Video player component
├── services/               # Frontend services
│   ├── api.ts             # REST API client
│   ├── socketService.ts   # WebSocket client service
│   ├── yoloService.ts     # YOLO gender detection service
│   └── yolo.worker.ts     # Web Worker for YOLO processing
├── server/                 # Backend server
│   ├── database/
│   │   └── db.js          # SQLite database setup and queries
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   ├── routes/
│   │   ├── auth.js        # Authentication endpoints
│   │   └── users.js       # User management endpoints
│   ├── services/
│   │   └── matching.js    # Partner matching algorithm
│   ├── socket/
│   │   └── socketHandler.js # WebSocket event handlers
│   └── index.js           # Express server entry point
├── App.tsx                 # Main React application component
├── index.tsx              # React DOM entry point
├── index.html             # HTML template
├── types.ts               # TypeScript type definitions
├── constants.ts           # Application constants (videos, countries)
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript configuration
└── package.json           # Frontend dependencies

```

## 📚 Detailed Component Documentation

### Frontend Components

#### `App.tsx` - Main Application Component
**Purpose**: Root component managing application state and routing

**Key Responsibilities**:
- Authentication state management
- Chat state management (idle, searching, connected)
- Media stream handling (camera/microphone)
- Socket connection management
- Partner matching coordination
- Gender verification using YOLO service
- Toast notification system

**State Management**:
- `authState`: 'unauthenticated' | 'authenticated'
- `chatState`: 'idle' | 'requesting_permissions' | 'searching' | 'connected'
- `verificationStatus`: 'idle' | 'verifying' | 'verified' | 'mismatch'
- `localStream`: User's camera/microphone stream
- `remoteStream`: Partner's video stream
- `currentPartner`: Current matched partner info
- `messages`: Chat message history

**Key Functions**:
- `handleLogin()`: Mock authentication (can be extended for Google OAuth)
- `handleLogout()`: Cleanup and session termination
- `startChat()`: Initialize video permissions and start matching
- `findNext()`: Join matching queue and find new partner
- `stopChat()`: End current chat session
- `handleReport()`: Report and block abusive users
- `handleSendMessage()`: Send chat message via WebSocket

#### `LoginScreen.tsx`
**Purpose**: User authentication interface

**Features**:
- Mock login button (for development)
- Can be extended for Google OAuth integration
- Displays app branding

#### `SettingsScreen.tsx`
**Purpose**: User preference configuration before starting chat

**Settings**:
- **Identity**: Male, Female, or Multiple
- **Partner Preference**: Male, Female, or Everyone
- **Country**: Select from 200+ countries or "Global"

**Flow**: After settings are submitted, requests camera/microphone permissions

#### `ChatScreen.tsx`
**Purpose**: Main video chat interface

**Displays**:
- Local video feed (user's camera)
- Remote video feed (partner's video)
- Chat message history
- Verification status indicator
- Control buttons (Next, Stop, Report)

**States**:
- **Searching**: Shows "Searching for partner..." message
- **Connected**: Shows video feeds and chat interface
- **Verifying**: Gender verification in progress
- **Verified**: Partner verified, chat active
- **Mismatch**: Partner doesn't match preference, auto-searching next

#### `VideoPlayer.tsx`
**Purpose**: Video element wrapper with controls

**Features**:
- Auto-play handling
- Stream attachment
- Responsive sizing

#### `ChatHistory.tsx`
**Purpose**: Message history display

**Features**:
- Scrollable message list
- User vs Partner message styling
- Timestamp display (if available)

#### `ChatInput.tsx`
**Purpose**: Message input field

**Features**:
- Send button
- Enter key submission
- Input validation

#### `Controls.tsx`
**Purpose**: Chat control buttons

**Actions**:
- **Next**: Find new partner
- **Stop**: End chat session
- **Report**: Report and block current partner

#### `Toast.tsx`
**Purpose**: Toast notification system

**Types**: 'info' | 'success' | 'error' | 'warning'

**Features**:
- Auto-dismiss after duration
- Manual dismiss
- Stack multiple toasts

### Frontend Services

#### `services/api.ts` - REST API Client
**Purpose**: HTTP client for backend API communication

**Methods**:
- `authGoogle(token, identity?, country?)`: Google OAuth authentication
- `authMock(email, name?, identity?, country?)`: Mock authentication
- `logout()`: End session
- `verifySession()`: Check if session is valid
- `getCurrentUser()`: Get user profile
- `updateUserSettings(identity?, country?)`: Update preferences
- `healthCheck()`: Server health check

**Token Management**:
- Stores JWT token in localStorage
- Automatically includes token in Authorization header
- Handles token expiration

#### `services/socketService.ts` - WebSocket Client
**Purpose**: Real-time communication with backend

**Connection**:
- Connects to Socket.io server
- Authenticates with session token
- Handles reconnection

**Methods**:
- `connect()`: Establish WebSocket connection
- `disconnect()`: Close connection
- `joinQueue(preference, settings, callback)`: Join matching queue
- `leaveQueue()`: Leave matching queue
- `sendMessage(matchId, text, callback)`: Send chat message
- `endMatch(matchId, callback)`: End current match
- `reportUser(reportedId, reason?, matchId?, callback)`: Report user
- `sendOffer/Answer/IceCandidate()`: WebRTC signaling

**Event Listeners**:
- `onMatchFound()`: Partner matched
- `onMessage()`: New chat message received
- `onMatchEnded()`: Match ended
- `onOffer/Answer/IceCandidate()`: WebRTC signaling events

#### `services/yoloService.ts` - Gender Detection Service
**Purpose**: AI-based gender detection for partner verification

**Implementation**:
- Uses Web Worker for non-blocking processing
- Loads YOLO model (COCO-SSD) in background
- Processes video frames to detect gender
- Currently simulated (COCO-SSD doesn't detect gender)

**Methods**:
- `loadModel()`: Initialize YOLO model
- `detectGender(videoElement)`: Detect gender from video frame

**Note**: Gender detection is simulated. In production, you'd need a specialized gender detection model.

#### `services/yolo.worker.ts` - Web Worker
**Purpose**: Background processing for YOLO model

**Features**:
- Loads TensorFlow.js and COCO-SSD model
- Processes ImageBitmap from main thread
- Returns detection results

### Backend Components

#### `server/index.js` - Express Server
**Purpose**: Main server entry point

**Setup**:
- Creates HTTP server
- Initializes Socket.io
- Configures CORS
- Sets up routes
- Initializes database

**Port**: Default 3001 (configurable via PORT env var)

#### `server/database/db.js` - Database Layer
**Purpose**: SQLite database initialization and queries

**Tables**:
- `users`: User accounts (id, name, email, google_id, identity, country, created_at, last_seen)
- `sessions`: Active sessions (id, user_id, token, expires_at, created_at)
- `matches`: Match records (id, user1_id, user2_id, status, created_at, ended_at)
- `messages`: Chat messages (id, match_id, user_id, text, created_at)
- `blocks`: User blocks (id, user_id, blocked_id, created_at)
- `reports`: User reports (id, reporter_id, reported_id, reason, match_id, created_at)

**Query Methods**:
- User CRUD operations
- Session management
- Match tracking
- Message storage
- Block/report management

#### `server/routes/auth.js` - Authentication Routes
**Endpoints**:
- `POST /api/auth/google`: Google OAuth authentication
- `POST /api/auth/mock`: Mock authentication (development)
- `POST /api/auth/logout`: Logout and invalidate session
- `GET /api/auth/verify`: Verify session token

**Flow**:
1. Verify credentials (Google token or mock)
2. Find or create user
3. Create session
4. Return JWT token

#### `server/routes/users.js` - User Routes
**Endpoints**:
- `GET /api/users/me`: Get current user profile
- `PUT /api/users/me`: Update user settings (identity, country)

#### `server/services/matching.js` - Matching Service
**Purpose**: Partner matching algorithm

**Algorithm**:
1. Maintains queue of waiting users
2. Filters blocked users
3. Checks preference compatibility
4. Randomly selects from candidates
5. Creates match record

**Methods**:
- `addWaitingUser(userId, socketId, preference, settings)`: Add to queue
- `removeWaitingUser(userId)`: Remove from queue
- `findMatch(userId, preference, settings)`: Find compatible partner
- `getWaitingCount()`: Get queue size

#### `server/socket/socketHandler.js` - WebSocket Handler
**Purpose**: Real-time event handling

**Events Handled**:

**Client → Server**:
- `authenticate`: Authenticate socket connection
- `join-queue`: Join matching queue
- `leave-queue`: Leave queue
- `send-message`: Send chat message
- `offer`: WebRTC offer
- `answer`: WebRTC answer
- `ice-candidate`: WebRTC ICE candidate
- `end-match`: End current match
- `report-user`: Report and block user

**Server → Client**:
- `match-found`: Match found notification
- `new-message`: New chat message
- `match-ended`: Match ended
- `offer/answer/ice-candidate`: WebRTC signaling

**State Management**:
- Tracks active sockets
- Maps users to sockets
- Manages match pairs
- Handles disconnections

#### `server/middleware/auth.js` - Authentication Middleware
**Purpose**: Verify JWT tokens for protected routes

**Usage**: Applied to routes requiring authentication

## 🔌 API Documentation

### Authentication Endpoints

#### `POST /api/auth/google`
Authenticate with Google OAuth token.

**Request Body**:
```json
{
  "token": "google_id_token",
  "identity": "male" | "female" | "multiple",
  "country": "United States"
}
```

**Response**:
```json
{
  "user": {
    "id": "user_xxx",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "token": "session_token",
  "expiresAt": "2024-01-01T00:00:00.000Z"
}
```

#### `POST /api/auth/mock`
Mock authentication for development.

**Request Body**:
```json
{
  "email": "user@example.com",
  "name": "Demo User",
  "identity": "male",
  "country": "Global"
}
```

**Response**: Same as `/api/auth/google`

#### `POST /api/auth/logout`
Logout and invalidate session.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "success": true
}
```

#### `GET /api/auth/verify`
Verify session token.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "user": {
    "id": "user_xxx",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### User Endpoints

#### `GET /api/users/me`
Get current user profile.

**Headers**: `Authorization: Bearer <token>`

**Response**:
```json
{
  "user": {
    "id": "user_xxx",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### `PUT /api/users/me`
Update user settings.

**Headers**: `Authorization: Bearer <token>`

**Request Body**:
```json
{
  "identity": "male" | "female" | "multiple",
  "country": "United States"
}
```

**Response**: Same as `GET /api/users/me`

### Health Check

#### `GET /api/health`
Server health check.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 📡 WebSocket Events

### Client → Server Events

#### `authenticate`
Authenticate socket connection.

**Payload**: `token` (string)

**Callback**:
```json
{
  "success": true,
  "user": { ... }
}
```

#### `join-queue`
Join matching queue.

**Payload**:
```json
{
  "preference": "male" | "female" | "everyone",
  "settings": {
    "identity": "male" | "female" | "multiple",
    "country": "United States"
  }
}
```

**Callback**:
```json
{
  "success": true,
  "matched": true | false,
  "matchId": "match_xxx" // if matched
}
```

#### `leave-queue`
Leave matching queue.

**Payload**: None

#### `send-message`
Send chat message.

**Payload**:
```json
{
  "matchId": "match_xxx",
  "text": "Hello!"
}
```

**Callback**:
```json
{
  "success": true,
  "message": { ... }
}
```

#### `end-match`
End current match.

**Payload**:
```json
{
  "matchId": "match_xxx"
}
```

**Callback**:
```json
{
  "success": true
}
```

#### `report-user`
Report and block user.

**Payload**:
```json
{
  "reportedId": "user_xxx",
  "reason": "Inappropriate behavior",
  "matchId": "match_xxx"
}
```

**Callback**:
```json
{
  "success": true
}
```

### Server → Client Events

#### `match-found`
Match found notification.

**Payload**:
```json
{
  "matchId": "match_xxx",
  "partner": {
    "id": "user_xxx",
    "name": "Jane Doe"
  }
}
```

#### `new-message`
New chat message received.

**Payload**:
```json
{
  "id": "msg_xxx",
  "text": "Hello!",
  "sender": "partner",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

#### `match-ended`
Match ended notification.

**Payload**: None

## 📋 Prerequisites

- **Node.js** 18+ (for both frontend and backend)
- **npm** or **yarn** package manager
- **Camera and Microphone** (for video chat functionality)
- **Modern Browser** with WebRTC support (Chrome, Firefox, Edge)

## 🚀 Quick Start

### 1. Install Frontend Dependencies

```bash
npm install
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
cd ..
```

### 3. Configure Environment Variables

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

### 4. Run the Application

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001

## 🔨 Build Instructions

### Development Build

**Frontend**:
```bash
npm run dev
```

**Backend**:
```bash
cd server
npm run dev
```

### Production Build

**Frontend**:
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

**Backend**:
```bash
cd server
npm start
```

### Preview Production Build

```bash
npm run preview
```

This serves the production build locally for testing.

## 📱 Termux Build (One-Line)

For Android Termux users, here's a one-line command to set up and run the entire application:

```bash
cd /workspace && npm install && cd server && npm install && cd .. && (cd server && npm start &) && sleep 3 && npm run dev
```

**Or as a more robust script**:

```bash
cd /workspace && npm install && cd server && npm install && cd .. && echo "PORT=3001" > server/.env && echo "CLIENT_URL=http://localhost:3000" >> server/.env && (cd server && npm start &) && sleep 3 && npm run dev
```

**Note**: 
- Make sure you have Node.js installed in Termux: `pkg install nodejs`
- The backend will run on port 3001
- The frontend will run on port 3000
- Access via `http://localhost:3000` in Termux's browser or via port forwarding

**Termux Port Forwarding** (to access from your computer):
```bash
# In Termux, expose port 3000
ssh -R 3000:localhost:3000 your-computer-ip
```

## ⚙️ Environment Configuration

### Frontend Environment Variables

Create `.env` in project root:

```bash
VITE_API_URL=http://localhost:3001/api    # Backend API URL
VITE_WS_URL=http://localhost:3001         # WebSocket server URL
```

### Backend Environment Variables

Create `server/.env`:

```bash
PORT=3001                                  # Server port
CLIENT_URL=http://localhost:3000          # Frontend URL (for CORS)
GOOGLE_CLIENT_ID=your_client_id           # Google OAuth Client ID (optional)
DATABASE_PATH=./data/connectsphere.db     # SQLite database path
```

## 📝 Development Notes

### Current Limitations

1. **Video Streaming**: Currently uses sample videos instead of real WebRTC peer-to-peer streaming. WebRTC signaling is implemented but not fully connected.

2. **Gender Detection**: Gender detection is simulated. COCO-SSD model doesn't actually detect gender. In production, you'd need a specialized gender detection model.

3. **Database**: Uses SQLite by default. Can be swapped for PostgreSQL/MySQL for production.

4. **Authentication**: Mock authentication is enabled by default. Google OAuth requires proper client ID configuration.

### Production Considerations

1. **Replace Sample Videos**: Implement full WebRTC peer-to-peer video streaming
2. **Real Gender Detection**: Integrate a proper gender detection ML model
3. **Database Migration**: Switch to PostgreSQL for better scalability
4. **HTTPS**: Required for WebRTC and camera access in production
5. **STUN/TURN Servers**: Configure for NAT traversal in WebRTC
6. **Rate Limiting**: Add rate limiting to prevent abuse
7. **Monitoring**: Add logging and monitoring (e.g., Winston, Sentry)
8. **Security**: Implement CSRF protection, input validation, and sanitization

### Known Issues Fixed

- ✅ Fixed `stopChat` being called before definition in `handleLogout`
- ✅ Created complete backend server with authentication, matching, and chat
- ✅ Integrated frontend with backend API and WebSocket services
- ✅ Proper cleanup of media streams and socket connections

## 🐛 Troubleshooting

### Camera/Microphone Not Working
- Ensure you're using HTTPS (or localhost for development)
- Check browser permissions for camera/microphone
- Verify camera/microphone are not being used by another application

### Socket Connection Failed
- Verify backend server is running on port 3001
- Check `VITE_WS_URL` environment variable
- Ensure CORS is properly configured

### Database Errors
- Ensure `server/data/` directory exists
- Check file permissions for database file
- Verify SQLite is properly installed

### Build Errors
- Clear `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check Node.js version (requires 18+)
- Verify all environment variables are set correctly

## 📄 License

This project is part of the ConnectSphere application.

## 🤝 Contributing

Contributions are welcome! Please ensure:
1. Code follows TypeScript best practices
2. Components are properly typed
3. Error handling is implemented
4. Tests are added for new features

---

**Built with ❤️ using React, TypeScript, Node.js, and Socket.io**
