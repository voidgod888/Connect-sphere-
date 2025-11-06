# Quick Start Guide

This guide will help you get ConnectSphere running locally in under 5 minutes.

## Step 1: Install Dependencies

### Backend
```bash
cd backend
npm install
```

### Frontend
```bash
cd ..  # back to root
npm install
```

## Step 2: Setup Google OAuth

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Google+ API"
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add these URIs:
   - Authorized JavaScript origins: `http://localhost:5173`
   - Authorized redirect URIs: `http://localhost:3000/auth/google/callback`
7. Copy your Client ID and Client Secret

## Step 3: Configure Backend

```bash
cd backend
cp .env.example .env
```

Edit `.env` and add your Google OAuth credentials:
```
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
```

## Step 4: Start the Servers

### Terminal 1 - Backend
```bash
cd backend
npm run dev
```

Wait until you see: `🚀 ConnectSphere backend server running on port 3000`

### Terminal 2 - Frontend
```bash
npm run dev
```

Wait until you see: `Local: http://localhost:5173/`

## Step 5: Open in Browser

1. Open `http://localhost:5173`
2. Click "Sign in with Google"
3. Authorize the app
4. Set your preferences
5. Click "Start Chatting"
6. Allow camera/microphone when prompted

## Testing with Multiple Users

To test the matching system:

1. Open `http://localhost:5173` in a regular browser window
2. Open `http://localhost:5173` in an incognito/private window
3. Sign in with different Google accounts in each
4. Start chatting in both windows
5. They should match and connect!

## Troubleshooting

### "Not authenticated" error
- Make sure backend is running
- Clear browser cookies
- Try signing in again

### Camera/microphone not working
- Check browser permissions
- Use HTTPS or localhost only
- Try a different browser

### Can't find partner
- Open a second browser window/tab
- Sign in with a different account
- Make sure preferences are compatible

### Backend crashes on start
- Check if port 3000 is available
- Verify Google OAuth credentials are correct
- Check `.env` file format

### Frontend build errors
- Delete `node_modules` and run `npm install` again
- Make sure you're using Node.js 18+
- Check that all environment variables are set

## Next Steps

- Read the full [README.md](./README.md) for detailed documentation
- Check [backend/README.md](./backend/README.md) for API documentation
- Customize the UI in `/components` directory
- Add more features!

## Common Issues

**Issue**: OAuth redirect doesn't work
**Solution**: Make sure the redirect URI in Google Console exactly matches `http://localhost:3000/auth/google/callback`

**Issue**: WebRTC connection fails
**Solution**: Both users need to be on secure connections (HTTPS or localhost). Some corporate networks block WebRTC.

**Issue**: Partner verification shows "mismatch"
**Solution**: Gender detection is currently simulated. To disable it, select "Everyone" as your preference.

## Production Deployment

For production deployment:
1. Set up HTTPS (required for WebRTC)
2. Use a TURN server for better connectivity
3. Update all URLs in environment variables
4. Set strong SESSION_SECRET
5. Configure CORS properly
6. Consider using Redis for sessions
7. Add rate limiting
8. Use a database for user persistence

See README.md for more deployment details.
