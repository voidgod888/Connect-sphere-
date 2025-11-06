<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ConnectSphere - Video Chat Application

A real-time video chat application similar to Omegle, built with React, TypeScript, Node.js, and WebRTC.

View your app in AI Studio: https://ai.studio/apps/drive/1ofeiJrs9NpD6RVASf3zfsigHOpHV4ncW

## Features

- 🔐 User authentication (Google OAuth + Mock for development)
- 🎥 Real-time video chat with partner matching
- 💬 WebSocket-based chat messaging
- 🎯 Partner preference filtering (gender-based)
- 🛡️ User reporting and blocking
- 📊 Gender detection using AI/ML
- 🌍 Country-based filtering

## Architecture

- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + Socket.io
- **Database**: SQLite (can be swapped for PostgreSQL)
- **Real-time**: WebSocket (Socket.io)
- **Video**: WebRTC (signaling via Socket.io)

## Prerequisites

- Node.js 18+ 
- npm or yarn

## Setup and Run

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
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Documentation

### Authentication Endpoints

- `POST /api/auth/google` - Authenticate with Google token
- `POST /api/auth/mock` - Mock authentication (for development)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify session token

### User Endpoints

- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user settings

### WebSocket Events

See [server/README.md](server/README.md) for detailed WebSocket event documentation.

## Development Notes

- The backend uses SQLite by default, stored in `server/data/connectsphere.db`
- Mock authentication is enabled by default for easy development
- Gender detection is simulated (COCO-SSD doesn't detect gender)
- Video matching currently uses sample videos; replace with WebRTC for production

## Bugs Fixed

- ✅ Fixed `stopChat` being called before definition in `handleLogout`
- ✅ Created complete backend server with authentication, matching, and chat
- ✅ Integrated frontend with backend API and WebSocket services
