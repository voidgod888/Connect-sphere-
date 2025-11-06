# ConnectSphere - Setup Checklist

Use this checklist to ensure your ConnectSphere installation is complete and ready to use.

---

## ✅ Pre-Installation Checklist

### System Requirements
- [ ] Node.js 18+ installed
  - Check: `node --version`
  - If not installed: Visit https://nodejs.org/
- [ ] npm or yarn installed
  - Check: `npm --version`
- [ ] Git installed (optional, for version control)
  - Check: `git --version`

### Browser Requirements
- [ ] Modern browser with WebRTC support:
  - Chrome 80+
  - Firefox 75+
  - Safari 14+
  - Edge 80+

---

## 📦 Installation Checklist

### Backend Setup
- [ ] Navigate to backend directory
  ```bash
  cd backend
  ```
- [ ] Install backend dependencies
  ```bash
  npm install
  ```
- [ ] Verify backend dependencies installed
  - Check: `ls node_modules` (should show many packages)
- [ ] Copy `.env.example` to `.env`
  ```bash
  cp .env.example .env
  ```
- [ ] `.env` file exists
  - Check: `ls -la .env`

### Frontend Setup
- [ ] Navigate to project root
  ```bash
  cd ..
  ```
- [ ] Install frontend dependencies
  ```bash
  npm install
  ```
- [ ] Verify frontend dependencies installed
  - Check: `ls node_modules` (should show many packages)
- [ ] Copy `.env.example` to `.env.local`
  ```bash
  cp .env.example .env.local
  ```
- [ ] `.env.local` file exists
  - Check: `ls -la .env.local`

### Quick Installation (Alternative)
- [ ] Run automated installation script
  ```bash
  chmod +x install-all.sh
  ./install-all.sh
  ```

---

## 🔐 Google OAuth Configuration Checklist

### Google Cloud Console Setup
- [ ] Visit https://console.cloud.google.com/
- [ ] Create new project (or select existing)
  - Project name: ConnectSphere (or your choice)
- [ ] Enable APIs
  - [ ] Google+ API enabled
- [ ] Create OAuth 2.0 credentials
  - [ ] Go to "Credentials" → "Create Credentials" → "OAuth client ID"
  - [ ] Application type: Web application
  - [ ] Name: ConnectSphere

### OAuth URLs Configuration
- [ ] Add Authorized JavaScript origins:
  - [ ] `http://localhost:5173` (development)
  - [ ] Your production frontend URL (if deploying)
  
- [ ] Add Authorized redirect URIs:
  - [ ] `http://localhost:3000/auth/google/callback` (development)
  - [ ] Your production backend URL + `/auth/google/callback` (if deploying)

### Copy Credentials
- [ ] Copy Client ID
- [ ] Copy Client Secret
- [ ] Keep credentials secure (never commit to Git!)

### Update Backend .env File
Edit `backend/.env` and set:
- [ ] `GOOGLE_CLIENT_ID=your_client_id_here`
- [ ] `GOOGLE_CLIENT_SECRET=your_client_secret_here`
- [ ] `GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback`
- [ ] `SESSION_SECRET=a_random_secret_key` (change from default!)
- [ ] `FRONTEND_URL=http://localhost:5173`
- [ ] `PORT=3000`

