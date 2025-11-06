<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ConnectSphere - Video Chat Application

A modern video chat application to connect with people from around the world, featuring advanced filtering options, real-time WebRTC video connections, and a superior user interface.

## Features

- 🔐 **Google OAuth Authentication** - Secure user authentication
- 🎥 **Real-time Video Chat** - WebRTC peer-to-peer video connections
- 💬 **Instant Messaging** - Real-time text chat with Socket.io
- 🎯 **Smart Matching** - Filter by gender and country preferences
- 🤖 **AI Gender Detection** - YOLO-based partner verification (demo mode)
- 🚫 **Reporting & Blocking** - User safety features
- 🎨 **Modern UI** - Beautiful, responsive interface

## Tech Stack

### Frontend
- React 19 with TypeScript
- Vite for fast development
- Socket.io Client for real-time communication
- WebRTC for video/audio streaming
- TensorFlow.js with COCO-SSD for AI detection
- Tailwind CSS for styling
- Lucide React for icons

### Backend
- Node.js with TypeScript
- Express.js for REST API
- Socket.io for WebSocket communication
- Passport.js with Google OAuth 2.0
- In-memory data storage (can be extended to use Redis/Database)

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Google Cloud Project with OAuth 2.0 credentials
- Modern browser with WebRTC support

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from the example:
```bash
cp .env.example .env
```

4. Configure your `.env` file with:
   - Google OAuth credentials (see backend/README.md for details)
   - Session secret
   - Frontend URL

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to the project root (if in backend, go back):
```bash
cd ..
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` file:
```bash
cp .env.example .env.local
```

4. Configure the backend API URL in `.env.local`:
```
VITE_API_URL=http://localhost:3000
```

5. Start the frontend development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

### Google OAuth Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - Development: `http://localhost:3000/auth/google/callback`
   - Production: `https://yourdomain.com/auth/google/callback`
6. Add authorized JavaScript origins:
   - Development: `http://localhost:5173`
   - Production: `https://yourdomain.com`
7. Copy Client ID and Secret to backend `.env`

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:5173` in your browser
3. Click "Sign in with Google"
4. Set your preferences (identity, partner preference, country)
5. Click "Start Chatting"
6. Allow camera and microphone permissions
7. Wait to be matched with a partner
8. Enjoy video chatting!

### Controls

- 🎤 Mute/Unmute microphone
- 📹 Turn camera on/off
- ⏭️ Skip to next partner
- 🚫 Report and block user
- ☎️ Stop chat session

## Project Structure

```
/
├── backend/              # Backend server
│   ├── src/
│   │   ├── config/      # Configuration (Passport, etc.)
│   │   ├── controllers/ # Route controllers
│   │   ├── middleware/  # Express middleware
│   │   ├── models/      # Data models
│   │   ├── routes/      # API routes
│   │   ├── services/    # Business logic
│   │   ├── types/       # TypeScript types
│   │   └── server.ts    # Main server file
│   ├── package.json
│   └── tsconfig.json
├── components/          # React components
│   ├── ChatHistory.tsx
│   ├── ChatInput.tsx
│   ├── ChatScreen.tsx
│   ├── Controls.tsx
│   ├── LoginScreen.tsx
│   ├── SettingsScreen.tsx
│   └── VideoPlayer.tsx
├── services/            # Frontend services
│   ├── apiService.ts    # API calls
│   ├── socketService.ts # Socket.io client
│   ├── webrtcService.ts # WebRTC handling
│   ├── yoloService.ts   # AI detection service
│   └── yolo.worker.ts   # Web Worker for AI
├── App.tsx              # Main app component
├── types.ts             # TypeScript types
├── constants.ts         # Constants
├── index.tsx            # React entry point
├── index.html
├── package.json
└── vite.config.ts
```

## Architecture

### WebRTC Flow
1. User A and User B get matched by the backend
2. Backend notifies both users via Socket.io
3. User A creates WebRTC offer and sends via Socket.io
4. User B receives offer, creates answer, sends back
5. ICE candidates exchanged for NAT traversal
6. Peer-to-peer connection established
7. Video/audio streams flow directly between users

### Matching Algorithm
- Users enter a waiting queue with their preferences
- Backend matches users based on:
  - Gender preferences (mutual compatibility)
  - Country preferences (if specified)
  - Blocked users list
- Real-time notifications via Socket.io

## Security Features

- Google OAuth authentication required
- Session-based authentication with secure cookies
- User reporting and blocking system
- CORS protection
- Rate limiting (can be added)
- Input validation
- WebRTC encrypted connections

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 14+
- Edge 80+

WebRTC and modern JavaScript features required.

## Known Limitations

- Gender detection is simulated (COCO-SSD detects people, not gender)
- In-memory storage (users cleared on server restart)
- No persistent chat history
- STUN servers only (TURN server recommended for production)

## Future Enhancements

- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Redis for session storage
- [ ] Real gender detection model
- [ ] Chat history persistence
- [ ] File/image sharing
- [ ] Group video calls
- [ ] User profiles
- [ ] Friend system
- [ ] TURN server for better connectivity
- [ ] Mobile app (React Native)

## Development

### Frontend Development
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### Backend Development
```bash
cd backend
npm run dev      # Start with hot reload
npm run build    # Build TypeScript
npm start        # Start production server
```

## Deployment

### Frontend
Can be deployed to:
- Vercel
- Netlify
- AWS S3 + CloudFront
- Any static hosting

### Backend
Can be deployed to:
- Heroku
- AWS EC2/ECS
- DigitalOcean
- Railway
- Render

**Important**: Update environment variables for production URLs and use HTTPS.

## Contributing

Contributions welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use for personal or commercial projects.

## Support

For issues or questions:
- Open a GitHub issue
- Check the documentation in `/backend/README.md`

## Acknowledgments

- Google for OAuth services
- TensorFlow.js and COCO-SSD for AI detection
- Socket.io for real-time communication
- WebRTC for peer-to-peer video

---

Built with ❤️ by the ConnectSphere team
