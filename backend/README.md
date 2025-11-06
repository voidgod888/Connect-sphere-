# ConnectSphere Backend

Backend server for the ConnectSphere video chat application.

## Features

- **Google OAuth Authentication**: Secure user authentication via Google
- **WebRTC Signaling**: Real-time peer-to-peer video connection signaling
- **Smart Matching System**: Matches users based on preferences (gender, country)
- **Real-time Chat**: Socket.io powered instant messaging
- **Reporting & Blocking**: User moderation features
- **Session Management**: Persistent user sessions

## Tech Stack

- **Node.js** with **TypeScript**
- **Express.js** for REST API
- **Socket.io** for real-time communication
- **Passport.js** for authentication
- **Google OAuth 2.0** for user login

## Setup

### Prerequisites

- Node.js 18+ installed
- Google Cloud Project with OAuth 2.0 credentials

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

3. Configure your environment variables in `.env`:
   - Set your Google OAuth credentials
   - Update the session secret
   - Configure frontend URL if different

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
6. Copy the Client ID and Client Secret to your `.env` file

## Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Production

Build the TypeScript code:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## API Endpoints

### Authentication

- `GET /auth/google` - Initiate Google OAuth login
- `GET /auth/google/callback` - OAuth callback URL
- `GET /auth/user` - Get current user info (authenticated)
- `POST /auth/logout` - Logout current user (authenticated)

### API

- `GET /api/health` - Health check endpoint
- `GET /api/stats` - User statistics (authenticated)

### Socket.io Events

#### Client → Server

- `find-partner` - Search for a chat partner
- `webrtc-signal` - Send WebRTC signaling data
- `chat-message` - Send a chat message
- `disconnect-partner` - Disconnect from current partner
- `report-user` - Report a user

#### Server → Client

- `partner-found` - Partner match found
- `searching` - Added to matching queue
- `webrtc-signal` - Receive WebRTC signaling data
- `chat-message` - Receive a chat message
- `partner-disconnected` - Partner has disconnected
- `message-sent` - Message delivery confirmation
- `error` - Error message

## Architecture

```
backend/
├── src/
│   ├── config/          # Configuration files
│   │   └── passport.ts  # Passport authentication setup
│   ├── controllers/     # Route controllers
│   │   └── authController.ts
│   ├── middleware/      # Express middleware
│   │   └── auth.ts      # Authentication middleware
│   ├── models/          # Data models
│   │   └── User.ts      # User model
│   ├── routes/          # API routes
│   │   ├── auth.ts      # Authentication routes
│   │   └── api.ts       # General API routes
│   ├── services/        # Business logic
│   │   ├── MatchingService.ts  # User matching logic
│   │   └── SocketService.ts    # Socket.io event handlers
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   └── server.ts        # Main server file
├── .env.example         # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment mode | `development` |
| `FRONTEND_URL` | Frontend application URL | `http://localhost:5173` |
| `SESSION_SECRET` | Session encryption secret | (must be set) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | (must be set) |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | (must be set) |
| `GOOGLE_CALLBACK_URL` | OAuth callback URL | `http://localhost:3000/auth/google/callback` |

## Security Considerations

- Always use HTTPS in production
- Set a strong `SESSION_SECRET` in production
- Configure CORS properly for your frontend domain
- Keep your Google OAuth credentials secure
- Use environment-specific configurations

## License

MIT