**Example `.env` file:**
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=change-this-to-a-random-secret-in-production
GOOGLE_CLIENT_ID=123456789-abc123def456.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abc123def456
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback
```

---

## 🚀 Running the Application Checklist

### Start Backend Server
- [ ] Open Terminal 1
- [ ] Navigate to backend directory
  ```bash
  cd backend
  ```
- [ ] Start backend server
  ```bash
  npm run dev
  ```
- [ ] Verify backend is running
  - [ ] See message: "🚀 ConnectSphere backend server running on port 3000"
  - [ ] No errors displayed
- [ ] Test backend endpoint
  - [ ] Open browser: http://localhost:3000
  - [ ] See JSON response with API info

### Start Frontend Server
- [ ] Open Terminal 2 (new terminal)
- [ ] Navigate to project root
  ```bash
  cd /workspace
  ```
- [ ] Start frontend server
  ```bash
  npm run dev
  ```
- [ ] Verify frontend is running
  - [ ] See message: "Local: http://localhost:5173/"
  - [ ] No errors displayed
- [ ] Frontend compiles successfully

### Quick Start (Alternative)
- [ ] Run development script
  ```bash
  chmod +x start-dev.sh
  ./start-dev.sh
  ```
- [ ] Both servers start automatically

---

## 🧪 Testing Checklist

### Initial Load Test
- [ ] Open browser: http://localhost:5173
- [ ] Page loads without errors
- [ ] See "Welcome to ConnectSphere" heading
- [ ] See "Sign in with Google" button

### Authentication Test
- [ ] Click "Sign in with Google"
- [ ] Redirected to Google OAuth page
- [ ] See correct app name
- [ ] Select Google account
- [ ] Grant permissions
- [ ] Redirected back to ConnectSphere
- [ ] See "Welcome, [Your Name]!" in header
- [ ] See "Logout" button
- [ ] See settings screen with preferences

### Single User Test
- [ ] Set identity (Male/Female/Multiple)
- [ ] Set partner preference
- [ ] Select country
- [ ] Click "Start Chatting"
- [ ] Browser prompts for camera/microphone access
- [ ] Allow camera and microphone
- [ ] See local video feed in corner
- [ ] See "Searching for a partner..." message
- [ ] App enters waiting state (normal - need 2nd user)

### Multi-User Test (Required)
#### Browser Window 1 (Regular)
- [ ] Open http://localhost:5173
- [ ] Sign in with Google Account A
- [ ] Set preferences
- [ ] Click "Start Chatting"
- [ ] Allow camera/microphone
- [ ] Wait on "Searching..." screen

#### Browser Window 2 (Incognito/Private)
- [ ] Open incognito/private window
- [ ] Go to http://localhost:5173
- [ ] Sign in with Google Account B (different account!)
- [ ] Set compatible preferences
  - If User A is "looking for Male", User B should be "Male"
  - Or both select "Everyone"
- [ ] Click "Start Chatting"
- [ ] Allow camera/microphone

#### Connection Test
- [ ] Both users should match within 2 seconds
- [ ] Both see "Partner found" notification
- [ ] Video feeds establish
  - [ ] User A sees User B's video
  - [ ] User B sees User A's video
- [ ] Both see their own local video in corner

### Feature Testing

#### Video Controls
- [ ] Click microphone button
  - [ ] Icon changes to muted
  - [ ] Audio muted locally
- [ ] Click camera button
  - [ ] Video turns off/on
  - [ ] Partner sees the change
- [ ] Click stop button
  - [ ] Return to settings screen
  - [ ] Video/audio released

#### Chat Testing
- [ ] Type message in chat
- [ ] Click send button
- [ ] Message appears in your chat
- [ ] Partner receives message
- [ ] Partner replies
- [ ] You receive partner's message

#### Report/Block Testing
- [ ] Click report button (flag icon)
- [ ] See "Partner has been reported and blocked" message
- [ ] Partner gets disconnected
- [ ] Cannot be matched with same user again

#### Find Next Partner
- [ ] While connected, click "Next" button (skip forward icon)
- [ ] Current connection ends
- [ ] Return to searching
- [ ] Find new partner (if available)

### Error Handling Tests
- [ ] Try to access without logging in
  - [ ] Redirected to login screen
- [ ] Deny camera/microphone permission
  - [ ] See appropriate error message
- [ ] Close partner's browser
  - [ ] See "Partner disconnected" message
  - [ ] Can find next partner

---

## 🔍 Troubleshooting Checklist

### Backend Won't Start
- [ ] Check port 3000 is available
  ```bash
  lsof -i :3000
  ```
- [ ] Kill process if needed
  ```bash
  kill -9 [PID]
  ```
- [ ] Check `.env` file exists
- [ ] Check Google credentials are correct
- [ ] Check for syntax errors in console
- [ ] Try deleting `node_modules` and reinstalling
  ```bash
  cd backend
  rm -rf node_modules
  npm install
  ```

### Frontend Won't Start
- [ ] Check port 5173 is available
- [ ] Check `.env.local` file exists
- [ ] Check `VITE_API_URL` is set correctly
- [ ] Try deleting `node_modules` and reinstalling
  ```bash
  rm -rf node_modules
  npm install
  ```
- [ ] Clear Vite cache
  ```bash
  rm -rf node_modules/.vite
  ```

### OAuth Not Working
- [ ] Google Console: Check OAuth credentials
- [ ] Check redirect URI matches exactly
  - Must be: `http://localhost:3000/auth/google/callback`
- [ ] Check JavaScript origins includes: `http://localhost:5173`
- [ ] Try in incognito mode (clear cookies)
- [ ] Check backend `.env` has correct credentials
- [ ] Backend console should show OAuth route hit

### Can't Find Partner
- [ ] Need at least 2 users online
- [ ] Check preferences are compatible
  - Male looking for Male + Male user
  - Female looking for Female + Female user
  - Or both select "Everyone"
- [ ] Check country filters
  - Both select "Global" for easiest matching
- [ ] Check both users completed settings
- [ ] Check backend console for matching logs

### Video Not Working
- [ ] Camera/microphone permissions granted?
- [ ] Try different browser
- [ ] Check camera works in other apps
- [ ] Check browser console for errors
- [ ] Try HTTPS instead of HTTP (WebRTC requirement)
- [ ] Check firewall/antivirus settings

### Chat Not Working
- [ ] Check Socket.io connection
  - Should see in browser console: "Socket connected"
- [ ] Check backend is receiving messages
  - Backend console should show message events
- [ ] Try refreshing both browsers

---

## 📝 Configuration Verification

### Backend Configuration
```bash
cd backend
cat .env
```
Should see:
- [x] GOOGLE_CLIENT_ID (set to your Client ID)
- [x] GOOGLE_CLIENT_SECRET (set to your Client Secret)
- [x] SESSION_SECRET (changed from default)
- [x] FRONTEND_URL=http://localhost:5173
- [x] PORT=3000

### Frontend Configuration
```bash
cat .env.local
```
Should see:
- [x] VITE_API_URL=http://localhost:3000

---

## 🎉 Success Criteria

Your installation is successful if:

- [x] Backend starts without errors
- [x] Frontend starts without errors
- [x] Can sign in with Google
- [x] Can set preferences
- [x] Camera/microphone permissions work
- [x] Two users can find each other
- [x] Video connection establishes
- [x] Chat messages send/receive
- [x] All controls work (mute, camera, next, report, stop)

---

## 🚀 Ready for Development!

If all checks pass:
- ✅ Your ConnectSphere installation is complete
- ✅ You can start developing
- ✅ Ready to add custom features
- ✅ Can deploy to production (with HTTPS and production configs)

---

## 📚 Next Steps

After successful setup:

1. **Read Documentation**
   - [x] README.md - Full project guide
   - [x] QUICKSTART.md - Quick reference
   - [x] backend/README.md - API documentation

2. **Explore Code**
   - [x] Check `/backend/src` structure
   - [x] Review `/components` directory
   - [x] Understand `/services` layer

3. **Customize**
   - [ ] Modify UI in components
   - [ ] Add new features
   - [ ] Customize matching algorithm
   - [ ] Add database integration

4. **Deploy**
   - [ ] Set up HTTPS
   - [ ] Configure production environment
   - [ ] Deploy backend to cloud
   - [ ] Deploy frontend to CDN

---

## 💡 Tips

- Keep both terminals open while developing
- Use browser DevTools to debug
- Check backend console for server logs
- Use incognito windows for multi-user testing
- Clear cookies if authentication issues occur
- Restart servers after environment changes

---

## 🆘 Getting Help

If you're stuck:
1. Check this checklist again
2. Read error messages carefully
3. Check browser console (F12)
4. Check backend terminal logs
5. Review documentation files
6. Verify Google OAuth setup
7. Try with fresh terminal/browser

---

**Last Updated**: 2025-11-06
**Status**: ✅ Setup Guide Complete
